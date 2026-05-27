<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SetShip Agent

Explainable AI fulfillment-exception agent for incomplete furniture-set orders.
Built at Beat The Clock Agent Hack (Track 02 — Agents for Supply Chain),
Wayfair Office, Boston, 2026-05-26.

## What's here

Three coordinated surfaces, one product:

- **`/`** — SetShip ops dashboard (mock data + live `/api/health` probe)
- **`/evaluate`** — per-order evaluator backed by a deterministic scoring engine
- **`/chat`** — Subconscious agent (`ToolLoopAgent` via Vercel AI SDK) with markdown rendering and SetShip seed prompts

## Before changing code

1. `SUBCONSCIOUS_API_KEY` required for `/chat` — https://www.subconscious.dev/platform.
   Copy `.env.example` to `.env.local` and fill in.
2. Subconscious API reference: `.agents/skills/subconscious-dev/SKILL.md`
3. Brand tokens live in `app/globals.css` — primary `#7B189F` (Wayfair purple),
   accent `#990E35` (sale-tag magenta). Use these for any new UI; don't reintroduce
   the old orange `#FF5C28`.
4. Critical-exception filter lives in **one place only** — `src/data/useDashboardData.js`
   `deriveCriticalExceptions(orders)` — and uses `decision === "split_ship_required" || "escalation_required"`.
   Don't duplicate the filter in components.

## Repo map

```
app/
  page.tsx                     mounts src/App.jsx (dashboard)
  chat/page.tsx                mounts ChatApp
  evaluate/page.tsx            mounts the per-order evaluator
  api/chat/route.ts            streaming Subconscious agent
  api/health/route.ts          { hasSubconsciousKey, agentReady }
  orders/route.ts              GET — listOrders()
  evaluate-order/route.ts      POST — evaluateOrder(orderId)
  globals.css                  Wayfair brand tokens

src/
  App.jsx                      dashboard composition
  data/
    api.js                     /dashboard-summary client + USE_MOCK_DATA toggle
    useDashboardData.js        15s poll · silent mock fallback · health probe
    mockDashboardData.js       IDs aligned to data/orders.json
  components/
    SiteHeader.jsx · SiteFooter.jsx · PartnerLogos.jsx
    KpiCards.jsx · FulfillmentBreakdown.jsx
    CriticalExceptionQueue.jsx · BottleneckLeaderboard.jsx
    SupplierRiskPanel.jsx · AgentRecommendationFeed.jsx
    OrderDetailDrawer.jsx · MarkdownText.jsx

components/                    partner-built order evaluator + chat shell
lib/
  subconscious.ts              OpenAI-compatible Subconscious provider
  agents/index.ts              chatAgent + researchAgent
  tools/index.ts               chatTools + agentTools
  tools/setship-tools.ts       evaluateSetshipOrder, listSetshipOrders
  setship/                     types · data loader · scoring engine
data/                          static operational data
public/partners/               hackathon partner logos
```

## Conventions to preserve

- `.env.local` is gitignored; `.env.example` is the committed template.
- The saved-page reference bundles (`Wayfair.com…html`, `Beat The Clock Agent Hack.html`)
  are gitignored — they were only used to mine brand cues + partner logos. The four
  partner logos we actually ship live in `public/partners/`.
- ESLint and `next build` must both pass before pushing. `react-hooks/set-state-in-effect`
  is strict in this Next.js version — defer setState calls inside `useEffect` through
  `setTimeout(_, 0)` or only in awaited microtasks. See existing examples in
  `src/data/useDashboardData.js` and `components/chat-app.tsx`.
- Build is light by design (no react-markdown, no chart lib) — `src/components/MarkdownText.jsx`
  is the in-house markdown parser for the chat. Extend it before reaching for a dep.
