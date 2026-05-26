import { dataset } from "@/lib/setship/data";
import type {
  AgentStep,
  DecisionOption,
  EvaluationResponse,
  InventoryCell,
  InventoryMatrixRow,
  LaneRecord,
  NodeRecord,
  OrderSummary,
  RequiredComponent,
  RiskLevel,
  ScoredOption,
  SupplierRecord,
} from "@/lib/setship/types";

const FIXED_MATRIX_NODE_IDS = ["CG_NJ", "CG_KY", "SUP_A", "SUP_B"];

function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function diffDays(from: string, to: string) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (parseDate(to).getTime() - parseDate(from).getTime()) / millisecondsPerDay,
  );
}

function clampScore(score: number) {
  return Math.max(0, Math.min(99, Math.round(score)));
}

function availableQuantity(nodeId: string, componentSku: string) {
  const record = dataset.inventory.find(
    (entry) =>
      entry.node_id === nodeId && entry.component_sku === componentSku,
  );

  if (!record) {
    return { available: 0, lastUpdateHoursAgo: null };
  }

  return {
    available: Math.max(0, record.on_hand - record.reserved),
    lastUpdateHoursAgo: record.last_update_hours_ago,
  };
}

function getLane(fromNode: string, toNode: string) {
  return (
    dataset.lanes.find(
      (lane) => lane.from_node === fromNode && lane.to_node === toNode,
    ) ?? null
  );
}

function getSupplier(nodeId: string) {
  return dataset.suppliers.find((supplier) => supplier.supplier_id === nodeId);
}

