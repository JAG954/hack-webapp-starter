import React from "react";

// Lightweight Markdown → JSX renderer scoped to what the Subconscious
// agent actually emits (headings, bold, inline code, links, bullet +
// numbered lists, paragraphs). Avoids pulling react-markdown so the
// lockfile and bundle stay small for the demo.
//
// What we handle:
//   #, ##, ### headings
//   **bold**           inline strong
//   `code`             inline monospace
//   [text](url)        inline link
//   - / * bullet lists
//   1. numbered lists
//   blank line         paragraph break
//
// Everything else falls through as a paragraph.

// Inline parser: walks the string once and emits an array of React
// nodes. Markers are checked in priority order (code → bold → link)
// so `**\`x\`**` still renders correctly.
function renderInline(text, keyPrefix = "i") {
  const nodes = [];
  let i = 0;
  let buf = "";
  let nodeIdx = 0;

  const flushBuf = () => {
    if (buf) {
      nodes.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    // Inline code: `…`
    if (ch === "`") {
      const close = text.indexOf("`", i + 1);
      if (close !== -1) {
        flushBuf();
        nodes.push(
          <code
            key={`${keyPrefix}-c-${nodeIdx++}`}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800"
          >
            {text.slice(i + 1, close)}
          </code>,
        );
        i = close + 1;
        continue;
      }
    }

    // Bold: **…**
    if (ch === "*" && text[i + 1] === "*") {
      const close = text.indexOf("**", i + 2);
      if (close !== -1) {
        flushBuf();
        nodes.push(
          <strong
            key={`${keyPrefix}-b-${nodeIdx++}`}
            className="font-semibold text-slate-900"
          >
            {renderInline(text.slice(i + 2, close), `${keyPrefix}-bn${nodeIdx}`)}
          </strong>,
        );
        i = close + 2;
        continue;
      }
    }

    // Link: [text](url)
    if (ch === "[") {
      const closeText = text.indexOf("]", i + 1);
      if (closeText !== -1 && text[closeText + 1] === "(") {
        const closeUrl = text.indexOf(")", closeText + 2);
        if (closeUrl !== -1) {
          const label = text.slice(i + 1, closeText);
          const url = text.slice(closeText + 2, closeUrl);
          flushBuf();
          nodes.push(
            <a
              key={`${keyPrefix}-l-${nodeIdx++}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[#7B189F] underline underline-offset-2 hover:text-[#9333A5]"
            >
              {label}
            </a>,
          );
          i = closeUrl + 1;
          continue;
        }
      }
    }

    buf += ch;
    i += 1;
  }
  flushBuf();
  return nodes;
}

// Detect what kind of block a single line starts.
function classifyLine(line) {
  if (/^\s*$/.test(line)) return { type: "blank" };

  const heading = /^(#{1,6})\s+(.*)$/.exec(line);
  if (heading) {
    return {
      type: "heading",
      level: Math.min(heading[1].length, 6),
      text: heading[2].trim(),
    };
  }

  const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
  if (bullet) return { type: "ul", text: bullet[1] };

  const numbered = /^\s*(\d+)\.\s+(.*)$/.exec(line);
  if (numbered) return { type: "ol", number: numbered[1], text: numbered[2] };

  return { type: "para", text: line };
}

// Block-level parser: groups consecutive classified lines into list /
// paragraph blocks so React renders them with correct semantics.
function parseBlocks(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let current = null;

  for (const raw of lines) {
    const c = classifyLine(raw);

    if (c.type === "blank") {
      if (current) blocks.push(current);
      current = null;
      continue;
    }

    if (c.type === "heading") {
      if (current) blocks.push(current);
      blocks.push({ kind: "heading", level: c.level, text: c.text });
      current = null;
      continue;
    }

    if (c.type === "ul") {
      if (!current || current.kind !== "ul")
        current = { kind: "ul", items: [] };
      current.items.push(c.text);
      continue;
    }

    if (c.type === "ol") {
      if (!current || current.kind !== "ol")
        current = { kind: "ol", items: [] };
      current.items.push(c.text);
      continue;
    }

    // Paragraph — join consecutive non-empty plain lines.
    if (!current || current.kind !== "para")
      current = { kind: "para", text: "" };
    current.text = current.text ? `${current.text} ${c.text}` : c.text;
  }
  if (current) blocks.push(current);
  return blocks;
}

const HEADING_CLS = {
  1: "mt-3 mb-2 text-lg font-semibold tracking-tight text-slate-900",
  2: "mt-3 mb-1.5 text-base font-semibold tracking-tight text-slate-900",
  3: "mt-3 mb-1 text-sm font-semibold uppercase tracking-[0.06em] text-[#7B189F]",
  4: "mt-2 mb-1 text-sm font-semibold text-slate-800",
  5: "mt-2 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-700",
  6: "mt-2 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500",
};

export default function MarkdownText({ children }) {
  const text = typeof children === "string" ? children : String(children ?? "");
  const blocks = parseBlocks(text);

  return (
    <div className="markdown-body space-y-2 text-sm leading-relaxed text-slate-800">
      {blocks.map((b, i) => {
        if (b.kind === "heading") {
          const Tag = `h${b.level}`;
          return (
            <Tag key={i} className={HEADING_CLS[b.level]}>
              {renderInline(b.text, `h-${i}`)}
            </Tag>
          );
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} className="ml-5 list-disc space-y-1 marker:text-slate-400">
              {b.items.map((it, j) => (
                <li key={j} className="pl-1">
                  {renderInline(it, `ul-${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === "ol") {
          return (
            <ol
              key={i}
              className="ml-5 list-decimal space-y-1 marker:font-semibold marker:text-[#7B189F]"
            >
              {b.items.map((it, j) => (
                <li key={j} className="pl-1">
                  {renderInline(it, `ol-${i}-${j}`)}
                </li>
              ))}
            </ol>
          );
        }
        // Paragraph
        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(b.text, `p-${i}`)}
          </p>
        );
      })}
    </div>
  );
}
