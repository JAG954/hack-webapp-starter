import bom from "@/data/bom.json";
import components from "@/data/components.json";
import inboundPos from "@/data/inbound-pos.json";
import inventory from "@/data/inventory.json";
import lanes from "@/data/lanes.json";
import nodes from "@/data/nodes.json";
import openShipments from "@/data/open-shipments.json";
import orders from "@/data/orders.json";
import policyWeights from "@/data/policy-weights.json";
import suppliers from "@/data/suppliers.json";
import type {
  BomRecord,
  ComponentRecord,
  InboundPoRecord,
  InventoryRecord,
  LaneRecord,
  NodeRecord,
  OpenShipmentRecord,
  OrderRecord,
  PolicyWeights,
  SupplierRecord,
} from "@/lib/setship/types";

export const dataset = {
  orders: orders as OrderRecord[],
  bom: bom as BomRecord[],
  components: components as ComponentRecord[],
  inventory: inventory as InventoryRecord[],
  lanes: lanes as LaneRecord[],
  suppliers: suppliers as SupplierRecord[],
  nodes: nodes as NodeRecord[],
  inboundPos: inboundPos as InboundPoRecord[],
  openShipments: openShipments as OpenShipmentRecord[],
  policy: policyWeights as PolicyWeights,
};
