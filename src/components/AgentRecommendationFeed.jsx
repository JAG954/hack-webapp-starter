import React from "react";

const TYPE_META = {
  split_ship: {
    label: "Split-Ship",
    cls: "bg-[#990E35]/10 text-[#990E35] ring-[#990E35]/30",
    icon: "⇄",
  },
  escalation: {
    label: "Escalation",
    cls: "bg-[#990E35]/15 text-[#990E35] ring-[#990E35]/40",
    icon: "!",
  },
  reroute: {
    label: "Reroute",
    cls: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
    icon: "→",
  },
  hold_inbound: {
    label: "Hold",
    cls: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
    icon: "⏸",
  },
};

const STATUS_META = {
  applied: {
    label: "Applied",
    cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30",
  },
  pending_review: {
    label: "Pending review",
    cls: "bg-slate-100 text-slate-700 ring-slate-300",
  },
};

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AgentRecommendationFeed({ items, onSelectOrder }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#7B189F]" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Agent Recommendation Feed
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            What SetShip decided in the last hour. Click an order id to inspect.
          </p>
        </div>
        <div className="text-xs text-slate-500">{items.length} events</div>
      </header>

      <ol className="relative space-y-3 border-l border-slate-200 pl-5">
        {items.map((rec) => {
          const t = TYPE_META[rec.type] ?? TYPE_META.split_ship;
          const s = STATUS_META[rec.status] ?? STATUS_META.pending_review;
          return (
            <li key={rec.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] text-slate-700">
                {t.icon}
              </span>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${t.cls}`}
                  >
                    {t.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${s.cls}`}
                  >
                    {s.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectOrder?.(rec.orderId)}
                    className="font-mono text-[11px] text-slate-500 hover:text-[#7B189F]"
                  >
                    {rec.orderId}
                  </button>
                  <span className="ml-auto text-[11px] tabular-nums text-slate-500">
                    {formatTime(rec.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-800">
                  {rec.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
