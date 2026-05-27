import React from "react";

// Small pill used both in the decision column and as a row badge.
// Wayfair's magenta-red (#990E35) is used for the red category so the
// table feels native to wayfair.com's sale-tag aesthetic.
function DecisionPill({ decision }) {
  const map = {
    split_ship_required: {
      label: "Split-Ship",
      cls: "bg-[#990E35]/10 text-[#990E35] ring-1 ring-inset ring-[#990E35]/30",
    },
    escalation_required: {
      label: "Escalation",
      cls: "bg-[#990E35]/15 text-[#990E35] ring-1 ring-inset ring-[#990E35]/40",
    },
  };
  const m = map[decision] ?? {
    label: decision,
    cls: "bg-slate-100 text-slate-700",
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
    return <span className="text-emerald-700 tabular-nums">On time</span>;
  }
  const tone =
    days >= 7
      ? "text-[#990E35]"
      : days >= 3
        ? "text-amber-700"
        : "text-slate-700";
  return (
    <span className={`tabular-nums ${tone}`}>
      +{days}d
    </span>
  );
}

export default function CriticalExceptionQueue({ orders, onSelect }) {
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-[#990E35]/30 bg-white shadow-sm">
      <header className="flex items-end justify-between border-b border-[#990E35]/20 bg-gradient-to-r from-[#990E35]/[0.04] to-transparent px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#990E35]" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Critical Exceptions
            </h2>
            <span className="rounded-full bg-[#990E35]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#990E35]">
              Red category
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Orders needing split-ship or human escalation. Click a row to see components &amp; agent plan.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          {orders.length} orders ·{" "}
          <span className="font-medium text-slate-700">
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
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
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
          <tbody className="divide-y divide-slate-200">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => onSelect?.(o.id)}
                className="cursor-pointer transition hover:bg-[#990E35]/[0.04]"
              >
                <td className="px-5 py-3 font-mono text-xs font-medium text-slate-900">
                  {o.id}
                </td>
                <td className="px-3 py-3 text-slate-800">{o.customer}</td>
                <td className="px-3 py-3 text-slate-700">{o.setName}</td>
                <td className="px-3 py-3">
                  <DecisionPill decision={o.decision} />
                </td>
                <td className="px-3 py-3 tabular-nums text-slate-700">
                  {o.promiseDate}
                </td>
                <td className="px-3 py-3">
                  <DelayCell days={o.estDelayDays} />
                </td>
                <td className="px-3 py-3 tabular-nums text-slate-800">
                  ${o.value.toLocaleString()}
                </td>
                <td className="max-w-xs truncate px-5 py-3 text-right text-slate-500">
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