function getNode(nodeId: string) {
  return dataset.nodes.find((node) => node.node_id === nodeId) ?? null;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  return "high";
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function listOrders(): OrderSummary[] {
  return dataset.orders.map((order) => ({
    order_id: order.order_id,
    customer_region: order.customer_region,
    promise_date: order.promise_date,
    set_sku: order.set_sku,
    priority: order.priority,
  }));
}

export function orderIntakeAgent(orderId: string) {
  const order = dataset.orders.find((entry) => entry.order_id === orderId);

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const requiredComponents: RequiredComponent[] = dataset.bom
    .filter((entry) => entry.set_sku === order.set_sku)
    .map((entry) => {
      const component = dataset.components.find(
        (candidate) => candidate.component_sku === entry.component_sku,
      );

      if (!component) {
        throw new Error(`Component ${entry.component_sku} not found`);
      }

      return {
        component_sku: entry.component_sku,
        component_name: component.component_name,
        qty_required: entry.qty_required * order.qty_sets,
        component_role: entry.component_role,
        must_ship_together: entry.must_ship_together,
        large_parcel: component.large_parcel,
        fragile: component.fragile,
      };
    });

  const preferredNode = getNode(order.preferred_node);
  const customerNode = getNode(order.customer_zone);

  if (!preferredNode || !customerNode) {
    throw new Error(`Order ${orderId} is missing node metadata`);
  }

  return {
    order,
    preferredNode,
    customerNode,
    requiredComponents,
    daysUntilPromise: diffDays(dataset.policy.current_date, order.promise_date),
  };
}

export function componentAvailabilityAgent(orderContext: ReturnType<typeof orderIntakeAgent>) {
  const fallbackCastleGateNodes = dataset.nodes.filter(
    (node) =>
      node.node_type === "CastleGate" && node.node_id !== orderContext.order.preferred_node,
  );
  const supplierNodes = dataset.nodes.filter((node) => node.node_type === "Supplier");

  const matrixNodeIds = unique([
    ...FIXED_MATRIX_NODE_IDS,
    orderContext.order.preferred_node,
    ...fallbackCastleGateNodes.map((node) => node.node_id),
    ...supplierNodes.map((node) => node.node_id),
  ]);

  const matrixNodes = matrixNodeIds
    .map((nodeId) => getNode(nodeId))
    .filter((node): node is NodeRecord => node !== null);

  const matrixRows: InventoryMatrixRow[] = orderContext.requiredComponents.map(
    (component) => {
      const preferredAvailability = availableQuantity(
        orderContext.order.preferred_node,
        component.component_sku,
      );

      const fallbackAvailability = fallbackCastleGateNodes
        .map((node) => ({
          node,
          ...availableQuantity(node.node_id, component.component_sku),
        }))
        .filter((entry) => entry.available > 0);

      const cells: InventoryCell[] = matrixNodes.map((node) => {
        const inventory = availableQuantity(node.node_id, component.component_sku);
        const stale =
          node.node_type === "Supplier" &&
          (inventory.lastUpdateHoursAgo ?? 0) >
            dataset.policy.stale_feed_threshold_hours;

        let status: InventoryCell["status"] = "unavailable";
        if (inventory.available >= component.qty_required) {
          status = "sufficient";
        } else if (inventory.available > 0) {
          status = "partial";
        } else {
          status = "missing";
        }

        return {
          node_id: node.node_id,
          available: inventory.available,
          last_update_hours_ago: inventory.lastUpdateHoursAgo,
          stale,
          status,
        };
      });

      return {
        component_sku: component.component_sku,
        component_name: component.component_name,
        qty_required: component.qty_required,
        is_missing: preferredAvailability.available < component.qty_required,
        is_bottleneck:
          preferredAvailability.available < component.qty_required &&
          fallbackAvailability.length > 0,
        large_parcel: component.large_parcel,
        fragile: component.fragile,
        cells,
      };
    },
  );

  const missingComponents = matrixRows.filter((row) => row.is_missing);
  const bottleneckComponents = matrixRows.filter((row) => row.is_bottleneck);

  return {
    matrixNodes,
    matrixRows,
    missingComponents,
    bottleneckComponents,
  };
}

function scoreOption(args: {
  option: DecisionOption;
  delayDays: number;
  extraCost: number;
  staleSupplierFeedFlag: number;
  splitShipmentFlag: number;
  largeParcelDamageRiskFlag: number;
  meetsPromiseDateFlag: number;
  consolidatedFlag: number;
  supplierPenalty: number;
  valid: boolean;
  details: string;
}) {
  const policy = dataset.policy;
  const rawScore =
    100 -
    policy.delay_penalty_per_day * args.delayDays -
    policy.cost_penalty_per_dollar * args.extraCost -
    policy.stale_supplier_feed_penalty * args.staleSupplierFeedFlag -
    policy.split_shipment_penalty * args.splitShipmentFlag -
    policy.large_parcel_damage_penalty_multiplier *
      args.largeParcelDamageRiskFlag +
    policy.promise_date_bonus * args.meetsPromiseDateFlag +
    policy.consolidated_shipment_bonus * args.consolidatedFlag -
    args.supplierPenalty;

  const score = args.valid ? clampScore(rawScore) : 0;

  return {
    option: args.option,
    score,
    delay_days: args.delayDays,
    extra_cost: args.extraCost,
    risk: getRiskLevel(score),
    valid: args.valid,
    meets_promise_date: Boolean(args.meetsPromiseDateFlag),
    details: args.details,
  } satisfies ScoredOption;
}

function getSupplierCandidates(componentSku: string) {
  return dataset.inventory
    .filter((entry) => entry.node_type === "Supplier" && entry.component_sku === componentSku)
    .map((entry) => ({
      supplier: getSupplier(entry.node_id),
      available: Math.max(0, entry.on_hand - entry.reserved),
      lastUpdateHoursAgo: entry.last_update_hours_ago,
      nodeId: entry.node_id,
    }))
    .filter(
      (
        candidate,
      ): candidate is {
        supplier: SupplierRecord;
        available: number;
        lastUpdateHoursAgo: number;
        nodeId: string;
      } => candidate.available > 0 && Boolean(candidate.supplier),
    )
    .sort((left, right) => left.lastUpdateHoursAgo - right.lastUpdateHoursAgo);
}

function getCastleGateAlternatives(componentSku: string, preferredNodeId: string) {
  return dataset.inventory
    .filter(
      (entry) =>
        entry.node_type === "CastleGate" &&
        entry.node_id !== preferredNodeId &&
        entry.component_sku === componentSku &&
        entry.on_hand - entry.reserved > 0,
    )
    .map((entry) => ({
      nodeId: entry.node_id,
      available: entry.on_hand - entry.reserved,
      lane: getLane(entry.node_id, preferredNodeId),
    }))
    .filter(
      (
        option,
      ): option is { nodeId: string; available: number; lane: LaneRecord } =>
        option.available > 0 && option.lane !== null,
    )
    .sort((left, right) => left.lane.transit_days - right.lane.transit_days);
}

function supplierPenaltyFor(supplier: SupplierRecord | null) {
  if (!supplier) return 0;
  if (supplier.risk_tier === "high") return dataset.policy.supplier_high_risk_penalty;
  if (supplier.risk_tier === "medium") return dataset.policy.supplier_medium_risk_penalty;
  return 0;
}

function linkedInboundPos(orderId: string, componentSku: string) {
  return dataset.inboundPos
    .filter(
      (entry) => entry.linked_order_id === orderId && entry.component_sku === componentSku,
    )
    .sort((left, right) => diffDays(left.eta_date, right.eta_date));
}

export function riskScoringAgent(
  orderContext: ReturnType<typeof orderIntakeAgent>,
  availability: ReturnType<typeof componentAvailabilityAgent>,
) {
  const missingComponents = availability.missingComponents;
  const finalMileLane = getLane(
    orderContext.order.preferred_node,
    orderContext.order.customer_zone,
  );

  if (!finalMileLane) {
    throw new Error(`Missing final-mile lane for ${orderContext.order.order_id}`);
  }

  const hasLargeParcel = orderContext.requiredComponents.some(
    (component) => component.large_parcel,
  );
  const hasFragile = orderContext.requiredComponents.some((component) => component.fragile);

  const holdDelayDays = Math.max(
    ...missingComponents.map((component) => {
      const inbound = linkedInboundPos(
        orderContext.order.order_id,
        component.component_sku,
      )[0];
      if (!inbound) return 2;
      return Math.max(1, diffDays(dataset.policy.current_date, inbound.eta_date));
    }),
    0,
  );

  const holdUsesStaleInbound = missingComponents.some((component) => {
    const inbound = linkedInboundPos(orderContext.order.order_id, component.component_sku)[0];
    if (!inbound) return false;
    const supplier = getSupplier(inbound.supplier_id);
    return !inbound.confirmed || (supplier?.last_update_hours_ago ?? 0) > dataset.policy.stale_feed_threshold_hours;
  });

  const holdMeetsPromise =
    holdDelayDays + finalMileLane.transit_days <= orderContext.daysUntilPromise;
  const holdOption = scoreOption({
    option: "hold",
    delayDays: holdDelayDays,
    extraCost: 12,
    staleSupplierFeedFlag: holdUsesStaleInbound ? 1 : 0,
    splitShipmentFlag: 0,
    largeParcelDamageRiskFlag: 0,
    meetsPromiseDateFlag: holdMeetsPromise ? 1 : 0,
    consolidatedFlag: 1,
    supplierPenalty: holdUsesStaleInbound ? dataset.policy.supplier_medium_risk_penalty : 0,
    valid: true,
    details:
      holdDelayDays > 0
        ? `Wait ${holdDelayDays} day(s) for replenishment or inventory to clear.`
        : "All components are already available.",
  });

  const rerouteCandidates = missingComponents.map((component) => ({
    component,
    alternatives: getCastleGateAlternatives(
      component.component_sku,
      orderContext.order.preferred_node,
    ),
  }));
  const rerouteValid =
    missingComponents.length > 0 &&
    rerouteCandidates.every(
      ({ component, alternatives }) =>
        alternatives[0] && alternatives[0].available >= component.qty_required,
    );
  const rerouteDelayDays = rerouteValid
    ? Math.max(...rerouteCandidates.map(({ alternatives }) => alternatives[0].lane.transit_days))
    : 0;
  const rerouteExtraCost = rerouteValid
    ? rerouteCandidates.reduce(
        (total, candidate) => total + candidate.alternatives[0].lane.cost,
        0,
      )
    : 0;
  const rerouteDamageRisk = rerouteValid
    ? rerouteCandidates.some(({ component, alternatives }) => {
        const lane = alternatives[0].lane;
        return (component.large_parcel || component.fragile) && lane.damage_risk >= 0.06;
      })
    : false;
  const rerouteMeetsPromise =
    rerouteValid &&
    rerouteDelayDays + finalMileLane.transit_days <= orderContext.daysUntilPromise;
  const rerouteOption = scoreOption({
    option: "reroute",
    delayDays: rerouteDelayDays,
    extraCost: rerouteExtraCost,
    staleSupplierFeedFlag: 0,
    splitShipmentFlag: 0,
    largeParcelDamageRiskFlag: rerouteDamageRisk ? 1 : 0,
    meetsPromiseDateFlag: rerouteMeetsPromise ? 1 : 0,
    consolidatedFlag: 1,
    supplierPenalty: 0,
    valid:
      rerouteValid &&
      rerouteDelayDays <= 1 &&
      missingComponents.every((component) => component.is_missing),
    details: rerouteValid
      ? `Transfer ${missingComponents.map((component) => component.component_sku).join(", ")} into ${orderContext.order.preferred_node}.`
      : "No CastleGate reroute can fully cover the missing components.",
  });

  const splitSources = missingComponents.map((component) => {
    const supplierCandidate = getSupplierCandidates(component.component_sku)[0] ?? null;
    const castleCandidate =
      getCastleGateAlternatives(component.component_sku, orderContext.order.preferred_node)[0] ??
      null;

    const directSource =
      castleCandidate && getLane(castleCandidate.nodeId, orderContext.order.customer_zone)
        ? {
            sourceNode: castleCandidate.nodeId,
            lane: getLane(castleCandidate.nodeId, orderContext.order.customer_zone),
            stale: false,
            supplier: null,
          }
        : supplierCandidate && getLane(supplierCandidate.nodeId, orderContext.order.customer_zone)
          ? {
              sourceNode: supplierCandidate.nodeId,
              lane: getLane(supplierCandidate.nodeId, orderContext.order.customer_zone),
              stale:
                supplierCandidate.lastUpdateHoursAgo >
                dataset.policy.stale_feed_threshold_hours,
              supplier: supplierCandidate.supplier,
            }
          : null;

    return {
      component,
      directSource,
    };
  });

  const splitValid =
    missingComponents.length > 0 &&
    splitSources.every((candidate) => candidate.directSource?.lane);
  const splitDelayDays = splitValid
    ? Math.max(
        ...splitSources.map((candidate) => candidate.directSource?.lane?.transit_days ?? 0),
      )
    : 0;
  const splitExtraCost = splitValid
    ? splitSources.reduce(
        (total, candidate) => total + (candidate.directSource?.lane?.cost ?? 0),
        20,
      )
    : 0;
  const splitHasStaleSupplier = splitSources.some(
    (candidate) => candidate.directSource?.stale,
  );
  const splitMeetsPromise =
    splitValid && splitDelayDays <= orderContext.daysUntilPromise;
  const splitRiskFlag =
    splitValid &&
    (hasLargeParcel || hasFragile || missingComponents.some((component) => component.is_bottleneck));
  const splitOption = scoreOption({
    option: "split_ship",
    delayDays: splitDelayDays,
    extraCost: splitExtraCost,
    staleSupplierFeedFlag: splitHasStaleSupplier ? 1 : 0,
    splitShipmentFlag: 1,
    largeParcelDamageRiskFlag: splitRiskFlag ? 1 : 0,
    meetsPromiseDateFlag: splitMeetsPromise ? 1 : 0,
    consolidatedFlag: 0,
    supplierPenalty: splitHasStaleSupplier ? dataset.policy.supplier_medium_risk_penalty : 0,
    valid: splitValid,
    details: splitValid
      ? "Release available components now and send the blockers separately."
      : "Split shipment cannot cover all missing components.",
  });

  const supplierOnlySources = missingComponents.map((component) => ({
    component,
    candidate: getSupplierCandidates(component.component_sku)[0] ?? null,
  }));
  const supplierDirectValid =
    missingComponents.length > 0 &&
    supplierOnlySources.every((candidate) => candidate.candidate !== null);
  const supplierLaneDays = supplierDirectValid
    ? Math.max(
        ...supplierOnlySources.map((candidate) => {
          const lane = getLane(
            candidate.candidate!.nodeId,
            orderContext.order.customer_zone,
          );
          return lane?.transit_days ?? 99;
        }),
      )
    : 0;
  const supplierDirectCost = supplierDirectValid
    ? supplierOnlySources.reduce((total, candidate) => {
        const lane = getLane(candidate.candidate!.nodeId, orderContext.order.customer_zone);
        return total + (lane?.cost ?? 0);
      }, 0)
    : 0;
  const supplierDirectStale = supplierOnlySources.some(
    (candidate) =>
      (candidate.candidate?.lastUpdateHoursAgo ?? 0) >
      dataset.policy.stale_feed_threshold_hours,
  );
  const supplierDirectSupplierPenalty = supplierOnlySources.reduce(
    (total, candidate) => total + supplierPenaltyFor(candidate.candidate?.supplier ?? null),
    0,
  );
  const supplierDirectFreshAndReliable =
    supplierDirectValid &&
    supplierOnlySources.every((candidate) => {
      const supplier = candidate.candidate?.supplier;
      return (
        supplier !== undefined &&
        supplier.last_update_hours_ago <= dataset.policy.stale_feed_threshold_hours &&
        supplier.fill_rate >= 0.9 &&
        supplier.on_time_rate >= 0.85 &&
        supplier.feed_accuracy >= 0.85
      );
    });
  const supplierDirectLargeParcelRisk =
    supplierDirectValid &&
    supplierOnlySources.some((candidate) => {
      const lane = getLane(candidate.candidate!.nodeId, orderContext.order.customer_zone);
      return (
        (candidate.component.large_parcel || candidate.component.fragile) &&
        (!lane?.large_parcel_supported || (lane.damage_risk ?? 0) >= 0.07)
      );
    });
  const supplierDirectMeetsPromise =
    supplierDirectValid && supplierLaneDays <= orderContext.daysUntilPromise;
  const supplierDirectOption = scoreOption({
    option: "supplier_direct",
    delayDays: supplierLaneDays,
    extraCost: supplierDirectCost,
    staleSupplierFeedFlag: supplierDirectStale ? 1 : 0,
    splitShipmentFlag: 1,
    largeParcelDamageRiskFlag: supplierDirectLargeParcelRisk ? 1 : 0,
    meetsPromiseDateFlag: supplierDirectMeetsPromise ? 1 : 0,
    consolidatedFlag: 0,
    supplierPenalty: supplierDirectSupplierPenalty,
    valid: supplierDirectValid && supplierDirectFreshAndReliable,
    details: supplierDirectValid
      ? "Ship the blockers direct from the supplier to the customer."
      : "No supplier can cover all missing components directly.",
  });

  return {
    holdOption,
    splitOption,
    rerouteOption,
    supplierDirectOption,
    hasLargeParcel,
    hasFragile,
  };
}

export function decisionAgent(
  orderContext: ReturnType<typeof orderIntakeAgent>,
  availability: ReturnType<typeof componentAvailabilityAgent>,
  risks: ReturnType<typeof riskScoringAgent>,
) {
  const options = [
    risks.holdOption,
    risks.splitOption,
    risks.rerouteOption,
    risks.supplierDirectOption,
  ];

  const viableOptions = options
    .filter((option) => option.valid)
    .sort((left, right) => right.score - left.score);

  const noPromiseProtected = viableOptions.every((option) => !option.meets_promise_date);
  const noCastleGateBackup = availability.bottleneckComponents.length === 0;
  const staleSupplierData = risks.supplierDirectOption.delay_days > 0
    ? risks.supplierDirectOption.details.includes("supplier")
    : availability.matrixRows.some((row) =>
        row.cells.some((cell) => cell.stale),
      );

  const shouldEscalate =
    viableOptions.length === 0 ||
    viableOptions[0].score < dataset.policy.escalate_threshold_score ||
    noPromiseProtected ||
    (staleSupplierData && noCastleGateBackup && !risks.rerouteOption.valid);

  const selected = shouldEscalate
    ? scoreOption({
        option: "escalate",
        delayDays: Math.max(
          ...options.map((option) => option.delay_days),
          orderContext.daysUntilPromise + 1,
        ),
        extraCost: 45,
        staleSupplierFeedFlag: 1,
        splitShipmentFlag: 0,
        largeParcelDamageRiskFlag: risks.hasLargeParcel ? 1 : 0,
        meetsPromiseDateFlag: 0,
        consolidatedFlag: 0,
        supplierPenalty: dataset.policy.supplier_high_risk_penalty,
        valid: true,
        details: "Escalate to a planner because no safe option protects the promise date.",
      })
    : viableOptions[0];

  const summaryByOption: Record<DecisionOption, string> = {
    hold: `Hold the order briefly and wait for ${availability.missingComponents
      .map((component) => component.component_sku)
      .join(", ")} to replenish at ${orderContext.order.preferred_node}.`,
    split_ship: `Split ship the blocked components separately while releasing the available set pieces from ${orderContext.order.preferred_node}.`,
    reroute: `Reroute ${availability.bottleneckComponents
      .map((component) => component.component_sku)
      .join(", ")} into ${orderContext.order.preferred_node} and ship consolidated from ${orderContext.order.preferred_node}.`,
    supplier_direct:
      "Use supplier-direct fulfillment for the missing components and let the rest ship from CastleGate.",
    escalate:
      "Escalate to manual exception handling because no low-risk plan protects the promise date.",
  };

  return {
    selected,
    options: shouldEscalate ? [...options, selected] : options,
    summary: summaryByOption[selected.option],
  };
}

export function explanationAgent(
  orderContext: ReturnType<typeof orderIntakeAgent>,
  availability: ReturnType<typeof componentAvailabilityAgent>,
  decision: ReturnType<typeof decisionAgent>,
) {
  const riskFlags: string[] = [];

  availability.matrixRows.forEach((row) => {
    const staleCells = row.cells.filter((cell) => cell.stale);
    staleCells.forEach((cell) => {
      riskFlags.push(
        `${cell.node_id} inventory feed for ${row.component_sku} is stale: ${cell.last_update_hours_ago} hours old.`,
      );
    });
  });

  if (decision.options.some((option) => option.option === "split_ship")) {
    riskFlags.push("Split shipment creates extra customer confusion risk.");
  }

  if (orderContext.requiredComponents.some((component) => component.large_parcel)) {
    riskFlags.push("Large parcel items should stay consolidated when possible.");
  }

  const explanationByDecision: Record<DecisionOption, string> = {
    reroute: `We recommend rerouting the missing ${availability.bottleneckComponents
      .map((component) => component.component_name)
      .join(", ")} from another CastleGate node into ${orderContext.preferredNode.node_name}. ${orderContext.preferredNode.node_name} already has the rest of the ${orderContext.order.set_sku} set, so rerouting keeps the order consolidated, limits customer confusion, and protects the promise date with a one-day transfer.`,
    hold: `We recommend holding this order briefly because the blocked components can be recovered without fragmenting the shipment. A short hold keeps the set consolidated and avoids the customer experience risk of split furniture delivery.`,
    split_ship: `We recommend split shipping because the available set pieces can move now and the missing component can still arrive on time through a separate path. This is less ideal than consolidation, but it is the best way to protect the promise date for this order.`,
    supplier_direct: `We recommend supplier-direct fulfillment because the supplier feed is fresh, supplier reliability is strong, and the missing components can arrive without putting the promise date at risk.`,
    escalate: `We recommend escalating this order because no low-risk option keeps the set complete and on time. The remaining recovery paths rely on stale or unreliable supply signals, so a planner should intervene before committing a fulfillment action.`,
  };

  return {
    riskFlags: unique(riskFlags),
    explanation: explanationByDecision[decision.selected.option],
  };
}

export function evaluateOrder(orderId: string): EvaluationResponse {
  const orderContext = orderIntakeAgent(orderId);
  const availability = componentAvailabilityAgent(orderContext);
  const risks = riskScoringAgent(orderContext, availability);
  const decision = decisionAgent(orderContext, availability, risks);
  const explanation = explanationAgent(orderContext, availability, decision);

  const componentCount = orderContext.requiredComponents.length;
  const missingAtPreferred = availability.missingComponents
    .map((component) => component.component_sku)
    .join(", ");
  const supplierDirectReason =
    risks.supplierDirectOption.valid
      ? "Supplier-direct is viable."
      : "Supplier-direct risk is high because the supplier signal is stale or unreliable.";

  const agentSteps: AgentStep[] = [
    {
      agent: "Order Intake Agent",
      status: "complete",
      output: `Loaded ${orderContext.order.set_sku} and decomposed it into ${componentCount} components.`,
    },
    {
      agent: "Component Availability Agent",
      status: "complete",
      output:
        availability.missingComponents.length > 0
          ? `${orderContext.order.preferred_node} is missing ${missingAtPreferred}.`
          : `${orderContext.order.preferred_node} has all required components.`,
    },
    {
      agent: "Risk Scoring Agent",
      status: "complete",
      output: supplierDirectReason,
    },
    {
      agent: "Decision Agent",
      status: "complete",
      output: `${decision.selected.option} is the highest-scoring option.`,
    },
    {
      agent: "Explanation Agent",
      status: "complete",
      output: "Generated human-readable recommendation.",
    },
  ];

  return {
    order_id: orderContext.order.order_id,
    recommendation: decision.selected.option,
    summary: decision.summary,
    risk_level: decision.selected.risk,
    bottleneck_components: availability.bottleneckComponents.map(
      (component) => component.component_sku,
    ),
    agent_steps: agentSteps,
    options: decision.options.map(
      ({ valid, meets_promise_date, details, ...option }) => option,
    ),
    risk_flags: explanation.riskFlags,
    explanation: explanation.explanation,
    order_context: {
      customer_region: orderContext.order.customer_region,
      promise_date: orderContext.order.promise_date,
      set_sku: orderContext.order.set_sku,
      priority: orderContext.order.priority,
      preferred_node: orderContext.order.preferred_node,
      preferred_node_name: orderContext.preferredNode.node_name,
      customer_note: orderContext.order.customer_note,
    },
    required_components: orderContext.requiredComponents,
    inventory_matrix: {
      nodes: availability.matrixNodes,
      rows: availability.matrixRows,
    },
  };
}
