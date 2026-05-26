// Tiny API client for the SetShip backend.
//
// Contract: GET /dashboard-summary returns the same top-level shape as
// src/data/mockDashboardData.js. Keys that may be missing are tolerated —
// the hook in useDashboardData.js merges live data over mock as a safety net.
//
// Flip USE_MOCK_DATA to true to force mock during dev / when the backend
// is unreachable on purpose.

export const USE_MOCK_DATA = false;

export const DASHBOARD_ENDPOINT =
  process.env.NEXT_PUBLIC_DASHBOARD_API_URL ||
  "http://localhost:8000/dashboard-summary";

// Network timeout for a single poll — keep it well under the poll interval
// so a stalled request doesn't block the next attempt.
const DEFAULT_TIMEOUT_MS = 4000;

/**
 * Fetch the dashboard summary from the backend.
 * Returns the parsed JSON payload on success, or null on any failure
 * (timeout / network / non-2xx / bad JSON). The caller decides what to
 * show on null — typically: keep the previous payload, fall back to mock.
 *
 * @param {{ signal?: AbortSignal, timeoutMs?: number }} [opts]
 * @returns {Promise<object | null>}
 */
export async function fetchDashboardSummary(opts = {}) {
  if (USE_MOCK_DATA) return null;

  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = opts;

  // Compose an internal timeout with an optional caller-supplied signal.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    const res = await fetch(DASHBOARD_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || typeof json !== "object") return null;
    return json;
  } catch {
    // Network error, abort, or JSON parse error — silent fallback.
    return null;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}
