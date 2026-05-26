import { listOrders } from "@/lib/setship/evaluate";

export async function GET() {
  return Response.json(listOrders());
}
