import React from "react";

const TYPE_META = {
  split_ship: {
    label: "Split-Ship",
    cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
    icon: "⇄",
  },
  escalation: {
    label: "Escalation",
    cls: "bg-rose-600/20 text-rose-200 ring-rose-500/40",
    icon: "!",
  },
  reroute: {
    label: "Reroute",
    cls: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
    icon: "→",
  },
  hold_inbound: {
    label: "Hold",
    cls: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
    icon: "⏸",
  },
};

const STATUS_META = {
  applied: {
    label: "Applied",
    cls: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  },
  pending_review: {
    label: "Pending review",
    cls: "bg-zinc-700/40 text-zinc-300 ring-zinc-600",
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
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF5C28]" />
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Agent Recommendation Feed
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            What SetShip decided in the last hour. Click an order id to inspect.
          </p>
        </div>
        <div className="text-xs text-zinc-500">{items.length} events</div>
      </header>

      <ol className="relative space-y-3 border-l border-zinc-800 pl-5">
        {items.map((rec) => {
          const t = TYPE_META[rec.type] ?? TYPE_META.split_ship;
          const s = STATUS_META[rec.status] ?? STATUS_META.pending_review;
          return (
            <li key={rec.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-[10px] text-zinc-300">
                {t.icon}
              </span>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
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
                    className="font-mono text-[11px] text-zinc-400 hover:text-[#FF5C28]"
                  >
                    {rec.orderId}
                  </button>
                  <span className="ml-auto text-[11px] tabular-nums text-zinc-500">
                    {formatTime(rec.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200">
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
