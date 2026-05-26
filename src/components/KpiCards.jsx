import React from "react";

// Status -> accent stripe color. Matches the semantic palette used
// across the dashboard (green/yellow/red/gray + brand orange).
const ACCENT = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-rose-500",
  gray: "bg-zinc-500",
  brand: "bg-[#FF5C28]",
};

function Card({ label, value, sub, accent = "gray" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${ACCENT[accent] ?? ACCENT.gray}`}
        aria-hidden="true"
      />
      <div className="pl-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-3xl font-semibold tracking-tight text-white tabular-nums">
            {value}
          </div>
          {sub ? (
            <div className="text-xs font-medium text-zinc-500">{sub}</div>
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
