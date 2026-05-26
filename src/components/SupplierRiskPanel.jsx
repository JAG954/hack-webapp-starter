import React from "react";

const RISK = {
  red: { dot: "bg-rose-500", text: "text-rose-300", chip: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  yellow: { dot: "bg-amber-400", text: "text-amber-300", chip: "bg-amber-400/15 text-amber-300 ring-amber-400/30" },
  green: { dot: "bg-emerald-400", text: "text-emerald-300", chip: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" },
};

function pct(v) {
  return `${Math.round(v * 100)}%`;
}

export default function SupplierRiskPanel({ suppliers }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Supplier Risk
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Upstream partners ranked by on-time performance.
        </p>
      </header>

      <ul className="space-y-2.5">
        {suppliers.map((s) => {
          const r = RISK[s.risk] ?? RISK.yellow;
          return (
            <li
              key={s.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {s.name}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-500">{s.note}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${r.chip}`}
                >
                  {s.risk}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                <div>
                  On-time{" "}
                  <span className={`font-semibold tabular-nums ${r.text}`}>
                    {pct(s.onTimeRate)}
                  </span>
                </div>
                <div>
                  Open late{" "}
                  <span className="font-semibold tabular-nums text-zinc-200">
                    {s.openLateShipments}
                  </span>
                </div>
              </div>
              {/* Mini on-time bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full ${r.dot}`}
                  style={{ width: `${Math.round(s.onTimeRate * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
