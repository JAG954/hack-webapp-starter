import React from "react";

// Status → left-accent stripe color. Matches semantic palette across
// the dashboard (green/yellow/red/gray) plus Wayfair-purple for brand.
const ACCENT = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-[#990E35]",
  gray: "bg-slate-400",
  brand: "bg-[#7B189F]",
};

function Card({ label, value, sub, accent = "gray" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${ACCENT[accent] ?? ACCENT.gray}`}
        aria-hidden="true"
      />
      <div className="px-5 py-4 pl-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {value}
          </div>
          {sub ? (
            <div className="text-xs font-medium text-slate-500">{sub}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function KpiCards({ summary }) {
  const pct = Math.round((summary.completed / summary.totalOrders) * 100);

  const cards = [
    {
      label: "Completed Orders",
      value: summary.completed.toLocaleString(),
      sub: `${pct}% of ${summary.totalOrders.toLocaleString()}`,
      accent: "green",
    },
    {
      label: "Fulfillable Now",
      value: summary.fulfillableNow.toLocaleString(),
      sub: "Ship-ready, no agent action",
      accent: "green",
    },
    {
      label: "At-Risk Orders",
      value: summary.atRisk.toLocaleString(),
      sub: "Agent reviewing",
      accent: "yellow",
    },
    {
      label: "Split-Ship Required",
      value: summary.splitShipRequired.toLocaleString(),
      sub: "Red category",
      accent: "red",
    },
    {
      label: "Escalation Required",
      value: summary.escalationRequired.toLocaleString(),
      sub: "Red category",
      accent: "red",
    },
    {
      label: "Orders Saved by Agent",
      value: summary.ordersSavedByAgent.toLocaleString(),
      sub: `${summary.windowLabel}`,
      accent: "brand",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label} {...c} />
      ))}
    </div>
  );
}
