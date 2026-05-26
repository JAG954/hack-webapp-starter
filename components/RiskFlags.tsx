import type { EvaluationResponse } from "@/lib/setship/types";

interface RiskFlagsProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
}

export function RiskFlags({ evaluation, isLoading }: RiskFlagsProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Risk Flags
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Exception signals
        </h2>
      </div>

      {isLoading || !evaluation ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
          Loading risk flags...
        </div>
      ) : (
        <div className="space-y-3">
          {evaluation.risk_flags.map((flag) => (
            <div
              key={flag}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {flag}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
