/**
 * lib/utils/savingsCalc.ts
 *
 * Pure savings calculation and projection utilities.
 * Extracted from auditEngine.ts to separate concerns:
 *   - auditEngine.ts  → orchestration only
 *   - savingsCalc.ts  → all savings math
 */

import type {
  AuditFinding,
  FindingSeverity,
  MonthlySavingsPoint,
  PrioritisedAction,
  SavingsProjection,
  SavingsTimeline,
} from "@/types/auditEngine";
import { ACTION_TIMELINE } from "@/types/auditEngine";

// ─── Constants ────────────────────────────────────────────────────────────────

export const TIMELINE_ORDER: SavingsTimeline[] = ["immediate", "short_term", "strategic"];

/**
 * Month in which each timeline bucket's savings start flowing.
 * Immediate = month 1, short-term = month 2, strategic = month 4.
 */
export const TIMELINE_START_MONTH: Record<SavingsTimeline, number> = {
  immediate:  1,
  short_term: 2,
  strategic:  4,
};

/** Score penalty deducted per finding severity level. */
export const SEVERITY_DEDUCTION: Record<FindingSeverity, number> = {
  critical: 25,
  warning:  10,
  info:      3,
};

// ─── Score computation ────────────────────────────────────────────────────────

/**
 * Converts a list of findings into a 0–100 efficiency score.
 * Each finding deducts points based on severity. Clamped to [0, 100].
 */
export function computeScore(findings: AuditFinding[]): number {
  const deductions = findings.reduce(
    (total, f) => total + (SEVERITY_DEDUCTION[f.severity] ?? 0),
    0
  );
  return Math.max(0, 100 - deductions);
}

// ─── Finding sort ─────────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<FindingSeverity, number> = { critical: 0, warning: 1, info: 2 };

/**
 * Sorts findings by severity (critical first), then by estimated savings (desc).
 * Returns a new array — does not mutate the input.
 */
export function sortFindings(findings: AuditFinding[]): AuditFinding[] {
  return [...findings].sort((a, b) => {
    const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd;
  });
}

// ─── Finding deduplication ────────────────────────────────────────────────────

/**
 * Removes duplicate findings by their `id` field.
 * Preserves order — the first occurrence wins.
 */
export function deduplicateFindings(findings: AuditFinding[]): AuditFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

// ─── Finding counts ───────────────────────────────────────────────────────────

/** Returns a breakdown of findings by severity. */
export function countFindings(findings: AuditFinding[]) {
  return {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning:  findings.filter((f) => f.severity === "warning").length,
    info:     findings.filter((f) => f.severity === "info").length,
    total:    findings.length,
  };
}

// ─── Savings projection ───────────────────────────────────────────────────────

/** Groups actionable findings by their implementation timeline bucket. */
function groupByTimeline(
  findings: AuditFinding[]
): Record<SavingsTimeline, number> {
  const totals: Record<SavingsTimeline, number> = {
    immediate: 0, short_term: 0, strategic: 0,
  };
  for (const f of findings) {
    const bucket = ACTION_TIMELINE[f.action] ?? "strategic";
    totals[bucket] += f.estimatedMonthlySavingsUsd;
  }
  return totals;
}

/** Builds category and action breakdown maps from actionable findings. */
function buildBreakdowns(findings: AuditFinding[]) {
  const byCategory: SavingsProjection["byCategory"] = {};
  const byAction:   SavingsProjection["byAction"]   = {};

  for (const f of findings) {
    byCategory[f.category] = (byCategory[f.category] ?? 0) + f.estimatedMonthlySavingsUsd;
    byAction[f.action]     = (byAction[f.action]     ?? 0) + f.estimatedMonthlySavingsUsd;
  }
  return { byCategory, byAction };
}

/**
 * Builds the 12-month cumulative chart data.
 * Each timeline bucket's savings begin flowing from its defined start month.
 */
function buildMonthlyChart(
  byTimeline: Record<SavingsTimeline, number>
): MonthlySavingsPoint[] {
  const chart: MonthlySavingsPoint[] = [];
  let cumulative = 0;

  for (let m = 1; m <= 12; m++) {
    const marginal = TIMELINE_ORDER
      .filter((bucket) => m === TIMELINE_START_MONTH[bucket])
      .reduce((sum, bucket) => sum + byTimeline[bucket], 0);

    cumulative += marginal;
    chart.push({
      month: m,
      label: `Month ${m}`,
      cumulativeSavingsUsd: cumulative,
      marginalSavingsUsd:   marginal,
    });
  }
  return chart;
}

/**
 * Sorts actionable findings into the optimal action order:
 * 1. By timeline (immediate → short_term → strategic)
 * 2. Within each bucket, highest savings first
 * Then attaches a running total to each item.
 */
function buildPrioritisedActions(
  findings: AuditFinding[]
): PrioritisedAction[] {
  const sorted = [...findings].sort((a, b) => {
    const ta = TIMELINE_ORDER.indexOf(ACTION_TIMELINE[a.action] ?? "strategic");
    const tb = TIMELINE_ORDER.indexOf(ACTION_TIMELINE[b.action] ?? "strategic");
    if (ta !== tb) return ta - tb;
    return b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd;
  });

  let running = 0;
  return sorted.map((f) => {
    running += f.estimatedMonthlySavingsUsd;
    return {
      finding:         f,
      timeline:        ACTION_TIMELINE[f.action] ?? "strategic",
      runningTotalUsd: running,
    };
  });
}

/**
 * Computes the full SavingsProjection from a deduplicated findings list.
 *
 * @param findings   - The full deduplicated, sorted findings list
 * @param totalSpend - Current total monthly spend (for savings rate calculation)
 */
export function computeSavingsProjection(
  findings: AuditFinding[],
  totalSpend: number
): SavingsProjection {
  const actionable = findings.filter((f) => f.estimatedMonthlySavingsUsd > 0);

  const byTimeline         = groupByTimeline(actionable);
  const { byCategory, byAction } = buildBreakdowns(actionable);

  const totalMonthlyUsd    = byTimeline.immediate + byTimeline.short_term + byTimeline.strategic;
  const savingsRatePct     = totalSpend > 0
    ? Math.min(100, (totalMonthlyUsd / totalSpend) * 100)
    : 0;

  return {
    totalMonthlyUsd,
    totalAnnualUsd:       totalMonthlyUsd * 12,
    immediateMonthlyUsd:  byTimeline.immediate,
    shortTermMonthlyUsd:  byTimeline.immediate + byTimeline.short_term,
    strategicMonthlyUsd:  byTimeline.strategic,
    savingsRatePct,
    byCategory,
    byAction,
    byTimeline,
    monthlyChart:         buildMonthlyChart(byTimeline),
    prioritisedActions:   buildPrioritisedActions(actionable),
  };
}
