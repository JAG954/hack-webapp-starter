# SetShip Agent

> An explainable AI fulfillment-exception agent for incomplete furniture-set orders.
> Built at **Beat The Clock Agent Hack** (Track 02 — Agents for Supply Chain),
> hosted by Wayfair in Boston on May 26, 2026.

Wayfair's hard problem isn't just inventory visibility — it's deciding, in real
time, whether a complete furniture set can actually be fulfilled across a
fragmented network of CastleGate warehouses and external suppliers. SetShip
Agent turns that exception-handling triage into an **explainable AI workflow**:
a high-level ops dashboard that surfaces the red category at a glance, and a
per-order drill-in that scores every fulfillment option (hold, reroute,
split-ship, supplier-direct, escalate) and tells you _why_ the agent
recommends what it recommends.

**Built by:** Jishnu Auro Ghosh · Hsiang Yu Huang

---

## What's interesting here

- **Live agent + deterministic scoring engine** working side-by-side.
  The free-form chat at `/chat` streams real responses from Subconscious
  (TIM-Qwen3.6-27B) with markdown rendering and a tool-call timeline.
  The structured per-order evaluation at `/evaluate` runs the scoring
  engine in `lib/setship/evaluate.ts` against the static dataset in
  `data/*.json` and returns a fully explainable recommendation in &lt;50ms.
- **Three coordinated UI surfaces in one product.** A SetShip-purple ops
  dashboard at `/`, the partner-built order evaluator at `/evaluate`, and
  the Subconscious agent at `/chat`. Deep-link from any red-category row
  into the evaluator (preselects the order) or the agent (pre-fills a
  context-rich prompt) without losing state.
- **Wayfair-native visual language.** Brand purple `#7B189F` and sale-tag
  magenta `#990E35` were extracted from wayfair.com and applied as
  semantic tokens — red category = magenta, brand actions = purple — so
  the demo feels native to the host's product, not bolted on.
- **Graceful degradation.** Dashboard polls `GET /dashboard-summary`
  every 15s and silently falls back to mock data if the endpoint isn't
  available, so the demo is bulletproof. `/api/health` reports key status
  so the UI can show "Agent offline" instead of letting the user hit a
  silent 500.

---

## Demo flow

1. Open `/` — SetShip ops dashboard. Glance at the KPIs (218 orders
   saved by the agent in the last 24h), the fulfillment breakdown, and
   the red Critical Exceptions table.
2. Click any red row (e.g. `ORD-1042`). A drawer slides in with the set
   components, the per-SKU inventory state (in-stock / inbound /
   backordered / quality-hold), the risk reason, and the agent's plain-
   English recommendation.
3. Click **"View full evaluation →"** to jump to `/evaluate?order=ORD-1042`.
   The page preselects the order and runs the deterministic scoring
   engine — inventory matrix across nodes, scored options, risk flags,
   the agent timeline.
4. Click **"Ask agent →"** instead to jump to `/chat` with a context-rich
   prompt already loaded. Hit send and the Subconscious agent streams a
   live answer (markdown-formatted, complete with tool calls).

---

## Quick start

**1. Get a Subconscious API key**

