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
  RuleContext,
  ToolAuditSummary,
} from "@/types/auditEngine";
import { AUDIT_RULES } from "@/lib/auditRules";
import { totalMonthlySpend } from "@/types/audit";

// ─── Severity ordering (for sort) ────────────────────────────────────────────

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

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
    topRecommendations: deduped.slice(0, 3),
    rulesEvaluated,
  };
}
