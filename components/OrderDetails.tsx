import type { EvaluationResponse } from "@/lib/setship/types";

interface OrderDetailsProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
}

export function OrderDetails({ evaluation, isLoading }: OrderDetailsProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Order Details
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Furniture set context
        </h2>
      </div>

      {isLoading || !evaluation ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
          Evaluating selected order...
        </div>
      ) : (
        <div className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Order ID
              </dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {evaluation.order_id}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Customer Region
              </dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {evaluation.order_context.customer_region}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Promise Date
              </dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {evaluation.order_context.promise_date}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Furniture Set SKU
              </dt>
              <dd className="mt-2 text-base font-semibold text-slate-950">
                {evaluation.order_context.set_sku}
              </dd>
            </div>
          </dl>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Required Components
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Preferred node: {evaluation.order_context.preferred_node}
              </span>
            </div>

            <div className="grid gap-3">
              {evaluation.required_components.map((component) => (
                <article
                  key={component.component_sku}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-950">
                        {component.component_name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        {component.component_sku}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      Qty {component.qty_required}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {component.component_role.replaceAll("_", " ")}
                    </span>
                    {component.large_parcel ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Large parcel
                      </span>
                    ) : null}
                    {component.fragile ? (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                        Fragile
                      </span>
                    ) : null}
                    {component.must_ship_together ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Must stay together
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
