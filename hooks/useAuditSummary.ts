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

/** Generates a deterministic local fallback if the API fails */
function buildFallbackSummary(req: SummaryRequest): AuditSummaryResult {
  const fmtUsd = (n: number) =>
    `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const executive = `Our audit identified ${req.findingCounts.total} findings with a total savings opportunity of ${fmtUsd(req.totalAnnualSavingsUsd)} per year. Your current portfolio score is ${req.overallScore}/100, indicating ${req.overallScore >= 75 ? "strong efficiency with minor optimizations available" : req.overallScore >= 50 ? "moderate efficiency with clear areas for improvement" : "significant opportunities to reduce wasted spend"}.`;

  const topActions = req.topFindings.length > 0
    ? req.topFindings.map(f => `${f.action.replace(/_/g, " ")}: ${f.title} to save ${fmtUsd(f.monthlySavingUsd)}/mo`)
    : ["No critical actions required at this time.", "Continue monitoring tool usage.", "Maintain current plan tiers."];

  // Ensure we always have exactly 3 top actions for UI consistency
  while (topActions.length < 3) {
    topActions.push("Review remaining tools for potential consolidation.");
  }

  const outlook = `Implementing these recommendations will reduce your monthly spend by ${req.savingsRatePct.toFixed(0)}%, recovering ${fmtUsd(req.totalPotentialSavingsUsd)} monthly for redeployment.`;

  return {
    executive,
    topActions: topActions.slice(0, 3),
    outlook,
    generatedAt: new Date().toISOString(),
    model: "Local Fallback Model",
    inputTokens: 0,
    outputTokens: 0,
    isFallback: true,
  };
}

export function useAuditSummary() {
  const [state, setState] = useState<SummaryState>({ status: "idle" });

  const generate = useCallback(async (result: AuditResult) => {
    setState({ status: "loading" });

    try {
      const payload = buildRequest(result);
      const res = await fetch("/api/summary", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        console.warn("API failed, using local fallback summary:", data?.error || res.statusText);
        setState({ status: "success", summary: buildFallbackSummary(payload) });
        return;
      }

      setState({ status: "success", summary: data.summary });
    } catch (err) {
      console.warn("Network error, using local fallback summary:", err);
      setState({ status: "success", summary: buildFallbackSummary(buildRequest(result)) });
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
