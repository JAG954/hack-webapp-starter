// Lightweight readiness probe used by the dashboard header + chat page.
// Never returns the key itself — just whether the env var is populated.
// Kept dynamic so the value reflects the running server's env, not the
// build-time snapshot.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.SUBCONSCIOUS_API_KEY;
  const hasSubconsciousKey =
    typeof apiKey === "string" && apiKey.trim().length > 0;

  return Response.json({
    hasSubconsciousKey,
    // The agent route POSTs to /api/chat; the dashboard reads this so it
    // can show an "Agent offline" chip without exposing any secret.
    agentReady: hasSubconsciousKey,
  });
}
