import type { EvaluationResponse } from "@/lib/setship/types";

interface RecommendationPanelProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
}

const recommendationTone: Record<string, string> = {
  reroute: "from-emerald-500 to-teal-500",
  hold: "from-amber-500 to-orange-500",
  split_ship: "from-sky-500 to-cyan-500",
  supplier_direct: "from-indigo-500 to-blue-500",
  escalate: "from-rose-500 to-red-500",
};

export function RecommendationPanel({
  evaluation,
  isLoading,
}: RecommendationPanelProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Agent Decision
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Recommended action
        </h2>
      </div>

      {isLoading || !evaluation ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
          Generating recommendation...
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`rounded-[24px] bg-gradient-to-br p-[1px] ${
              recommendationTone[evaluation.recommendation]
            }`}
          >
            <div className="rounded-[23px] bg-slate-950 px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Recommendation
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold capitalize">
                    {evaluation.recommendation.replace("_", " ")}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    evaluation.risk_level === "low"
                      ? "bg-emerald-400/15 text-emerald-200"
                      : evaluation.risk_level === "medium"
                        ? "bg-amber-400/15 text-amber-200"
                        : "bg-rose-400/15 text-rose-200"
                  }`}
                >
                  {evaluation.risk_level} risk
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {evaluation.summary}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Explanation
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {evaluation.explanation}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
