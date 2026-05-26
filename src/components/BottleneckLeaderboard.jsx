import React from "react";

const STATUS = {
  red: { bar: "bg-rose-500", text: "text-rose-300", ring: "ring-rose-500/30" },
  yellow: { bar: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/30" },
  green: { bar: "bg-emerald-400", text: "text-emerald-300", ring: "ring-emerald-400/30" },
  gray: { bar: "bg-zinc-500", text: "text-zinc-300", ring: "ring-zinc-500/30" },
};

export default function BottleneckLeaderboard({ items }) {
  const max = items.reduce((m, i) => Math.max(m, i.blockedOrders), 0) || 1;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Component Bottlenecks
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          SKUs blocking the most furniture-set orders right now.
        </p>
      </header>

      <ol className="space-y-3">
        {items.map((item, idx) => {
          const s = STATUS[item.status] ?? STATUS.gray;
          const pct = (item.blockedOrders / max) * 100;
          return (
            <li key={item.sku} className="rounded-lg bg-zinc-900/50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold tabular-nums text-zinc-300 ring-1 ${s.ring}`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-100">
                      {item.name}
                    </div>
                    <div className="truncate font-mono text-[11px] text-zinc-500">
                      {item.sku} · {item.supplier}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold tabular-nums text-white">
                    {item.blockedOrders}
                  </span>
                  <span className="text-[11px] text-zinc-500">orders</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className={`${s.bar} h-full`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
