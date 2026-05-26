// Static mock data for the SetShip Agent ops dashboard.
//
// IMPORTANT — IDs and metadata are aligned with the partner backend in
// data/*.json so the dashboard's "View full evaluation" deep-link from
// the OrderDetailDrawer resolves into the real evaluator at /evaluate.
//
// When the partner exposes GET /dashboard-summary, it should return the
// same top-level shape exported below; useDashboardData.js merges the
// live payload over this mock so partial backend responses still render.

export const summary = {
  totalOrders: 1247,
  completed: 832,
  fulfillableNow: 156,
  atRisk: 94,
  splitShipRequired: 41,
  escalationRequired: 23,
  ordersSavedByAgent: 218,
  perfectOrderRate: 0.873,
  avgDelayDays: 2.4,
  windowLabel: "Last 24h",
};

// Buckets the SetShip agent classifies every furniture-set order into.
// `status` drives the semantic color (green / yellow / red / gray).
export const fulfillmentBreakdown = [
  { key: "completed", label: "Completed", count: 832, status: "green" },
  { key: "fulfillable", label: "Fulfillable Now", count: 156, status: "green" },
  { key: "reroute", label: "Reroute Suggested", count: 58, status: "yellow" },
  { key: "hold_inbound", label: "Hold for Inbound", count: 36, status: "yellow" },
  { key: "split_ship_required", label: "Split-Ship Required", count: 41, status: "red" },
  { key: "escalation_required", label: "Escalation Required", count: 23, status: "red" },
  { key: "unresolved", label: "Unresolved", count: 101, status: "gray" },
];

