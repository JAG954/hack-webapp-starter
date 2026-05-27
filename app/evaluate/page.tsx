import Link from "next/link";
import { App as EvaluateApp } from "@/components/App";
import PartnerLogos from "@/src/components/PartnerLogos.jsx";

// Partner's order-evaluation UI lives here so the SetShip ops dashboard
// at "/" can deep-link into a specific order. The page itself is a thin
// wrapper — all behavior lives in components/App.tsx, which reads
// ?order=<id> on mount for the drawer's "View full evaluation" handoff.
export default function EvaluatePage() {
  return (
    <>
      {/* Slim Wayfair-purple-themed nav bar — bridges back to the
          dashboard / chat without disturbing the partner's UI below. */}
      <nav className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-[#7B189F]"
          >
            <span className="text-xs">←</span>
            <span className="font-medium">SetShip Dashboard</span>
          </Link>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-xs">
            <Link
              href="/"
              className="rounded-full px-3 py-1 font-medium text-slate-500 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <span className="rounded-full bg-[#7B189F] px-3 py-1 font-medium text-white shadow-sm">
              Evaluate
            </span>
            <Link
              href="/chat"
              className="rounded-full px-3 py-1 font-medium text-slate-500 hover:text-slate-900"
            >
              Agent
            </Link>
          </div>
        </div>
      </nav>
      <EvaluateApp />
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <PartnerLogos />
      </div>
    </>
  );
}
