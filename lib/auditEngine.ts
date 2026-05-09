/**
 * lib/auditEngine.ts
 *
 * Orchestrates all audit rules and produces a structured AuditResult.
 * Pure function — no side effects, no I/O. Safe in server components.
 *
 * Responsibilities (only):
 *   1. Route rules to per-tool or portfolio contexts
 *   2. Collect, sort, and deduplicate findings
 *   3. Assemble the final AuditResult shape
 *
 * All savings math → lib/utils/savingsCalc.ts
 * All pricing lookups → lib/utils/pricingUtils.ts
 * All finding construction → lib/utils/findingFactory.ts
 */

import type { AuditFormValues } from "@/types/audit";
import type { AuditFinding, AuditResult, RuleContext, ToolAuditSummary } from "@/types/auditEngine";
import { AUDIT_RULES } from "@/lib/auditRules";
import { totalMonthlySpend } from "@/types/audit";
import {
  computeScore,
  computeSavingsProjection,
  countFindings,
  deduplicateFindings,
  sortFindings,
} from "@/lib/utils/savingsCalc";

// ─── Rule dispatch ────────────────────────────────────────────────────────────

/** Runs all portfolio-scoped rules and returns their findings. */
function runPortfolioRules(input: AuditFormValues): AuditFinding[] {
  return AUDIT_RULES
    .filter((r) => r.scope === "portfolio")
    .flatMap((rule) => rule.evaluate({ input }));
}

/** Runs all per-tool rules against every tool entry and groups results by tool. */
function runPerToolRules(input: AuditFormValues): Map<string, AuditFinding[]> {
  const perToolRules = AUDIT_RULES.filter((r) => r.scope === "per_tool");
  const buckets = new Map<string, AuditFinding[]>(
    input.tools.map((t) => [t.tool, []])
  );

  for (const rule of perToolRules) {
    for (let i = 0; i < input.tools.length; i++) {
      const toolEntry = input.tools[i];
      const ctx: RuleContext = { input, toolEntry, toolIndex: i };
      const findings = rule.evaluate(ctx);
      buckets.get(toolEntry.tool)!.push(...findings);
    }
  }

  return buckets;
}

// ─── Per-tool summary builder ─────────────────────────────────────────────────

function buildToolSummaries(
  input: AuditFormValues,
  toolBuckets: Map<string, AuditFinding[]>
): ToolAuditSummary[] {
  return input.tools.map((toolEntry) => {
    const findings = sortFindings(toolBuckets.get(toolEntry.tool) ?? []);
    return {
      toolEntry,
      efficiencyScore: computeScore(findings),
      findings,
      hasCritical:        findings.some((f) => f.severity === "critical"),
      potentialSavingsUsd: findings.reduce((s, f) => s + f.estimatedMonthlySavingsUsd, 0),
    };
  });
}

// ─── Main engine ──────────────────────────────────────────────────────────────

/**
 * Runs all registered audit rules against the validated form submission
 * and returns a fully structured, deduplicated AuditResult.
 *
 * @example
 * const result = runAudit(formValues);
 * console.log(result.overallScore);        // 42
 * console.log(result.savingsProjection);   // full projection breakdown
 */
export function runAudit(input: AuditFormValues): AuditResult {
  // 1. Run rules
  const toolBuckets      = runPerToolRules(input);
  const crossToolFindings = runPortfolioRules(input);

  // 2. Build per-tool summaries
  const toolSummaries = buildToolSummaries(input, toolBuckets);

  // 3. Merge, sort, deduplicate all findings
  const allRaw    = [...toolSummaries.flatMap((s) => s.findings), ...crossToolFindings];
  const allFindings = deduplicateFindings(sortFindings(allRaw));

  // 4. Aggregate totals
  const totalSpend   = totalMonthlySpend(input.tools.map((t) => ({
    ...t,
    monthlySpend: t.monthlySpend ?? 0,
    seats: t.seats ?? 0,
  })));
  const totalSavings = allFindings.reduce((s, f) => s + f.estimatedMonthlySavingsUsd, 0);

  return {
    auditedAt:   new Date().toISOString(),
    input,
    toolSummaries,
    crossToolFindings: sortFindings(crossToolFindings),
    allFindings,
    overallScore:      computeScore(allFindings),
    findingCounts:     countFindings(allFindings),
    totalMonthlySpendUsd:    totalSpend,
    totalPotentialSavingsUsd: totalSavings,
    savingsProjection: computeSavingsProjection(allFindings, totalSpend),
    topRecommendations: allFindings.slice(0, 3),
    rulesEvaluated:    AUDIT_RULES.map((r) => r.id),
  };
}