Sign up at [subconscious.dev/platform](https://www.subconscious.dev/platform)
and copy your key (`sky_...`).

**2. Install + configure**

```bash
pnpm install
cp .env.example .env.local
# Add SUBCONSCIOUS_API_KEY=sky_... to .env.local
```

**3. Run**

```bash
pnpm build && pnpm start
# → http://localhost:3000
```

For development with hot reload: `pnpm dev`.

---

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 |
| Agent runtime | Vercel AI SDK · `ToolLoopAgent` |
| Model | Subconscious TIM-Qwen3.6-27B via OpenAI-compatible API |
| Scoring | Deterministic TypeScript engine — no LLM in the loop for `/evaluate` |
| Validation | Zod (tool input schemas) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          /  (dashboard)                          │
│   KpiCards · FulfillmentBreakdown · CriticalExceptionQueue       │
│   BottleneckLeaderboard · SupplierRiskPanel                      │
│   AgentRecommendationFeed · OrderDetailDrawer                    │
│   useDashboardData hook  ─►  /dashboard-summary (mock fallback)  │
│                          ─►  /api/health (agent-online chip)     │
└────────────────────────────┬────────────────────────────────────┘
                             │  deep-link: ?order=<id>
                             ▼
        ┌──────────────────────────────────────────────┐
        │              /evaluate (drill-in)             │
        │   OrderSelector · OrderDetails ·              │
        │   InventoryMatrix · OptionComparison ·        │
        │   RecommendationPanel · RiskFlags ·           │
        │   AgentTimeline                               │
        │                                               │
        │   /orders            ─► listOrders()          │
        │   /evaluate-order    ─► evaluateOrder()       │
        │      (deterministic scoring engine in         │
        │       lib/setship/evaluate.ts)                │
        └──────────────────────────────────────────────┘

                             │  deep-link: ?prefill=<context>
                             ▼
        ┌──────────────────────────────────────────────┐
        │              /chat (free-form agent)          │
        │   SiteHeader · MarkdownText · seed prompts    │
        │   useChat (Vercel AI SDK)                     │
        │                                               │
        │   /api/chat  ─► ToolLoopAgent + Subconscious  │
        │                  + setship-tools (eval, etc.) │
        └──────────────────────────────────────────────┘
```

---

## Repo map

```
app/
├── page.tsx                       # mounts <App /> from src/App.jsx
├── chat/page.tsx                  # mounts <ChatApp />
├── evaluate/page.tsx              # mounts partner's <App /> + nav
├── api/
│   ├── chat/route.ts              # streaming Subconscious agent
│   └── health/route.ts            # key-status probe
├── orders/route.ts                # GET — partner backend
├── evaluate-order/route.ts        # POST — partner backend scoring
└── globals.css                    # Wayfair brand tokens

src/
├── App.jsx                        # dashboard composition
├── data/
│   ├── api.js                     # fetch client + USE_MOCK_DATA toggle
│   ├── useDashboardData.js        # 15s poll, silent fallback, health probe
│   └── mockDashboardData.js       # IDs aligned to data/orders.json
└── components/
    ├── SiteHeader.jsx             # shared nav (Dashboard / Evaluate / Agent)
    ├── SiteFooter.jsx             # event + track + builders + logos
    ├── PartnerLogos.jsx           # Baseten · Subconscious · Cloudflare · Wayfair
    ├── KpiCards.jsx
    ├── FulfillmentBreakdown.jsx
    ├── CriticalExceptionQueue.jsx # the dominant red-category surface
    ├── BottleneckLeaderboard.jsx
    ├── SupplierRiskPanel.jsx
    ├── AgentRecommendationFeed.jsx
    ├── OrderDetailDrawer.jsx
    └── MarkdownText.jsx           # in-house markdown → JSX renderer

components/                        # partner-built order evaluator UI
├── App.tsx
├── OrderSelector.tsx · OrderDetails.tsx · InventoryMatrix.tsx
├── OptionComparison.tsx · RecommendationPanel.tsx · RiskFlags.tsx
├── AgentTimeline.tsx
└── chat-app.tsx                   # Subconscious chat (rebranded)

lib/
├── subconscious.ts                # OpenAI-compatible Subconscious provider
├── agents/index.ts                # chatAgent + researchAgent (ToolLoopAgent)
├── tools/index.ts                 # chatTools + agentTools
├── tools/setship-tools.ts         # evaluateSetshipOrder, listSetshipOrders
└── setship/
    ├── types.ts                   # OrderRecord, InventoryMatrixRow, ScoredOption…
    ├── data.ts                    # static-data loader
    └── evaluate.ts                # deterministic scoring engine (~750 lines)

data/                              # static operational data
└── *.json                         # bom · components · inventory · lanes …

public/partners/                   # hackathon partner logos
└── baseten.png · subconscious.jpg · cloudflare.jpg · wayfair.png
```

---

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `SUBCONSCIOUS_API_KEY` | yes | Streaming chat + agent at `/chat`. [Get a key](https://www.subconscious.dev/platform). |
| `NEXT_PUBLIC_DASHBOARD_API_URL` | no | Override the dashboard's live-data endpoint. Defaults to `http://localhost:8000/dashboard-summary`; mock data is used if unreachable. |

---

## Verification

```bash
pnpm lint    # → 0 errors
pnpm build   # → ✓ 8 routes (/ /_not-found /api/chat /api/health /chat /evaluate /evaluate-order /orders)
pnpm start   # → Ready in ~150ms on :3000

# Confirm agent works end-to-end
curl -s http://localhost:3000/api/health
# → {"hasSubconsciousKey":true,"agentReady":true}
```

---

## Credits

Built for **Beat The Clock Agent Hack**, Wayfair Office, Boston · May 26, 2026.

| Partner | Role |
|---|---|
| **Baseten** | AI infrastructure |
| **Subconscious** | Open-model agents (TIM-Qwen3.6-27B) |
| **Cloudflare** | Tooling for agents |
| **Wayfair** | Hackathon host |

**Team:** Jishnu Auro Ghosh · Hsiang Yu Huang
