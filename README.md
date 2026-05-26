# Hackathon Starter — Chat & Agents on Subconscious

A minimal Next.js app for the **Wayfair × Subconscious × Baseten × Cloudflare** hackathon. Chat with TIM-Qwen3.6, kick off long-running agents, attach images, and extend with your own tools and MCP servers.

## Get started in 3 minutes

### 1. Get a Subconscious API key

You need a Subconscious API key to run inference.

1. Go to **[subconscious.dev/platform](https://www.subconscious.dev/platform)**
2. Sign up and create an API key (starts with `sky_`)
3. Copy it — you'll add it to `.env.local`

### 2. Install and run

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local and set SUBCONSCIOUS_API_KEY=sky_...

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Try it

- **Chat mode** — quick back-and-forth with weather & calculator tools
- **Agent mode** — multi-step research agent (web search stub, long tasks, MCP examples)
- **Image button** — attach a screenshot or photo for multimodal reasoning (data URLs work best)

## What's in the box

| Piece | Location | Purpose |
|-------|----------|---------|
| Subconscious provider | `lib/subconscious.ts` | OpenAI-compatible client → `api.subconscious.dev` |
| Chat agent | `lib/agents/index.ts` | Fast chat, 8 tool steps max |
| Research agent | `lib/agents/index.ts` | Long-running, 30 tool steps, thinking on |
| Example tools | `lib/tools/index.ts` | Weather, math, web search stub, long task |
| MCP bridge template | `lib/tools/mcp-tools.ts` | Wrap MCP tools as AI SDK tools |
| Chat API | `app/api/chat/route.ts` | Streams agent output via Vercel AI SDK |
| UI | `components/chat-app.tsx` | Chat + agent mode toggle, image upload |

Built with [Vercel AI SDK](https://ai-sdk.dev) `ToolLoopAgent` and [Subconscious](https://www.subconscious.dev) inference (TIM-Qwen3.6-27B on Baseten/sglang).

## Hackathon extension points

### Add a tool

Edit `lib/tools/index.ts`:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const myTool = tool({
  description: "What this tool does",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    // Call your API, database, Cloudflare Worker, Baseten endpoint…
    return { result: query };
  },
});
```

Register it in `chatTools` or `agentTools`, then restart the dev server.

### Connect MCP servers

See `lib/tools/mcp-tools.ts` for the bridge pattern. MCP tools become standard OpenAI function tools that Subconscious can call — your server executes them client-side in the agent loop.

```bash
pnpm add @modelcontextprotocol/sdk
```

Wire your MCP client's `callTool()` inside each tool's `execute` function.

### Multimodal (images)

The UI sends images as base64 data URLs. Subconscious supports vision via `image_url` blocks — data URLs are the most reliable path. See `.agents/skills/subconscious-dev/references/multimodal.md`.

### Long-running agents

Agent mode uses `stopWhen: stepCountIs(30)` and `maxDuration = 300` on the API route. Tune these in `lib/agents/index.ts` and `app/api/chat/route.ts`.

## AI agent skill (included)

This repo ships the **subconscious-dev** skill so coding agents understand the API:

```bash
npx skills add https://github.com/subconscious-systems/skills --skill subconscious-dev
```

Skill files live in `.agents/skills/subconscious-dev/`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUBCONSCIOUS_API_KEY` | Yes | API key from [subconscious.dev/platform](https://www.subconscious.dev/platform) |

## Deploy

Works on Vercel, Cloudflare Pages, or any Node host. Set `SUBCONSCIOUS_API_KEY` in your deployment environment.

```bash
pnpm build
pnpm start
```

## Sponsors

Built for hackers working with **Wayfair**, **Subconscious**, **Baseten**, and **Cloudflare**. Subconscious powers the model; Baseten serves inference; extend with Cloudflare Workers and MCP for your project.

## Links

- [Subconscious Platform](https://www.subconscious.dev/platform) — get your API key
- [Subconscious Docs](https://docs.subconscious.dev)
- [Vercel AI SDK Agents](https://ai-sdk.dev/docs/agents/overview)
- [Subconscious API skill](https://github.com/subconscious-systems/skills)
