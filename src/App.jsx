"use client";

import React, { useMemo, useState } from "react";

import SiteHeader from "./components/SiteHeader.jsx";
import KpiCards from "./components/KpiCards.jsx";
import FulfillmentBreakdown from "./components/FulfillmentBreakdown.jsx";
import CriticalExceptionQueue from "./components/CriticalExceptionQueue.jsx";
import BottleneckLeaderboard from "./components/BottleneckLeaderboard.jsx";
import SupplierRiskPanel from "./components/SupplierRiskPanel.jsx";
import AgentRecommendationFeed from "./components/AgentRecommendationFeed.jsx";
import OrderDetailDrawer from "./components/OrderDetailDrawer.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import { useDashboardData } from "./data/useDashboardData.js";

function formatLastUpdated(date) {
  if (!date) return "—";
  try {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

function SourceBadge({ source, isLoading }) {
  // Live = green dot + pulse; Mock = gray dot, "offline".
  const live = source === "live";
  return (
    <div
      title={
        live
          ? "Connected to backend /dashboard-summary"
          : "Backend unreachable — showing mock data"
      }
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          live
            ? "bg-emerald-500 " + (isLoading ? "animate-pulse" : "")
            : "bg-slate-400"
        }`}
      />
      <span className="text-slate-700">{live ? "Live" : "Mock"}</span>
    </div>
  );
}

function AgentStatusChip({ agentReady }) {
  // null while the first /api/health probe is in flight — render nothing
  // so the header doesn't flicker between states.
  if (agentReady === null) return null;
  const online = agentReady === true;
  return (
    <div
      title={
        online
          ? "SetShip agent is reachable — chat + drawer Ask agent are live"
          : "SUBCONSCIOUS_API_KEY missing — set it in .env.local and restart"
      }
      className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
        online
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-amber-500/40 bg-amber-500/10"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          online ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      <span className={online ? "text-emerald-700" : "text-amber-700"}>
        Agent {online ? "online" : "offline"}
      </span>
    </div>
  );
}

export default function App() {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const {
    data,
    criticalExceptions,
    source,
    lastUpdated,
    isLoading,
    refetch,
    agentReady,
  } = useDashboardData();

  const {
    summary,
    fulfillmentBreakdown,
    orders,
    componentBottlenecks,
    supplierRisk,
    agentRecommendations,
  } = data;

  // Index orders by id once per data change so the drawer can resolve any
  // id (from the critical exception table or the agent feed).
  const ordersById = useMemo(() => {
    const map = {};
    for (const o of orders) map[o.id] = o;
    return map;
  }, [orders]);
  const selectedOrder = selectedOrderId ? ordersById[selectedOrderId] : null;

  const headerActions = (
    <>
      <AgentStatusChip agentReady={agentReady} />
      <SourceBadge source={source} isLoading={isLoading} />
      <div className="rounded-full border border-slate-200 bg-white px-3 py-1">
        Updated{" "}
        <span className="font-medium text-slate-800 tabular-nums">
          {formatLastUpdated(lastUpdated)}
        </span>
      </div>
      <div className="rounded-full border border-slate-200 bg-white px-3 py-1">
        Window:{" "}
        <span className="font-medium text-slate-800">{summary.windowLabel}</span>
      </div>
      <button
        type="button"
        onClick={refetch}
        disabled={isLoading}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 transition hover:border-[#7B189F] hover:text-[#7B189F] disabled:opacity-50"
      >
        {isLoading ? "Refreshing…" : "Refresh"}
      </button>
    </>
  );

  return (
    <div className="min-h-full text-slate-900">
      <SiteHeader
        subtitle="Furniture-Set Fulfillment · Operations"
        actions={headerActions}
      />

      <main className="mx-auto max-w-[1400px] space-y-5 px-5 py-6">
        {/* Row 1: KPI cards */}
        <KpiCards summary={summary} />

        {/* Row 2: fulfillment breakdown + supplier risk */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FulfillmentBreakdown buckets={fulfillmentBreakdown} />
          </div>
          <div>
            <SupplierRiskPanel suppliers={supplierRisk} />
          </div>
        </div>

        {/* Row 3: critical exceptions (dominant) + bottleneck leaderboard */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CriticalExceptionQueue
              orders={criticalExceptions}
              onSelect={setSelectedOrderId}
            />
          </div>
          <div>
            <BottleneckLeaderboard items={componentBottlenecks} />
          </div>
        </div>

        {/* Row 4: agent recommendation feed */}
        <AgentRecommendationFeed
          items={agentRecommendations}
          onSelectOrder={setSelectedOrderId}
        />

        {/* Row 5: rich footer — event details, track, builders, partner logos */}
        <SiteFooter />
      </main>

      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
