"use client";

import { startTransition, useEffect, useState } from "react";
import { AgentTimeline } from "@/components/AgentTimeline";
import { OptionComparison } from "@/components/OptionComparison";
import { OrderDetails } from "@/components/OrderDetails";
import { OrderSelector } from "@/components/OrderSelector";
import { InventoryMatrix } from "@/components/InventoryMatrix";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { RiskFlags } from "@/components/RiskFlags";
import type { EvaluationResponse, OrderSummary } from "@/lib/setship/types";

export function App() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Deep-link from the SetShip dashboard order drawer:
    //   /evaluate?order=ORD-1042
    // If the requested id is in the orders list, it wins; otherwise we
    // fall back to the first order (preserving original behavior).
    const requestedOrderId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("order") || ""
        : "";

    async function loadOrders() {
      setIsLoadingOrders(true);
      setError("");

      try {
        const response = await fetch("/orders");
        if (!response.ok) {
          throw new Error("Failed to load orders.");
        }

        const payload = (await response.json()) as OrderSummary[];
        if (cancelled) return;

        setOrders(payload);
        setSelectedOrderId((current) => {
          if (current) return current;
          const matched = payload.find((o) => o.order_id === requestedOrderId);
          if (matched) return matched.order_id;
          return payload[0]?.order_id || "";
        });
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
      } finally {
        if (!cancelled) {
          setIsLoadingOrders(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;

    let cancelled = false;

    async function loadEvaluation(orderId: string) {
      setIsLoadingEvaluation(true);
      setError("");

      try {
        const response = await fetch("/evaluate-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        });

        if (!response.ok) {
          throw new Error("Failed to evaluate order.");
        }

        const payload = (await response.json()) as EvaluationResponse;
        if (cancelled) return;

        setEvaluation(payload);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error ? loadError.message : "Failed to evaluate order.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingEvaluation(false);
        }
      }
    }

    startTransition(() => {
      void loadEvaluation(selectedOrderId);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedOrderId]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-white/60 bg-white/85 shadow-[0_20px_80px_rgba(16,24,40,0.12)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Wayfair Hackathon MVP
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  SetShip Agent
                </h1>
                <p className="max-w-3xl text-lg text-slate-700">
                  An AI fulfillment exception agent for incomplete furniture-set
                  orders.
                </p>
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                  Wayfair&apos;s problem is not just inventory visibility. It is
                  knowing whether a complete furniture set can actually be fulfilled
                  across fragmented supplier and warehouse inventory.
                </p>
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                  SetShip Agent turns manual fulfillment exception handling into an
                  explainable AI decision workflow.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-sm text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-emerald-300">
                Demo Story
              </p>
              <p className="text-sm leading-6 text-slate-300">
                A customer ordered a dining set. New Jersey has the tabletop and
                chairs, but the hardware kit is missing. Kentucky can transfer the
                blocker in one day. Supplier A claims it has stock, but its feed is
                31 hours stale.
              </p>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-100">
                Recommended play: reroute HW-01 from CG_KY to CG_NJ and keep the
                set consolidated.
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <OrderSelector
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelect={setSelectedOrderId}
              isLoading={isLoadingOrders}
            />
            <OrderDetails evaluation={evaluation} isLoading={isLoadingEvaluation} />
          </div>

          <InventoryMatrix evaluation={evaluation} isLoading={isLoadingEvaluation} />

          <div className="flex flex-col gap-6">
            <AgentTimeline evaluation={evaluation} isLoading={isLoadingEvaluation} />
            <RecommendationPanel
              evaluation={evaluation}
              isLoading={isLoadingEvaluation}
            />
            <OptionComparison
              evaluation={evaluation}
              isLoading={isLoadingEvaluation}
            />
            <RiskFlags evaluation={evaluation} isLoading={isLoadingEvaluation} />
          </div>
        </section>
      </div>
    </main>
  );
}
