"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as mock from "./mockDashboardData.js";
import { fetchDashboardSummary } from "./api.js";

const POLL_INTERVAL_MS = 15000;

// Default payload assembled from the mock module so the dashboard always
// has *something* to render. The backend can override any of these keys.
const MOCK_PAYLOAD = {
  summary: mock.summary,
  fulfillmentBreakdown: mock.fulfillmentBreakdown,
  orders: mock.orders,
  componentBottlenecks: mock.componentBottlenecks,
  supplierRisk: mock.supplierRisk,
  agentRecommendations: mock.agentRecommendations,
};

// Merge a possibly-partial live payload over the mock baseline so any
// missing key still renders. Critical Exceptions are always derived from
// the resulting `orders` array — see deriveCriticalExceptions below.
function mergeWithMock(live) {
  if (!live) return { ...MOCK_PAYLOAD };
  return {
    summary: live.summary ?? MOCK_PAYLOAD.summary,
    fulfillmentBreakdown:
      live.fulfillmentBreakdown ?? MOCK_PAYLOAD.fulfillmentBreakdown,
    orders: live.orders ?? MOCK_PAYLOAD.orders,
    componentBottlenecks:
      live.componentBottlenecks ?? MOCK_PAYLOAD.componentBottlenecks,
    supplierRisk: live.supplierRisk ?? MOCK_PAYLOAD.supplierRisk,
    agentRecommendations:
      live.agentRecommendations ?? MOCK_PAYLOAD.agentRecommendations,
  };
}

// The red category filter lives here (and only here) so backend partials
// can't break it. Codex checklist item 6.
export function deriveCriticalExceptions(orders) {
  if (!Array.isArray(orders)) return [];
  return orders.filter(
    (o) =>
      o.decision === "split_ship_required" ||
      o.decision === "escalation_required",
  );
}

/**
 * useDashboardData
 * ----------------
 * - First paint: mock data, so the dashboard never flashes blank.
 * - On mount: fetch live data and switch `source` to 'live' on success.
 * - Polls every 15s. Polling failures are silent — the dashboard keeps
 *   showing the last good payload, and `source` flips to 'mock' only if
 *   we have never received a live payload.
 * - `refetch()` triggers an immediate fetch (used by the Refresh button).
 */
export function useDashboardData() {
  const [data, setData] = useState(MOCK_PAYLOAD);
  const [source, setSource] = useState("mock");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // null = haven't checked yet; true/false populated by the /api/health
  // probe so the dashboard can show an "Agent online/offline" chip.
  const [agentReady, setAgentReady] = useState(null);

  const everReceivedLiveRef = useRef(false);
  const inFlightRef = useRef(null);
  const mountedRef = useRef(true);

  // Health probe — same cadence as the data poll so the chip stays fresh
  // if the server is restarted mid-demo. Runs only in the browser.
  const probeHealth = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error("health check failed");
      const json = await res.json();
      if (!mountedRef.current) return;
      setAgentReady(Boolean(json.agentReady));
    } catch {
      if (!mountedRef.current) return;
      setAgentReady(false);
    }
  }, []);

  // The "core" fetch: no synchronous setState. Safe to invoke from a
  // useEffect body or setInterval tick because all state updates happen
  // after the await.
  const performFetch = useCallback(async () => {
    if (inFlightRef.current) inFlightRef.current.abort();
    const controller = new AbortController();
    inFlightRef.current = controller;

    const live = await fetchDashboardSummary({ signal: controller.signal });
    if (!mountedRef.current) return;

    if (live) {
      everReceivedLiveRef.current = true;
      setData(mergeWithMock(live));
      setSource("live");
      setLastUpdated(new Date());
    } else if (!everReceivedLiveRef.current) {
      // Backend never came online — keep the mock baseline visible and
      // stamp lastUpdated so the header doesn't show "—".
      setData(MOCK_PAYLOAD);
      setSource("mock");
      setLastUpdated(new Date());
    }
    // If we have previously received a live payload and this one failed,
    // leave `data` and `source` alone so the demo keeps showing the last
    // good snapshot.

    setIsLoading(false);
  }, []);

  // Event-handler entry point (used by the Refresh button). Setting
  // isLoading synchronously here is fine because it isn't inside an
  // effect body — it's reacting to a user gesture.
  const refetch = useCallback(() => {
    setIsLoading(true);
    return performFetch();
  }, [performFetch]);

  // Initial fetch + 15s polling.
  // The initial call is dispatched through setTimeout(_, 0) so the
  // setState calls inside performFetch happen on a later microtask
  // rather than synchronously from the effect body.
  useEffect(() => {
    mountedRef.current = true;
    const initialTimer = setTimeout(performFetch, 0);
    const initialHealthTimer = setTimeout(probeHealth, 0);
    const id = setInterval(performFetch, POLL_INTERVAL_MS);
    const healthId = setInterval(probeHealth, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearTimeout(initialTimer);
      clearTimeout(initialHealthTimer);
      clearInterval(id);
      clearInterval(healthId);
      if (inFlightRef.current) inFlightRef.current.abort();
    };
  }, [performFetch, probeHealth]);

  const criticalExceptions = deriveCriticalExceptions(data.orders);

  return {
    data,
    criticalExceptions,
    source, // 'live' | 'mock'
    lastUpdated, // Date | null
    isLoading,
    refetch,
    agentReady, // null | true | false
  };
}
