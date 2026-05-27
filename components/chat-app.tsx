"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "@/src/components/SiteHeader.jsx";
import PartnerLogos from "@/src/components/PartnerLogos.jsx";

type Mode = "chat" | "agent";

// SetShip-themed seed prompts shown in the empty state. IDs match the
// orders the partner backend actually scores (data/orders.json), so a
// click + send produces a real-data answer.
const SEED_PROMPTS: { mode: Mode; text: string }[] = [
  {
    mode: "chat",
    text: "Why is order ORD-1042 split-ship instead of single-ship?",
  },
  {
    mode: "chat",
    text: "Which suppliers are driving today's red exception queue?",
  },
  {
    mode: "agent",
    text: "Run a root-cause pass on ORD-1043 (Aspen Bedroom Set) and propose two recovery paths.",
  },
  {
    mode: "agent",
    text: "Audit our top 5 component bottlenecks and recommend where to pre-position inventory next quarter.",
  },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function MessagePart({
  part,
  messageId,
  index,
}: {
  part: UIMessage["parts"][number];
  messageId: string;
  index: number;
}) {
  if (part.type === "text") {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{part.text}</p>
    );
  }

  if (part.type === "file" && part.mediaType?.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={part.url}
        alt={part.filename ?? "Uploaded image"}
        className="mt-2 max-h-48 rounded-lg border border-slate-200 object-contain"
      />
    );
  }

  if (part.type.startsWith("tool-")) {
    const label = part.type.replace("tool-", "");
    const state = "state" in part ? part.state : "unknown";
    return (
      <div
        key={`${messageId}-tool-${index}`}
        className="mt-2 rounded-lg border border-[#7B189F]/30 bg-[#7B189F]/[0.06] px-3 py-2 text-xs"
      >
        <div className="font-medium text-[#7B189F]">Tool: {label}</div>
        <div className="mt-1 text-slate-600">
          {state === "input-available" && "Calling…"}
          {state === "output-available" && "Done"}
          {state === "output-error" && "Error"}
        </div>
      </div>
    );
  }

  return null;
}

export function ChatApp() {
  const [mode, setMode] = useState<Mode>("chat");
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  // null = haven't checked yet (don't flash a banner during the first paint).
  const [agentReady, setAgentReady] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep-link from the dashboard order drawer: /chat?prefill=<text>&mode=agent
  // Reading from window.location keeps this page statically renderable
  // (useSearchParams would force a Suspense boundary + dynamic render).
  // The state updates are deferred through setTimeout(_, 0) so they don't
  // fire synchronously inside the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("prefill");
    const requestedMode = params.get("mode");
    const timer = setTimeout(() => {
      if (prefill) setInput(prefill);
      if (requestedMode === "agent" || requestedMode === "chat") {
        setMode(requestedMode);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Probe /api/health so we can show a clear "set the key" banner instead
  // of letting the user submit a prompt that 500s on the server. Deferred
  // through setTimeout(0) for the same lint-rule reason as the prefill
  // effect.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) throw new Error("health check failed");
        const data = (await res.json()) as { agentReady?: boolean };
        if (!cancelled) setAgentReady(Boolean(data.agentReady));
      } catch {
        if (!cancelled) setAgentReady(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { mode },
      }),
    [mode],
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });

  const isBusy = status === "streaming" || status === "submitted";

  const visibleSeeds = SEED_PROMPTS.filter((p) => p.mode === mode);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text && !imageFile) return;

    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; mediaType: string; url: string; filename?: string }
    > = [];

    if (imageFile) {
      parts.push({
        type: "file",
        mediaType: imageFile.type || "image/png",
        url: await fileToDataUrl(imageFile),
        filename: imageFile.name,
      });
    }

    if (text) {
      parts.push({ type: "text", text });
    }

    sendMessage({ parts });
    setInput("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const modeToggle = (
    <div className="flex rounded-full border border-slate-200 bg-white p-1">
      <button
        type="button"
        onClick={() => setMode("chat")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
          mode === "chat"
            ? "bg-[#7B189F] text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Chat
      </button>
      <button
        type="button"
        onClick={() => setMode("agent")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
          mode === "agent"
            ? "bg-[#7B189F] text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Agent
      </button>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col text-slate-900">
      <SiteHeader subtitle="Agent Workspace" actions={modeToggle} />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          {mode === "chat" ? (
            <p>
              <span className="font-medium text-[#7B189F]">Chat mode</span> — fast
              answers about a specific order, supplier, or component. Best for
              follow-ups from the dashboard (open an order &rarr; “Ask the
              agent”).
            </p>
          ) : (
            <p>
              <span className="font-medium text-[#7B189F]">Agent mode</span> —
              multi-step fulfillment reasoning: bottleneck root-cause, supplier
              recovery plans, inventory rebalancing. Up to 30 tool steps.
            </p>
          )}
        </div>

        {agentReady === false ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <span className="font-semibold">Agent offline.</span>
            <span>
              <code className="rounded bg-amber-100 px-1 text-amber-900">
                SUBCONSCIOUS_API_KEY
              </code>{" "}
              is not set on the server. Drop it in{" "}
              <code className="rounded bg-amber-100 px-1 text-amber-900">
                .env.local
              </code>{" "}
              and restart{" "}
              <code className="rounded bg-amber-100 px-1 text-amber-900">
                pnpm start
              </code>
              . Get a key at{" "}
              <a
                href="https://www.subconscious.dev/platform"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-amber-950"
              >
                subconscious.dev/platform
              </a>
              .
            </span>
          </div>
        ) : null}

        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-slate-500">
              <p className="text-lg font-medium text-slate-900">
                Ask the SetShip agent
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try a fulfillment question, or open an order from the dashboard.
              </p>
              <ul className="mt-4 grid w-full max-w-xl gap-2 text-left text-sm">
                {visibleSeeds.map((seed) => (
                  <li key={seed.text}>
                    <button
                      type="button"
                      onClick={() => setInput(seed.text)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 transition hover:border-[#7B189F] hover:text-[#7B189F]"
                    >
                      {seed.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#7B189F] text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                <div
                  className={`mb-1 text-xs font-medium uppercase tracking-wide ${
                    message.role === "user"
                      ? "text-white/70"
                      : "text-[#7B189F]"
                  }`}
                >
                  {message.role}
                </div>
                {message.parts.map((part, index) => (
                  <MessagePart
                    key={`${message.id}-${index}`}
                    part={part}
                    messageId={message.id}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ))}

          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#7B189F]" />
              {mode === "agent" ? "Agent running…" : "Thinking…"}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-[#990E35]/30 bg-[#990E35]/[0.06] px-3 py-2 text-sm text-[#990E35]">
            {error.message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {imageFile && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>
                Image:{" "}
                <span className="text-[#7B189F]">{imageFile.name}</span>
              </span>
              <button
                type="button"
                className="text-[#7B189F] hover:text-[#9333A5] hover:underline"
                onClick={() => {
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setImageFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#7B189F] hover:text-[#7B189F]"
              title="Attach image for multimodal reasoning"
            >
              Image
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                mode === "agent"
                  ? "Kick off a long-running agent task…"
                  : "Send a message…"
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7B189F] focus:ring-2 focus:ring-[#7B189F]/30"
              disabled={isBusy}
            />
            {isBusy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#7B189F]"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !imageFile}
                className="rounded-xl bg-[#7B189F] px-4 py-2 text-sm font-medium text-white hover:bg-[#9333A5] disabled:opacity-40"
              >
                Send
              </button>
            )}
          </div>
        </form>

        <div className="mt-6">
          <PartnerLogos />
        </div>
      </main>
    </div>
  );
}
