import React from "react";

// Official hackathon partners from "Beat The Clock Agent Hack" — Companies
// 01–04 on the event page. Logos live in /public/partners/ and were
// pulled from the saved event HTML so the brand marks render even
// offline during the demo.
const PARTNERS = [
  {
    name: "Baseten",
    role: "AI infrastructure",
    src: "/partners/baseten.png",
    href: "https://www.baseten.co",
  },
  {
    name: "Subconscious",
    role: "Open model agents",
    src: "/partners/subconscious.jpg",
    href: "https://www.subconscious.dev",
  },
  {
    name: "Cloudflare",
    role: "Tooling for agents",
    src: "/partners/cloudflare.jpg",
    href: "https://www.cloudflare.com",
  },
  {
    name: "Wayfair",
    role: "Hackathon host",
    src: "/partners/wayfair.png",
    href: "https://www.wayfair.com",
  },
];

/**
 * Slim "powered by" strip used in the dashboard + chat footers.
 * Logos render in muted grayscale by default and recolor on hover so
 * the brand marks are present but never compete with foreground data.
 *
 * @param {{ caption?: string }} [props]
 */
export default function PartnerLogos(props = {}) {
  const caption = props.caption ?? "Beat The Clock Agent Hack · Partners";
  return (
    <section
      aria-label="Hackathon partners"
      className="rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 shadow-sm backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {caption}
        </p>
        <span className="text-[11px] text-slate-400">
          Wayfair · Boston · May 26, 2026
        </span>
      </div>
      <ul className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
        {PARTNERS.map((p) => (
          <li key={p.name} className="flex items-center justify-center">
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              title={`${p.name} — ${p.role}`}
              className="group flex h-12 items-center justify-center px-2"
            >
              {/* Plain img so we don't need next/image domain config and
                  the logo is bundle-free for the offline demo. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={`${p.name} logo`}
                className="max-h-10 max-w-[140px] object-contain opacity-70 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
