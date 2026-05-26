import { evaluateOrder } from "@/lib/setship/evaluate";

export async function POST(request: Request) {
  const body = await request.json();
  const orderId = body?.order_id;

  if (typeof orderId !== "string" || orderId.length === 0) {
    return Response.json(
      { error: "order_id is required" },
      { status: 400 },
    );
  }

  try {
    return Response.json(evaluateOrder(orderId));
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to evaluate order",
      },
      { status: 404 },
    );
  }
}
