export type OrderPriority = "high" | "medium" | "low";
export type DecisionOption =
  | "hold"
  | "split_ship"
  | "reroute"
  | "supplier_direct"
  | "escalate";
export type RiskLevel = "low" | "medium" | "high";

export interface OrderRecord {
  order_id: string;
  order_date: string;
  promise_date: string;
  customer_zone: string;
  customer_region: string;
  preferred_node: string;
  set_sku: string;
  qty_sets: number;
  priority: OrderPriority;
  customer_note: string;
}

export interface OrderSummary {
  order_id: string;
  customer_region: string;
  promise_date: string;
  set_sku: string;
  priority: OrderPriority;
}

export interface BomRecord {
  set_sku: string;
  component_sku: string;
  qty_required: number;
  component_role: string;
  must_ship_together: boolean;
}

export interface ComponentRecord {
  component_sku: string;
  component_name: string;
  component_type: string;
  large_parcel: boolean;
  fragile: boolean;
  substitutable: boolean;
}

export interface InventoryRecord {
  node_id: string;
  node_type: string;
  region: string;
  component_sku: string;
  on_hand: number;
  reserved: number;
  last_update_hours_ago: number;
}

export interface LaneRecord {
  from_node: string;
  to_node: string;
  transit_days: number;
  cost: number;
  large_parcel_supported: boolean;
  damage_risk: number;
}

export interface SupplierRecord {
  supplier_id: string;
  supplier_name: string;
  fill_rate: number;
  on_time_rate: number;
  damage_rate: number;
  feed_accuracy: number;
  last_update_hours_ago: number;
  risk_tier: RiskLevel;
}

export interface NodeRecord {
  node_id: string;
  node_type: string;
  node_name: string;
  region: string;
  city: string;
  state: string;
  large_parcel_capable: boolean;
}

export interface InboundPoRecord {
  po_id: string;
  supplier_id: string;
  destination_node: string;
  component_sku: string;
  qty: number;
  confirmed: boolean;
  eta_date: string;
  linked_order_id: string;
}

export interface OpenShipmentRecord {
  shipment_id: string;
  order_id: string;
  component_sku: string;
  qty: number;
  source_node: string;
  destination_node: string;
  status: string;
  eta_date: string;
}

export interface PolicyWeights {
  current_date: string;
  stale_feed_threshold_hours: number;
  delay_penalty_per_day: number;
  cost_penalty_per_dollar: number;
  split_shipment_penalty: number;
  stale_supplier_feed_penalty: number;
  large_parcel_damage_penalty_multiplier: number;
  promise_date_bonus: number;
  consolidated_shipment_bonus: number;
  supplier_high_risk_penalty: number;
  supplier_medium_risk_penalty: number;
  escalate_threshold_score: number;
}

export interface RequiredComponent {
  component_sku: string;
  component_name: string;
  qty_required: number;
  component_role: string;
  must_ship_together: boolean;
  large_parcel: boolean;
  fragile: boolean;
}

export interface InventoryCell {
  node_id: string;
  available: number;
  last_update_hours_ago: number | null;
  stale: boolean;
  status: "sufficient" | "partial" | "missing" | "unavailable";
}

export interface InventoryMatrixRow {
  component_sku: string;
  component_name: string;
  qty_required: number;
  is_missing: boolean;
  is_bottleneck: boolean;
  cells: InventoryCell[];
}

export interface AgentStep {
  agent: string;
  status: "complete";
  output: string;
}

export interface ScoredOption {
  option: DecisionOption;
  score: number;
  delay_days: number;
  extra_cost: number;
  risk: RiskLevel;
  valid: boolean;
  meets_promise_date: boolean;
  details: string;
}

export interface EvaluationResponse {
  order_id: string;
  recommendation: DecisionOption;
  summary: string;
  risk_level: RiskLevel;
  bottleneck_components: string[];
  agent_steps: AgentStep[];
  options: Array<Omit<ScoredOption, "valid" | "meets_promise_date" | "details">>;
  risk_flags: string[];
  explanation: string;
  order_context: {
    customer_region: string;
    promise_date: string;
    set_sku: string;
    priority: OrderPriority;
    preferred_node: string;
    preferred_node_name: string;
    customer_note: string;
  };
  required_components: RequiredComponent[];
  inventory_matrix: {
    nodes: NodeRecord[];
    rows: InventoryMatrixRow[];
  };
}
