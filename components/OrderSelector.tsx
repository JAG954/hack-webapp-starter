import type { OrderSummary } from "@/lib/setship/types";

interface OrderSelectorProps {
  orders: OrderSummary[];
  selectedOrderId: string;
  onSelect: (orderId: string) => void;
  isLoading: boolean;
}

export function OrderSelector({
  orders,
  selectedOrderId,
  onSelect,
  isLoading,
}: OrderSelectorProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Order Selector
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Choose an exception case
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Loading available orders...
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => {
            const isSelected = order.order_id === selectedOrderId;

            return (
              <button
                key={order.order_id}
                type="button"
                onClick={() => onSelect(order.order_id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50 shadow-[0_12px_24px_rgba(16,185,129,0.12)]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-950">
                    {order.order_id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                      order.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {order.set_sku} for {order.customer_region}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Promise date: {order.promise_date}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
