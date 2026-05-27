import React from "react";

const STATUS = {
  red: { bar: "bg-[#990E35]", text: "text-[#990E35]", ring: "ring-[#990E35]/30" },
  yellow: { bar: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-500/30" },
  green: { bar: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-500/30" },
  gray: { bar: "bg-slate-400", text: "text-slate-600", ring: "ring-slate-400/30" },
};

export default function BottleneckLeaderboard({ items }) {
  const max = items.reduce((m, i) => Math.max(m, i.blockedOrders), 0) || 1;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Component Bottlenecks
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          SKUs blocking the most furniture-set orders right now.
        </p>
      </header>

      <ol className="space-y-3">
        {items.map((item, idx) => {
          const s = STATUS[item.status] ?? STATUS.gray;
          const pct = (item.blockedOrders / max) * 100;
          return (
            <li key={item.sku} className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold tabular-nums text-slate-700 ring-1 ${s.ring}`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </div>
                    <div className="truncate font-mono text-[11px] text-slate-500">
                      {item.sku} · {item.supplier}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {item.blockedOrders}
                  </span>
                  <span className="text-[11px] text-slate-500">orders</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className={`${s.bar} h-full`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
