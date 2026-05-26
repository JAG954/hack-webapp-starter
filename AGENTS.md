<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hackathon starter

Next.js app with chat + long-running agents on **Subconscious** via the **Vercel AI SDK**.

## Before you code

1. Read `.agents/skills/subconscious-dev/SKILL.md` for Subconscious API details.
2. Key env var: `SUBCONSCIOUS_API_KEY` (from https://www.subconscious.dev/platform).
3. Extend tools in `lib/tools/` and agents in `lib/agents/`.

## Layout

- `lib/subconscious.ts` — model provider
- `lib/tools/` — function tools + MCP bridge template
- `lib/agents/` — `ToolLoopAgent` chat vs research agents
- `app/api/chat/route.ts` — streaming API
- `components/chat-app.tsx` — UI
