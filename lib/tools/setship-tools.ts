import { tool } from "ai";
import { z } from "zod";
import { dataset } from "@/lib/setship/data";
import { evaluateOrder, listOrders } from "@/lib/setship/evaluate";

export const listSetshipOrders = tool({
  description:
    "List the SetShip demo orders that can be evaluated by the fulfillment exception agent.",
  inputSchema: z.object({}),
  execute: async () => ({
    currentDate: dataset.policy.current_date,
    count: dataset.orders.length,
    orders: listOrders(),
  }),
});

export const evaluateSetshipOrder = tool({
  description:
    "Run the full SetShip workflow for a demo order, including intake, component availability, risk scoring, decisioning, and explanation.",
  inputSchema: z.object({
    orderId: z
      .string()
      .describe("Demo order id to evaluate, for example ORD-1042."),
  }),
  execute: async ({ orderId }) => evaluateOrder(orderId),
});

export const inspectSetshipDataset = tool({
  description:
    "Inspect the SetShip demo dataset table sizes and policy settings before running a workflow.",
  inputSchema: z.object({}),
  execute: async () => ({
    policy: dataset.policy,
    sampleOrderIds: dataset.orders.map((order) => order.order_id),
    tables: {
      orders: dataset.orders.length,
      components: dataset.components.length,
      bom: dataset.bom.length,
      inventory: dataset.inventory.length,
      lanes: dataset.lanes.length,
      suppliers: dataset.suppliers.length,
      nodes: dataset.nodes.length,
      inboundPos: dataset.inboundPos.length,
      openShipments: dataset.openShipments.length,
    },
  }),
});

export const setshipTools = {
  listSetshipOrders,
  evaluateSetshipOrder,
  inspectSetshipDataset,
};
