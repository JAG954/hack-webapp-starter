import type { EvaluationResponse } from "@/lib/setship/types";

interface InventoryMatrixProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
}

export function InventoryMatrix({ evaluation, isLoading }: InventoryMatrixProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Inventory Matrix
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Component availability by node
        </h2>
      </div>

      {isLoading || !evaluation ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
          Loading inventory evaluation...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    Component
                  </th>
                  {evaluation.inventory_matrix.nodes.map((node) => (
                    <th
                      key={node.node_id}
                      className="px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
                    >
                      {node.node_id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluation.inventory_matrix.rows.map((row) => (
                  <tr
                    key={row.component_sku}
                    className={`${
                      row.is_bottleneck
                        ? "rounded-2xl ring-2 ring-amber-300"
                        : row.is_missing
                          ? "rounded-2xl ring-1 ring-rose-200"
                          : ""
                    }`}
                  >
                    <td className="rounded-l-2xl border border-r-0 border-slate-200 bg-slate-50 px-3 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-950">
                          {row.component_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {row.component_sku} · Qty {row.qty_required}
                        </span>
                        {row.is_bottleneck ? (
                          <span className="mt-1 inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Bottleneck
                          </span>
                        ) : null}
                        {row.is_missing && !row.is_bottleneck ? (
                          <span className="mt-1 inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            Missing
                          </span>
                        ) : null}
                      </div>
                    </td>
                    {row.cells.map((cell, index) => (
                      <td
                        key={`${row.component_sku}-${cell.node_id}`}
                        className={`border border-slate-200 px-3 py-3 ${
                          index === row.cells.length - 1 ? "rounded-r-2xl" : ""
                        } ${
                          cell.status === "sufficient"
                            ? "bg-emerald-50"
                            : cell.status === "partial"
                              ? "bg-amber-50"
                              : "bg-rose-50"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-semibold text-slate-950">
                            {cell.available}
                          </span>
                          <span className="text-xs text-slate-500">
                            {cell.status.replaceAll("_", " ")}
                          </span>
                          {cell.last_update_hours_ago !== null ? (
                            <span
                              className={`text-xs ${
                                cell.stale ? "text-rose-600" : "text-slate-500"
                              }`}
                            >
                              Update {cell.last_update_hours_ago}h ago
                            </span>
                          ) : null}
                          {cell.stale ? (
                            <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              Stale feed
                            </span>
                          ) : null}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Missing components are flagged where preferred-node availability is below
              required quantity.
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Bottleneck rows are the blockers with a viable recovery path elsewhere.
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Supplier freshness matters because stale feeds make supplier-direct risky.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
