import React, { useEffect } from "react";
import Link from "next/link";

// Build a prompt that gives the SetShip agent enough order context to
// reason about whether the current plan is right. The URL stays short
// because we only include reason + recommendation, not the full
// components list.
function buildAgentPrompt(order) {
  if (!order) return "";
  return [
    `I'm looking at order ${order.id} — ${order.setName} for ${order.customer}.`,
    `Current decision: ${order.decision}.`,
    `Risk reason: ${order.riskReason}.`,
    `Current agent recommendation: ${order.agentRecommendation}`,
    "",
    "Is this still the best path, or should we reconsider? Walk me through the trade-offs.",
  ].join(" ");
}

const DECISION_META = {
  completed: { label: "Completed", cls: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" },
  fulfillable: { label: "Fulfillable", cls: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" },
  reroute: { label: "Reroute", cls: "bg-amber-400/15 text-amber-300 ring-amber-400/30" },
  hold_inbound: { label: "Hold for Inbound", cls: "bg-amber-400/15 text-amber-300 ring-amber-400/30" },
  split_ship_required: { label: "Split-Ship Required", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  escalation_required: { label: "Escalation Required", cls: "bg-rose-600/20 text-rose-200 ring-rose-500/40" },
};

const STATE_META = {
  in_stock: { label: "In stock", tone: "text-emerald-300", dot: "bg-emerald-400" },
  inbound_eta_2d: { label: "Inbound · ETA 2d", tone: "text-amber-300", dot: "bg-amber-400" },
  inbound_eta_3d: { label: "Inbound · ETA 3d", tone: "text-amber-300", dot: "bg-amber-400" },
  inbound_eta_4d: { label: "Inbound · ETA 4d", tone: "text-amber-300", dot: "bg-amber-400" },
  inbound_eta_5d: { label: "Inbound · ETA 5d", tone: "text-amber-300", dot: "bg-amber-400" },
  inbound_eta_6d: { label: "Inbound · ETA 6d", tone: "text-amber-300", dot: "bg-amber-400" },
  inbound_eta_8d: { label: "Inbound · ETA 8d", tone: "text-amber-300", dot: "bg-amber-400" },
  backordered: { label: "Backordered", tone: "text-rose-300", dot: "bg-rose-500" },
  quality_hold: { label: "Quality hold", tone: "text-rose-300", dot: "bg-rose-500" },
  discontinued: { label: "Discontinued", tone: "text-rose-300", dot: "bg-rose-500" },
};

export default function OrderDetailDrawer({ order, onClose }) {
  // Close on Escape
  useEffect(() => {
    if (!order) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  const open = Boolean(order);
  const decision = order
    ? (DECISION_META[order.decision] ?? {
        label: order.decision,
        cls: "bg-zinc-700 text-zinc-200",
      })
    : null;

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Order detail"
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {order ? (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-500">
                    {order.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${decision.cls}`}
                  >
                    {decision.label}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-lg font-semibold tracking-tight text-white">
                  {order.setName}
                </h3>
                <p className="mt-0.5 truncate text-xs text-zinc-400">
                  {order.customer} · {order.region}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:border-[#FF5C28] hover:text-[#FF5C28]"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Top stats */}
              <dl className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Promise date
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-zinc-100">
                    {order.promiseDate}
                  </dd>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Est. delay
                  </dt>
                  <dd
                    className={`mt-1 text-sm font-semibold tabular-nums ${
                      order.estDelayDays > 0
                        ? order.estDelayDays >= 7
                          ? "text-rose-300"
                          : "text-amber-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {order.estDelayDays > 0
                      ? `+${order.estDelayDays}d`
                      : "On time"}
                  </dd>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Order value
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-zinc-100">
                    ${order.value.toLocaleString()}
                  </dd>
                </div>
              </dl>

              {/* Risk reason */}
              <section className="mt-5 rounded-xl border border-rose-500/20 bg-rose-950/20 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                  Risk reason
                </div>
                <p className="mt-1 text-sm text-zinc-100">{order.riskReason}</p>
              </section>

              {/* Components */}
              <section className="mt-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Set components ({order.components.length})
                </h4>
                <ul className="divide-y divide-zinc-900 overflow-hidden rounded-xl border border-zinc-800">
                  {order.components.map((c) => {
                    const meta = STATE_META[c.state] ?? {
                      label: c.state,
                      tone: "text-zinc-300",
                      dot: "bg-zinc-500",
                    };
                    return (
                      <li
                        key={c.sku}
                        className="flex items-start justify-between gap-3 bg-zinc-900/30 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-100">
                            {c.name}
                          </div>
                          <div className="truncate font-mono text-[11px] text-zinc-500">
                            {c.sku} · qty {c.qty} · {c.location}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                          <span className={`text-xs font-medium ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Agent recommendation */}
              <section className="mt-5 rounded-xl border border-[#FF5C28]/30 bg-[#FF5C28]/[0.06] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#FF5C28]">
                  Agent recommendation
                </div>
                <p className="mt-1 text-sm leading-relaxed text-zinc-100">
                  {order.agentRecommendation}
                </p>
              </section>
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-700"
              >
                Dismiss
              </button>
              <Link
                href={{
                  pathname: "/chat",
                  query: {
                    mode: "agent",
                    prefill: buildAgentPrompt(order),
                  },
                }}
                className="rounded-lg border border-[#FF5C28]/40 bg-[#FF5C28]/[0.08] px-3 py-1.5 text-sm font-medium text-[#FF5C28] hover:bg-[#FF5C28]/[0.16]"
              >
                Ask agent →
              </Link>
              <Link
                href={{
                  pathname: "/evaluate",
                  query: { order: order.id },
                }}
                className="rounded-lg bg-[#FF5C28] px-3 py-1.5 text-sm font-medium text-black hover:bg-[#ff7347]"
              >
                View full evaluation →
              </Link>
            </footer>
          </>
        ) : null}
      </aside>
    </div>
  );
}
