"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo, useRef, useState } from "react";

type Mode = "chat" | "agent";

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
        className="mt-2 max-h-48 rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
      />
    );
  }

  if (part.type.startsWith("tool-")) {
    const label = part.type.replace("tool-", "");
    const state = "state" in part ? part.state : "unknown";
    return (
      <div
        key={`${messageId}-tool-${index}`}
        className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs dark:border-amber-900/50 dark:bg-amber-950/40"
      >
        <div className="font-medium text-amber-900 dark:text-amber-200">
          Tool: {label}
        </div>
        <div className="mt-1 text-amber-800/80 dark:text-amber-300/80">
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Hackathon Starter
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              Chat + Agents on Subconscious
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Wayfair · Subconscious · Baseten · Cloudflare
            </p>
          </div>

          <div className="flex rounded-full border border-zinc-200 p-1 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "chat"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("agent")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === "agent"
                  ? "bg-violet-600 text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              Agent
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          {mode === "chat" ? (
            <p>
              <span className="font-medium">Chat mode</span> — fast replies with
              basic tools. Attach an image for multimodal reasoning (use data
              URLs; see{" "}
              <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
                lib/subconscious.ts
              </code>
              ).
            </p>
          ) : (
            <p>
              <span className="font-medium">Agent mode</span> — long-running
              multi-step agent with web search, background tasks, and MCP tool
              stubs. Kick off research and let it run up to 30 tool steps.
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-zinc-500">
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                Try something to get started
              </p>
              <ul className="mt-4 max-w-md space-y-2 text-sm">
                <li>“What&apos;s the weather in Boston?”</li>
                <li>“Calculate (17 * 23) + 100”</li>
                <li>Attach a screenshot and ask what you see</li>
                <li>
                  Switch to Agent: “Research hackathon project ideas for retail
                  AI”
                </li>
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
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                }`}
              >
                <div className="mb-1 text-xs font-medium uppercase tracking-wide opacity-60">
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
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              {mode === "agent" ? "Agent running…" : "Thinking…"}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error.message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {imageFile && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span>Image: {imageFile.name}</span>
              <button
                type="button"
                className="text-red-600 hover:underline"
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
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
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
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none ring-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              disabled={isBusy}
            />
            {isBusy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-medium dark:bg-zinc-800"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !imageFile}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
              >
                Send
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
