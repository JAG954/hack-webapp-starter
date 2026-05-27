import React from "react";

const RISK = {
  red: {
    dot: "bg-[#990E35]",
    text: "text-[#990E35]",
    chip: "bg-[#990E35]/10 text-[#990E35] ring-[#990E35]/30",
  },
  yellow: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    chip: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
  },
  green: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    chip: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30",
  },
};

function pct(v) {
  return `${Math.round(v * 100)}%`;
}

export default function SupplierRiskPanel({ suppliers }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Supplier Risk
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Upstream partners ranked by on-time performance.
        </p>
      </header>

      <ul className="space-y-2.5">
        {suppliers.map((s) => {
          const r = RISK[s.risk] ?? RISK.yellow;
          return (
            <li
              key={s.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                    <span className="truncate text-sm font-medium text-slate-900">
                      {s.name}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{s.note}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${r.chip}`}
                >
                  {s.risk}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                <div>
                  On-time{" "}
                  <span className={`font-semibold tabular-nums ${r.text}`}>
                    {pct(s.onTimeRate)}
                  </span>
                </div>
                <div>
                  Open late{" "}
                  <span className="font-semibold tabular-nums text-slate-800">
                    {s.openLateShipments}
                  </span>
                </div>
              </div>
              {/* Mini on-time bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
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
