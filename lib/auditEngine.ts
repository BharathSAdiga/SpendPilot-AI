/**
 * lib/auditEngine.ts
 *
 * Orchestrates all audit rules and produces a structured AuditResult.
 * Pure function — no side effects, no I/O. Safe in server components.
 */

import type { AuditFormValues } from "@/types/audit";
import type {
  AuditFinding,
  AuditResult,
  FindingSeverity,
  MonthlySavingsPoint,
  PrioritisedAction,
  RuleContext,
  SavingsProjection,
  SavingsTimeline,
  ToolAuditSummary,
} from "@/types/auditEngine";
import { ACTION_TIMELINE } from "@/types/auditEngine";
import { AUDIT_RULES } from "@/lib/auditRules";
import { totalMonthlySpend } from "@/types/audit";

// ─── Severity ordering (for sort) ────────────────────────────────────────────

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

// ─── Savings projection ──────────────────────────────────────────────────────────────

const TIMELINE_ORDER: SavingsTimeline[] = ["immediate", "short_term", "strategic"];

/**
 * Month in which a timeline bucket’s savings start flowing.
 * Immediate = month 1, short-term = month 2, strategic = month 4.
 */
const TIMELINE_START_MONTH: Record<SavingsTimeline, number> = {
  immediate: 1,
  short_term: 2,
  strategic: 4,
};

function computeSavingsProjection(
  findings: AuditFinding[],
  totalCurrentSpend: number
): SavingsProjection {
  // Only findings with actual savings contribute
  const actionable = findings.filter((f) => f.estimatedMonthlySavingsUsd > 0);

  // ─ Headline buckets ──────────────────────────────────────────────────────────
  const byTimeline: Record<SavingsTimeline, number> = {
    immediate: 0,
    short_term: 0,
    strategic: 0,
  };

  for (const f of actionable) {
    const bucket = ACTION_TIMELINE[f.action] ?? "strategic";
    byTimeline[bucket] += f.estimatedMonthlySavingsUsd;
  }

  const totalMonthlyUsd = Object.values(byTimeline).reduce((s, v) => s + v, 0);
  const totalAnnualUsd  = totalMonthlyUsd * 12;
  const immediateMonthlyUsd  = byTimeline.immediate;
  const shortTermMonthlyUsd  = byTimeline.immediate + byTimeline.short_term;
  const strategicMonthlyUsd  = byTimeline.strategic;
  const savingsRatePct = totalCurrentSpend > 0
    ? Math.min(100, (totalMonthlyUsd / totalCurrentSpend) * 100)
    : 0;

  // ─ Category + action breakdown ────────────────────────────────────────────────
  const byCategory: SavingsProjection["byCategory"] = {};
  const byAction:   SavingsProjection["byAction"]   = {};

  for (const f of actionable) {
    byCategory[f.category] = (byCategory[f.category] ?? 0) + f.estimatedMonthlySavingsUsd;
    byAction[f.action]     = (byAction[f.action]     ?? 0) + f.estimatedMonthlySavingsUsd;
  }

  // ─ 12-month cumulative chart ──────────────────────────────────────────────────
  // Each timeline bucket’s savings begin flowing from its start month.
  // Month 0 = before any action (cumulative = 0).
  const monthlyChart: MonthlySavingsPoint[] = [];
  let cumulative = 0;

  for (let m = 1; m <= 12; m++) {
    let marginal = 0;
    for (const bucket of TIMELINE_ORDER) {
      if (m === TIMELINE_START_MONTH[bucket]) {
        marginal += byTimeline[bucket];
      }
    }
    cumulative += marginal;
    monthlyChart.push({
      month: m,
      label: m === 1 ? "Month 1" : m === 12 ? "Month 12" : `Month ${m}`,
      cumulativeSavingsUsd: cumulative,
      marginalSavingsUsd: marginal,
    });
  }

  // ─ Prioritised action list ─────────────────────────────────────────────────────
  // Sort: timeline asc (immediate first), then savings desc within each bucket
  const sorted = [...actionable].sort((a, b) => {
    const ta = TIMELINE_ORDER.indexOf(ACTION_TIMELINE[a.action] ?? "strategic");
    const tb = TIMELINE_ORDER.indexOf(ACTION_TIMELINE[b.action] ?? "strategic");
    if (ta !== tb) return ta - tb;
    return b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd;
  });

  let running = 0;
  const prioritisedActions: PrioritisedAction[] = sorted.map((f) => {
    running += f.estimatedMonthlySavingsUsd;
    return {
      finding:        f,
      timeline:       ACTION_TIMELINE[f.action] ?? "strategic",
      runningTotalUsd: running,
    };
  });

  return {
    totalMonthlyUsd,
    totalAnnualUsd,
    immediateMonthlyUsd,
    shortTermMonthlyUsd,
    strategicMonthlyUsd,
    savingsRatePct,
    byCategory,
    byAction,
    byTimeline,
    monthlyChart,
    prioritisedActions,
  };
}

