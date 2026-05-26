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
          ? "bg-[#FF5C28] text-black"
          : "text-zinc-400 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Shared top bar for the SetShip product. Renders:
 *  - SS logo + brand
 *  - Dashboard / Agent pill nav (active route highlighted)
 *  - Optional `actions` slot for page-specific controls (status pill,
 *    refresh button on the dashboard; mode toggle on the agent page)
 */
export default function SiteHeader({ subtitle, actions }) {
  const pathname = usePathname();
  // Match the longest NAV prefix; "/" wins by default since it always
  // matches. Order in NAV matters less because we compare full prefixes.
  const activeHref = pathname?.startsWith("/chat")
    ? "/chat"
    : pathname?.startsWith("/evaluate")
      ? "/evaluate"
      : "/";

  return (
    <header className="border-b border-zinc-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF5C28] text-sm font-bold text-black">
              SS
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FF5C28]">
                SetShip Agent
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                {subtitle ?? "Furniture-Set Fulfillment"}
              </h1>
            </div>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1 sm:flex">
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            {actions}
          </div>
        ) : null}
      </div>

      {/* Compact nav for mobile widths */}
      <nav className="mx-auto flex max-w-[1400px] items-center gap-1 px-5 pb-3 sm:hidden">
        <div className="flex w-full items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1">
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
