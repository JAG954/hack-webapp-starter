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
  completed: { label: "Completed", cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30" },
  fulfillable: { label: "Fulfillable", cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30" },
  reroute: { label: "Reroute", cls: "bg-amber-500/10 text-amber-700 ring-amber-500/30" },
  hold_inbound: { label: "Hold for Inbound", cls: "bg-amber-500/10 text-amber-700 ring-amber-500/30" },
  split_ship_required: { label: "Split-Ship Required", cls: "bg-[#990E35]/10 text-[#990E35] ring-[#990E35]/30" },
  escalation_required: { label: "Escalation Required", cls: "bg-[#990E35]/15 text-[#990E35] ring-[#990E35]/40" },
};

const STATE_META = {
  in_stock: { label: "In stock", tone: "text-emerald-700", dot: "bg-emerald-500" },
  inbound_eta_2d: { label: "Inbound · ETA 2d", tone: "text-amber-700", dot: "bg-amber-500" },
  inbound_eta_3d: { label: "Inbound · ETA 3d", tone: "text-amber-700", dot: "bg-amber-500" },
  inbound_eta_4d: { label: "Inbound · ETA 4d", tone: "text-amber-700", dot: "bg-amber-500" },
  inbound_eta_5d: { label: "Inbound · ETA 5d", tone: "text-amber-700", dot: "bg-amber-500" },
  inbound_eta_6d: { label: "Inbound · ETA 6d", tone: "text-amber-700", dot: "bg-amber-500" },
  inbound_eta_8d: { label: "Inbound · ETA 8d", tone: "text-amber-700", dot: "bg-amber-500" },
  backordered: { label: "Backordered", tone: "text-[#990E35]", dot: "bg-[#990E35]" },
  quality_hold: { label: "Quality hold", tone: "text-[#990E35]", dot: "bg-[#990E35]" },
  discontinued: { label: "Discontinued", tone: "text-[#990E35]", dot: "bg-[#990E35]" },
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
        cls: "bg-slate-100 text-slate-700",
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
        className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Order detail"
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {order ? (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">
                    {order.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${decision.cls}`}
                  >
                    {decision.label}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900">
                  {order.setName}
                </h3>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {order.customer} · {order.region}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-[#7B189F] hover:text-[#7B189F]"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Top stats */}
              <dl className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Promise date
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                    {order.promiseDate}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Est. delay
                  </dt>
                  <dd
                    className={`mt-1 text-sm font-semibold tabular-nums ${
                      order.estDelayDays > 0
                        ? order.estDelayDays >= 7
                          ? "text-[#990E35]"
                          : "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {order.estDelayDays > 0
                      ? `+${order.estDelayDays}d`
                      : "On time"}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    Order value
                  </dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                    ${order.value.toLocaleString()}
                  </dd>
                </div>
              </dl>

              {/* Risk reason */}
              <section className="mt-5 rounded-xl border border-[#990E35]/20 bg-[#990E35]/5 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#990E35]">
                  Risk reason
                </div>
                <p className="mt-1 text-sm text-slate-900">{order.riskReason}</p>
              </section>

              {/* Components */}
              <section className="mt-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Set components ({order.components.length})
                </h4>
                <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
                  {order.components.map((c) => {
                    const meta = STATE_META[c.state] ?? {
                      label: c.state,
                      tone: "text-slate-700",
                      dot: "bg-slate-400",
                    };
                    return (
                      <li
                        key={c.sku}
                        className="flex items-start justify-between gap-3 bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {c.name}
                          </div>
                          <div className="truncate font-mono text-[11px] text-slate-500">
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
              <section className="mt-5 rounded-xl border border-[#7B189F]/30 bg-[#7B189F]/[0.04] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#7B189F]">
                  Agent recommendation
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-900">
                  {order.agentRecommendation}
                </p>
              </section>
            </div>

            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-300"
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
                className="rounded-lg border border-[#7B189F]/40 bg-[#7B189F]/[0.08] px-3 py-1.5 text-sm font-medium text-[#7B189F] hover:bg-[#7B189F]/[0.16]"
              >
                Ask agent →
              </Link>
              <Link
                href={{
                  pathname: "/evaluate",
                  query: { order: order.id },
                }}
                className="rounded-lg bg-[#7B189F] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#9333A5]"
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
