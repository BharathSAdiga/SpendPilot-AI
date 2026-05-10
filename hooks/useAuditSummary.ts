/**
 * hooks/useAuditSummary.ts
 *
 * React hook that fetches an AI-generated audit summary from POST /api/summary.
 *
 * Usage:
 *   const { summary, loading, error, generate } = useAuditSummary();
 *   // call generate(auditResult) to trigger generation
 */

"use client";

import { useState, useCallback } from "react";
import type { AuditResult } from "@/types/auditEngine";
import type { AuditSummaryResult, SummaryRequest } from "@/types/aiSummary";

export type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: AuditSummaryResult }
  | { status: "error";   error: string };

/** Converts an AuditResult into the leaner SummaryRequest payload */
function buildRequest(result: AuditResult): SummaryRequest {
  return {
    companyName:              result.input.companyName,
    teamSize:                 result.input.teamSize,
    primaryUseCase:           result.input.primaryUseCase,
    totalMonthlySpendUsd:     result.totalMonthlySpendUsd,
    totalPotentialSavingsUsd: result.totalPotentialSavingsUsd,
    totalAnnualSavingsUsd:    result.savingsProjection.totalAnnualUsd,
    savingsRatePct:           result.savingsProjection.savingsRatePct,
    overallScore:             result.overallScore,
    findingCounts:            result.findingCounts,
    topFindings: result.topRecommendations.slice(0, 3).map((f) => ({
      title:            f.title,
      action:           f.action,
      monthlySavingUsd: f.estimatedMonthlySavingsUsd,
    })),
    byTimeline: result.savingsProjection.byTimeline,
  };
}

export function useAuditSummary() {
  const [state, setState] = useState<SummaryState>({ status: "idle" });

  const generate = useCallback(async (result: AuditResult) => {
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/summary", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(buildRequest(result)),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setState({ status: "error", error: data.error ?? "Unknown error" });
        return;
      }

      setState({ status: "success", summary: data.summary });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return {
    state,
    summary:  state.status === "success" ? state.summary : null,
    loading:  state.status === "loading",
    error:    state.status === "error"   ? state.error   : null,
    generate,
    reset,
  };
}
