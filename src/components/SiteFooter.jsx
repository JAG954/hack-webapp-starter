import React from "react";
import PartnerLogos from "./PartnerLogos.jsx";

// All copy here was pulled from the saved hackathon event page
// ("Beat The Clock Agent Hack.html") so the footer matches the
// official event details word-for-word.
const EVENT = {
  name: "Beat The Clock Agent Hack",
  date: "Tuesday, May 26, 2026",
  time: "5:00 PM – 8:30 PM ET",
  location: "Wayfair Office, Boston",
  address: "4 Copley Place, Boston, MA",
  url: "https://hack.subconscious.dev",
};

const TRACK = {
  number: "02",
  name: "Agents for Supply Chain",
  prompt:
    "Hundreds of thousands of pieces of furniture are shipped around the world by Wayfair and its vast network of suppliers. How can agents manage this complex supply chain?",
  challenge:
    "Build an agent that improves Wayfair's ability to manage its supply chain.",
};

const BUILDERS = [
  { name: "Jishnu Auro Ghosh" },
  { name: "Hsiang Yu Huang" },
];

/**
 * Rich footer used at the bottom of every SetShip page. Combines:
 *  - Event details (date, time, venue) lifted from the saved page
 *  - Track 02 badge + the official challenge prompt
 *  - Builder credits
 *  - PartnerLogos strip (Baseten · Subconscious · Cloudflare · Wayfair)
 */
export default function SiteFooter() {
  return (
    <footer className="mt-2">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Event */}
        <section className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Built for
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-slate-900">
            {EVENT.name}
          </h3>
          <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex gap-2">
              <dt className="w-16 text-slate-400">Date</dt>
              <dd className="tabular-nums text-slate-700">{EVENT.date}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-slate-400">Time</dt>
              <dd className="tabular-nums text-slate-700">{EVENT.time}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-slate-400">Venue</dt>
              <dd className="text-slate-700">{EVENT.location}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-slate-400">Address</dt>
              <dd className="text-slate-700">{EVENT.address}</dd>
            </div>
          </dl>
          <a
            href={EVENT.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#7B189F] hover:text-[#9333A5]"
          >
            Event page ↗
          </a>
        </section>

        {/* Track */}
        <section className="rounded-2xl border border-[#7B189F]/30 bg-[#7B189F]/[0.05] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#7B189F] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-white">
              TRACK {TRACK.number}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7B189F]">
              Our track
            </p>
          </div>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900">
            {TRACK.name}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {TRACK.prompt}
          </p>
          <p className="mt-3 rounded-lg border border-[#7B189F]/20 bg-white/70 px-3 py-2 text-xs leading-relaxed text-slate-800">
            <span className="font-semibold text-[#7B189F]">Challenge: </span>
            {TRACK.challenge}
          </p>
        </section>

        {/* Builders */}
        <section className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Developed by
          </p>
          <ul className="mt-3 space-y-2">
            {BUILDERS.map((b) => (
              <li
                key={b.name}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7B189F] text-[11px] font-bold text-white">
                  {b.name
                    .split(" ")
                    .map((p) => p[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")}
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {b.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
            SetShip Agent — an explainable fulfillment exception agent for
            incomplete furniture-set orders. Built end-to-end in under three
            hours.
          </p>
        </section>
      </div>

      {/* Partner logos */}
      <div className="mt-4">
        <PartnerLogos />
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-500 sm:flex-row">
        <p>
          SetShip Agent · static-data demo + live agent via Subconscious TIM
          (Qwen3.6-27B)
        </p>
        <p className="font-mono">
          Track 02 · Agents for Supply Chain · Boston · May 26, 2026
        </p>
      </div>
    </footer>
  );
}
