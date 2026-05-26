import React from "react";

const STATUS = {
  green: { bar: "bg-emerald-400", dot: "bg-emerald-400", text: "text-emerald-300" },
  yellow: { bar: "bg-amber-400", dot: "bg-amber-400", text: "text-amber-300" },
  red: { bar: "bg-rose-500", dot: "bg-rose-500", text: "text-rose-300" },
  gray: { bar: "bg-zinc-500", dot: "bg-zinc-500", text: "text-zinc-300" },
};

export default function FulfillmentBreakdown({ buckets }) {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white">
            Fulfillment Decision Breakdown
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            How the SetShip agent classified today&apos;s {total.toLocaleString()} orders.
          </p>
        </div>
        <div className="text-xs text-zinc-500">Live · agent-graded</div>
      </header>

      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
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
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                <span className="text-sm text-zinc-200">{b.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-white tabular-nums">
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
