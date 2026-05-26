import React from "react";

// Small pill used both in the decision column and as a row badge.
function DecisionPill({ decision }) {
  const map = {
    split_ship_required: {
      label: "Split-Ship",
      cls: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30",
    },
    escalation_required: {
      label: "Escalation",
      cls: "bg-rose-600/20 text-rose-200 ring-1 ring-inset ring-rose-500/40",
    },
  };
  const m = map[decision] ?? {
    label: decision,
    cls: "bg-zinc-700 text-zinc-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function DelayCell({ days }) {
  if (!days || days <= 0) {
    return <span className="text-emerald-300 tabular-nums">On time</span>;
  }
  const tone =
    days >= 7
      ? "text-rose-300"
      : days >= 3
        ? "text-amber-300"
        : "text-zinc-200";
  return (
    <span className={`tabular-nums ${tone}`}>
      +{days}d
    </span>
  );
}

export default function CriticalExceptionQueue({ orders, onSelect }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 to-zinc-950">
      <header className="flex items-end justify-between border-b border-rose-500/20 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Critical Exceptions
            </h2>
            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-300">
              Red category
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Orders needing split-ship or human escalation. Click a row to see components &amp; agent plan.
          </p>
        </div>
        <div className="text-xs text-zinc-400">
          {orders.length} orders ·{" "}
          <span className="font-medium text-zinc-200">
            $
            {orders
              .reduce((s, o) => s + (o.value ?? 0), 0)
              .toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>{" "}
          at risk
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-950/60 text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-5 py-2.5 font-medium">Order</th>
              <th className="px-3 py-2.5 font-medium">Customer</th>
              <th className="px-3 py-2.5 font-medium">Set</th>
              <th className="px-3 py-2.5 font-medium">Decision</th>
              <th className="px-3 py-2.5 font-medium">Promise</th>
              <th className="px-3 py-2.5 font-medium">Delay</th>
              <th className="px-3 py-2.5 font-medium">Value</th>
              <th className="px-5 py-2.5 font-medium text-right">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => onSelect?.(o.id)}
                className="cursor-pointer transition hover:bg-rose-500/[0.06]"
              >
                <td className="px-5 py-3 font-mono text-xs font-medium text-white">
                  {o.id}
                </td>
                <td className="px-3 py-3 text-zinc-200">{o.customer}</td>
                <td className="px-3 py-3 text-zinc-300">{o.setName}</td>
                <td className="px-3 py-3">
                  <DecisionPill decision={o.decision} />
                </td>
                <td className="px-3 py-3 tabular-nums text-zinc-300">
                  {o.promiseDate}
                </td>
                <td className="px-3 py-3">
                  <DelayCell days={o.estDelayDays} />
                </td>
                <td className="px-3 py-3 tabular-nums text-zinc-200">
                  ${o.value.toLocaleString()}
                </td>
                <td className="max-w-xs truncate px-5 py-3 text-right text-zinc-400">
                  {o.riskReason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