// Orders surfaced on the dashboard. The first four IDs (ORD-1042..1045)
// match data/orders.json exactly — they are the orders the partner's
// backend actually scores, so the drawer's "View full evaluation" link
// lands on real data. The trailing entries are non-red supporting rows.
export const orders = [
  {
    id: "ORD-1042",
    customer: "Northeast · CUSTOMER_NE",
    region: "Northeast",
    setName: "Lakemont 5-Piece Dining Set (DS-200)",
    decision: "split_ship_required",
    promiseDate: "2026-05-30",
    estDelayDays: 0,
    value: 2849.0,
    riskReason: "HW-01 hardware kit missing at CG_NJ; CG_KY can transfer in 1d",
    agentRecommendation:
      "Split-ship: tabletop + chairs from CG_NJ today, reroute HW-01 from CG_KY for next-day consolidation.",
    components: [
      { sku: "TABLETOP-01", name: "Oak Tabletop", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "LEG-01", name: "Table Leg Pack", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "CHAIR-01", name: "Dining Chair", qty: 4, location: "CG_NJ", state: "in_stock" },
      { sku: "HW-01", name: "Dining Hardware Kit", qty: 1, location: "CG_KY", state: "inbound_eta_2d" },
    ],
  },
  {
    id: "ORD-1043",
    customer: "Northeast · CUSTOMER_NE",
    region: "Northeast",
    setName: "Aspen Queen Bedroom Set (BED-510)",
    decision: "escalation_required",
    promiseDate: "2026-05-29",
    estDelayDays: 4,
    value: 4199.0,
    riskReason:
      "Bed hardware HW-02 backordered; customer explicitly forbids split shipment",
    agentRecommendation:
      "Escalate to merchandising — propose Aspen-II hardware swap at parity, or +2d promise extension with $80 service credit.",
    components: [
      { sku: "HEADBOARD-01", name: "Queen Headboard", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "FOOTBOARD-01", name: "Queen Footboard", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "RAIL-01", name: "Side Rail Pair", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "SLAT-01", name: "Slat Pack", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "HW-02", name: "Bed Hardware Kit", qty: 1, location: "SUP_B", state: "backordered" },
    ],
  },
  {
    id: "ORD-1044",
    customer: "Southeast · CUSTOMER_SE",
    region: "Southeast",
    setName: "Marin 3-Piece Sectional (SOFA-330)",
    decision: "split_ship_required",
    promiseDate: "2026-05-28",
    estDelayDays: 1,
    value: 3299.0,
    riskReason: "Cushion-01 production lag at Coastal Seating; customer OK with split",
    agentRecommendation:
      "Split-ship: frame + base from CG_GA today; CUSHION-01 ships from SUP_C on Wed with expedited last-mile.",
    components: [
      { sku: "SOFA-BASE-01", name: "Sofa Base", qty: 1, location: "CG_GA", state: "in_stock" },
      { sku: "SOFA-LEG-01", name: "Sofa Leg Pack", qty: 1, location: "CG_GA", state: "in_stock" },
      { sku: "CUSHION-01", name: "Cushion Set", qty: 1, location: "SUP_C", state: "inbound_eta_3d" },
    ],
  },
  {
    id: "ORD-1045",
    customer: "Midwest · CUSTOMER_MW",
    region: "Midwest",
    setName: "Halden Office Desk Set (DESK-120)",
    decision: "escalation_required",
    promiseDate: "2026-05-27",
    estDelayDays: 7,
    value: 1549.0,
    riskReason: "Desk top quality-hold at Urban Desk Parts (SUP_D); promise window unrecoverable",
    agentRecommendation:
      "Escalate: offer Halden-II desk top from CG_KY at parity + expedited freight. Customer note: no delivery flexibility.",
    components: [
      { sku: "DESK-TOP-01", name: "Desk Top — Walnut", qty: 1, location: "SUP_D", state: "quality_hold" },
      { sku: "DESK-LEG-01", name: "Desk Leg Set", qty: 1, location: "CG_KY", state: "in_stock" },
      { sku: "HW-03", name: "Desk Hardware Kit", qty: 1, location: "CG_KY", state: "in_stock" },
    ],
  },
  // Non-red supporting orders give the order pool realism but are not
  // surfaced in the Critical Exceptions table (filtered by decision).
  {
    id: "ORD-1046",
    customer: "West · CUSTOMER_W",
    region: "West",
    setName: "Willow Nursery Set",
    decision: "fulfillable",
    promiseDate: "2026-06-08",
    estDelayDays: 0,
    value: 1599.0,
    riskReason: "—",
    agentRecommendation: "Ship complete from CG_NJ.",
    components: [
      { sku: "WLLW-CRIB", name: "Convertible Crib", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "WLLW-DR", name: "Nursery Dresser", qty: 1, location: "CG_NJ", state: "in_stock" },
    ],
  },
  {
    id: "ORD-1047",
    customer: "Midwest · CUSTOMER_MW",
    region: "Midwest",
    setName: "Hadley Office Pair",
    decision: "reroute",
    promiseDate: "2026-06-04",
    estDelayDays: 1,
    value: 879.0,
    riskReason: "CG_NJ low on chair stock; reroute to CG_KY",
    agentRecommendation: "Reroute fulfillment to CG_KY — same promise window holds.",
    components: [
      { sku: "DESK-LEG-01", name: "Desk Leg Set", qty: 1, location: "CG_KY", state: "in_stock" },
      { sku: "CHAIR-01", name: "Office Chair", qty: 1, location: "CG_KY", state: "in_stock" },
    ],
  },
  {
    id: "ORD-1048",
    customer: "Northeast · CUSTOMER_NE",
    region: "Northeast",
    setName: "Stonebridge Entry Set",
    decision: "hold_inbound",
    promiseDate: "2026-06-12",
    estDelayDays: 0,
    value: 949.0,
    riskReason: "Bench inbound 06-09 from SUP_B; promise window safe",
    agentRecommendation: "Hold for inbound — single shipment beats split-ship cost here.",
    components: [
      { sku: "STNBR-CONS", name: "Console Table", qty: 1, location: "CG_NJ", state: "in_stock" },
      { sku: "STNBR-BNH", name: "Entry Bench", qty: 1, location: "SUP_B", state: "inbound_eta_6d" },
    ],
  },
];

