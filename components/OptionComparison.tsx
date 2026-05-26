import type { EvaluationResponse } from "@/lib/setship/types";

interface OptionComparisonProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
}

export function OptionComparison({
  evaluation,
  isLoading,
}: OptionComparisonProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Option Comparison
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Why this option wins
        </h2>
      </div>

      {isLoading || !evaluation ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
          Scoring recovery options...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="pb-3">Option</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Delay</th>
                <th className="pb-3">Extra Cost</th>
                <th className="pb-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluation.options.map((option) => {
                const isWinner = option.option === evaluation.recommendation;

                return (
                  <tr key={option.option} className={isWinner ? "bg-emerald-50/70" : ""}>
                    <td className="py-3 pr-4 font-medium capitalize text-slate-950">
                      {option.option.replace("_", " ")}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{option.score}</td>
                    <td className="py-3 pr-4 text-slate-700">
                      {option.delay_days}d
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      ${option.extra_cost}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          option.risk === "low"
                            ? "bg-emerald-100 text-emerald-700"
                            : option.risk === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {option.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
