import React from "react";

const STATUS = {
  green: { bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700" },
  yellow: { bar: "bg-amber-500", dot: "bg-amber-500", text: "text-amber-700" },
  red: { bar: "bg-[#990E35]", dot: "bg-[#990E35]", text: "text-[#990E35]" },
  gray: { bar: "bg-slate-400", dot: "bg-slate-400", text: "text-slate-600" },
};

export default function FulfillmentBreakdown({ buckets }) {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Fulfillment Decision Breakdown
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            How the SetShip agent classified today&apos;s {total.toLocaleString()} orders.
          </p>
        </div>
        <div className="text-xs text-slate-500">Live · agent-graded</div>
      </header>

      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        {buckets.map((b) => {
          const pct = (b.count / total) * 100;
          const s = STATUS[b.status] ?? STATUS.gray;
          return (
            <div
              key={b.key}
              className={`${s.bar} h-full`}
              style={{ width: `${pct}%` }}
              title={`${b.label}: ${b.count}`}
            />
          );
        })}
      </div>

      {/* Legend list */}
      <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {buckets.map((b) => {
          const pct = ((b.count / total) * 100).toFixed(1);
          const s = STATUS[b.status] ?? STATUS.gray;
          return (
            <li
              key={b.key}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                <span className="text-sm text-slate-800">{b.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {b.count.toLocaleString()}
                </span>
                <span className={`text-xs tabular-nums ${s.text}`}>{pct}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