// ─── Efficiency score ─────────────────────────────────────────────────────────

/**
 * Converts findings into a 0–100 efficiency score.
 * Each critical finding deducts 25 pts, warning 10 pts, info 3 pts.
 * Clamped to [0, 100].
 */
function computeScore(findings: AuditFinding[]): number {
  const deductions = findings.reduce((total, f) => {
    if (f.severity === "critical") return total + 25;
    if (f.severity === "warning") return total + 10;
    return total + 3;
  }, 0);
  return Math.max(0, 100 - deductions);
}

// ─── Sort findings ────────────────────────────────────────────────────────────

function sortFindings(findings: AuditFinding[]): AuditFinding[] {
  return [...findings].sort((a, b) => {
    const severityDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd;
  });
}

// ─── Main engine ──────────────────────────────────────────────────────────────

/**
 * Runs all registered audit rules against the validated form submission
 * and returns a fully structured AuditResult.
 *
 * @example
 * const result = runAudit(formValues);
 * console.log(result.overallScore);      // 42
 * console.log(result.topRecommendations); // top 3 findings
 */
export function runAudit(input: AuditFormValues): AuditResult {
  const toolFindings: Map<string, AuditFinding[]> = new Map();
  const crossToolFindings: AuditFinding[] = [];
  const rulesEvaluated: string[] = [];

  // Initialise per-tool finding buckets
  input.tools.forEach((t) => toolFindings.set(t.tool, []));

  for (const rule of AUDIT_RULES) {
    rulesEvaluated.push(rule.id);

    if (rule.scope === "portfolio") {
      const ctx: RuleContext = { input };
      const results = rule.evaluate(ctx);
      crossToolFindings.push(...results);
      continue;
    }

    // per_tool — run once per tool entry
    for (let i = 0; i < input.tools.length; i++) {
      const toolEntry = input.tools[i];
      const ctx: RuleContext = { input, toolEntry, toolIndex: i };
      const results = rule.evaluate(ctx);
      const bucket = toolFindings.get(toolEntry.tool) ?? [];
      bucket.push(...results);
      toolFindings.set(toolEntry.tool, bucket);
    }
  }

  // Build per-tool summaries
  const toolSummaries: ToolAuditSummary[] = input.tools.map((toolEntry) => {
    const findings = sortFindings(toolFindings.get(toolEntry.tool) ?? []);
    const score = computeScore(findings);
    return {
      toolEntry,
      efficiencyScore: score,
      findings,
      hasCritical: findings.some((f) => f.severity === "critical"),
      potentialSavingsUsd: findings.reduce(
        (s, f) => s + f.estimatedMonthlySavingsUsd,
        0
      ),
    };
  });

  // Merge and sort all findings
  const allPerTool = toolSummaries.flatMap((s) => s.findings);
  const allFindings = sortFindings([...allPerTool, ...crossToolFindings]);

  // Deduplicate by id (same rule can fire for same tool across scopes)
  const seen = new Set<string>();
  const deduped = allFindings.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  const overallScore = computeScore(deduped);
  const totalSpend = totalMonthlySpend(
    input.tools.map((t) => ({ ...t, monthlySpend: t.monthlySpend ?? 0, seats: t.seats ?? 0 }))
  );
  const totalSavings = deduped.reduce(
    (s, f) => s + f.estimatedMonthlySavingsUsd,
    0
  );

  const findingCounts = {
    critical: deduped.filter((f) => f.severity === "critical").length,
    warning:  deduped.filter((f) => f.severity === "warning").length,
    info:     deduped.filter((f) => f.severity === "info").length,
    total:    deduped.length,
  };

  return {
    auditedAt: new Date().toISOString(),
    input,
    toolSummaries,
    crossToolFindings: sortFindings(crossToolFindings),
    allFindings: deduped,
    overallScore,
    findingCounts,
    totalMonthlySpendUsd: totalSpend,
    totalPotentialSavingsUsd: totalSavings,
    savingsProjection: computeSavingsProjection(deduped, totalSpend),
    topRecommendations: deduped.slice(0, 3),
    rulesEvaluated,
  };
}
