"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/evaluate", label: "Evaluate" },
  { href: "/chat", label: "Agent" },
];

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm font-medium transition ${
        active
          ? "bg-[#7B189F] text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Shared top bar styled in the Wayfair palette (white surface, purple
 * brand accents). Renders:
 *  - SS logo + brand
 *  - Dashboard / Evaluate / Agent pill nav (active route highlighted)
 *  - Optional `actions` slot for page-specific controls (status pill,
 *    refresh button on the dashboard; mode toggle on the agent page)
 */
export default function SiteHeader({ subtitle, actions }) {
  const pathname = usePathname();
  const activeHref = pathname?.startsWith("/chat")
    ? "/chat"
    : pathname?.startsWith("/evaluate")
      ? "/evaluate"
      : "/";

  return (
    <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7B189F] text-sm font-bold text-white shadow-sm">
              SS
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7B189F]">
                SetShip Agent
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                {subtitle ?? "Furniture-Set Fulfillment"}
              </h1>
            </div>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 rounded-full border border-slate-200 bg-white p-1 sm:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={activeHref === item.href}
              />
            ))}
          </nav>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {actions}
          </div>
        ) : null}
      </div>

      {/* Compact nav for mobile widths */}
      <nav className="mx-auto flex max-w-[1400px] items-center gap-1 px-5 pb-3 sm:hidden">
        <div className="flex w-full items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={activeHref === item.href}
            />
          ))}
        </div>
      </nav>
    </header>
  );
}