// Components most often blocking otherwise-shippable orders. Uses the
// partner's real component_sku values so this view is consistent with
// /evaluate's InventoryMatrix.
export const componentBottlenecks = [
  { sku: "HW-02", name: "Bed Hardware Kit", blockedOrders: 31, supplier: "Flatpack Components", status: "red" },
  { sku: "CUSHION-01", name: "Cushion Set", blockedOrders: 24, supplier: "Coastal Seating", status: "yellow" },
  { sku: "HW-01", name: "Dining Hardware Kit", blockedOrders: 18, supplier: "Flatpack Components", status: "yellow" },
  { sku: "DESK-TOP-01", name: "Desk Top — Walnut", blockedOrders: 14, supplier: "Urban Desk Parts", status: "red" },
  { sku: "TABLETOP-01", name: "Oak Tabletop", blockedOrders: 9, supplier: "Oak Ridge Furnishings", status: "yellow" },
  { sku: "CHAIR-01", name: "Dining Chair", blockedOrders: 6, supplier: "Oak Ridge Furnishings", status: "green" },
];

// Suppliers from data/suppliers.json, augmented with UI-only display
// fields (open late shipments, note) for the panel.
export const supplierRisk = [
  {
    id: "SUP_D",
    name: "Urban Desk Parts",
    onTimeRate: 0.71,
    openLateShipments: 28,
    risk: "red",
    note: "Desk-top quality holds; no inbound ETA",
  },
  {
    id: "SUP_A",
    name: "Oak Ridge Furnishings",
    onTimeRate: 0.76,
    openLateShipments: 14,
    risk: "yellow",
    note: "Recovering — ETAs trending earlier this week",
  },
  {
    id: "SUP_B",
    name: "Flatpack Components Co",
    onTimeRate: 0.88,
    openLateShipments: 9,
    risk: "yellow",
    note: "Hardware kit backlog; expediting HW-02",
  },
  {
    id: "SUP_C",
    name: "Coastal Seating",
    onTimeRate: 0.91,
    openLateShipments: 4,
    risk: "green",
    note: "Stable",
  },
];

// Recommendations from the SetShip agent reference the same order IDs
// so judges can click any orderId in the feed and drill straight into
// /evaluate?order=ORD-…
export const agentRecommendations = [
  {
    id: "rec-001",
    orderId: "ORD-1042",
    type: "split_ship",
    status: "applied",
    timestamp: "2026-05-26T08:42:00Z",
    summary:
      "Auto-split DS-200 — tabletop + chairs from CG_NJ today, HW-01 reroute from CG_KY next-day.",
  },
  {
    id: "rec-002",
    orderId: "ORD-1043",
    type: "escalation",
    status: "pending_review",
    timestamp: "2026-05-26T08:47:00Z",
    summary:
      "Escalate BED-510 — propose Aspen-II hardware swap at parity, customer forbids split.",
  },
  {
    id: "rec-003",
    orderId: "ORD-1044",
    type: "split_ship",
    status: "applied",
    timestamp: "2026-05-26T08:55:00Z",
    summary:
      "Split SOFA-330 — base from CG_GA now, CUSHION-01 from SUP_C Wed with expedited last-mile.",
  },
  {
    id: "rec-004",
    orderId: "ORD-1045",
    type: "escalation",
    status: "pending_review",
    timestamp: "2026-05-26T09:03:00Z",
    summary:
      "DESK-120: SUP_D desk top on quality hold — propose Halden-II top from CG_KY at parity.",
  },
  {
    id: "rec-005",
    orderId: "ORD-1047",
    type: "reroute",
    status: "applied",
    timestamp: "2026-05-26T09:14:00Z",
    summary:
      "Rerouted Hadley Office Pair to CG_KY — CG_NJ chair stock under threshold.",
  },
  {
    id: "rec-006",
    orderId: "ORD-1048",
    type: "hold_inbound",
    status: "applied",
    timestamp: "2026-05-26T09:22:00Z",
    summary:
      "Hold Stonebridge order — bench inbound 06-09 from SUP_B keeps single-shipment economics.",
  },
];

// The red category filter lives here (and only here) so the
// CriticalExceptionQueue can stay dumb. Backend partials that omit
// `criticalExceptions` are also covered: useDashboardData re-derives
// from the merged `orders` array.
export const criticalExceptions = orders.filter(
  (order) =>
    order.decision === "split_ship_required" ||
    order.decision === "escalation_required",
);
