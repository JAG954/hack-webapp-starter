import type { EvaluationResponse } from "@/lib/setship/types";

interface AgentTimelineProps {
  evaluation: EvaluationResponse | null;
  isLoading: boolean;
}

export function AgentTimeline({ evaluation, isLoading }: AgentTimelineProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Agent Progress
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Multi-agent workflow
        </h2>
      </div>

      {isLoading || !evaluation ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Running order agents...
        </div>
      ) : (
        <div className="space-y-3">
          {evaluation.agent_steps.map((step) => (
            <div
              key={step.agent}
              className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{step.agent}</p>
                  <p className="text-xs text-slate-600">{step.output}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
