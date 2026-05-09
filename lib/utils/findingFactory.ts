/**
 * lib/utils/findingFactory.ts
 *
 * Factory functions for constructing typed AuditFinding objects.
 *
 * Goals:
 * - Eliminate the 12-field object literal duplicated across every rule
 * - Enforce required fields at the type level
 * - Keep rules focused on *condition logic*, not object construction
 *
 * All functions return AuditFinding[]. Rules can spread the result
 * directly: `return makeFinding({ ... })` or `return []`.
 */

import type {
  AuditFinding,
  FindingCategory,
  FindingSeverity,
  RecommendationAction,
} from "@/types/auditEngine";
import type { PlanTierConfig } from "@/types/pricing";
import { formatPlanPrice } from "@/lib/pricing";

// ─── Finding ID helper ────────────────────────────────────────────────────────

/**
 * Builds a deterministic, dedup-safe finding ID.
 * Format: `{ruleId}:{toolId}` or `{ruleId}:{key}` for portfolio findings.
 */
export function findingId(ruleId: string, ...parts: (string | undefined)[]): string {
  return [ruleId, ...parts].filter(Boolean).join(":");
}

// ─── Base factory ─────────────────────────────────────────────────────────────

type FindingInput = Omit<AuditFinding, "id"> & { id: string };

/** Low-level factory — wraps a plain object and validates required shape. */
export function makeFinding(f: FindingInput): AuditFinding[] {
  return [f];
}

// ─── Domain-specific builders ─────────────────────────────────────────────────

/** Common fields shared by all per-tool findings. */
interface PerToolBase {
  ruleId: string;
  toolId: string;
  toolName: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  reasoning: string;
  action: RecommendationAction;
  actionDescription: string;
  estimatedMonthlySavingsUsd: number;
  meta?: Record<string, string | number | boolean>;
  suggestedPlanId?: string;
  suggestedPlanLabel?: string;
  suggestedAlternativeTool?: string;
}

export function makePerToolFinding(fields: PerToolBase): AuditFinding[] {
  return makeFinding({
    id: findingId(fields.ruleId, fields.toolId),
    ...fields,
  });
}

// ─── Downgrade recommendation builder ────────────────────────────────────────

interface DowngradeArgs {
  ruleId: string;
  toolId: string;
  toolName: string;
  severity: FindingSeverity;
  currentPlanLabel: string;
  suggestedPlan: PlanTierConfig | null;
  savingsPerMonth: number;
  reasoningDetail: string;
  meta?: Record<string, string | number | boolean>;
}

/**
 * Builds a standardised "downgrade plan" finding.
 * Handles both the case where a specific plan is suggested and the generic fallback.
 */
export function makeDowngradeFinding(args: DowngradeArgs): AuditFinding[] {
  const {
    ruleId, toolId, toolName, severity, currentPlanLabel,
    suggestedPlan, savingsPerMonth, reasoningDetail, meta,
  } = args;

  const actionDescription = suggestedPlan
    ? `Downgrade to "${suggestedPlan.label}" (${formatPlanPrice(suggestedPlan)}) and save $${savingsPerMonth.toFixed(0)}/mo`
    : "Review available plans on the vendor's pricing page";

  return makeFinding({
    id: findingId(ruleId, toolId),
    ruleId,
    toolId,
    toolName,
    severity,
    category: "overplan",
    title: `${toolName}: Plan "${currentPlanLabel}" may be oversized`,
    reasoning: reasoningDetail,
    action: "downgrade_plan",
    actionDescription,
    estimatedMonthlySavingsUsd: Math.max(0, savingsPerMonth),
    suggestedPlanId: suggestedPlan?.id,
    suggestedPlanLabel: suggestedPlan?.label,
    meta,
  });
}

// ─── Overspend benchmark builder ──────────────────────────────────────────────

interface OverspendArgs {
  ruleId: string;
  toolId: string;
  toolName: string;
  actualSpend: number;
  expectedSpend: number;
  overpayPct: number;
  planLabel: string;
  seats: number;
}

export function makeOverspendFinding(args: OverspendArgs): AuditFinding[] {
  const { ruleId, toolId, toolName, actualSpend, expectedSpend, overpayPct, planLabel, seats } = args;
  const excess = actualSpend - expectedSpend;

  return makeFinding({
    id: findingId(ruleId, toolId),
    ruleId,
    toolId,
    toolName,
    severity: excess > 100 ? "critical" : "warning",
    category: "overspend",
    title: `${toolName}: Paying $${excess.toFixed(0)}/mo above list price`,
    reasoning: `At ${seats} seat${seats !== 1 ? "s" : ""} on "${planLabel}", list price is $${expectedSpend.toFixed(2)}/mo but you reported $${actualSpend.toFixed(2)}/mo — ${overpayPct.toFixed(0)}% above market rate. This often indicates legacy pricing, incorrect seat counts, or removable add-ons.`,
    action: "monitor_usage",
    actionDescription: "Audit seat count and check for unnecessary add-ons or legacy contracts",
    estimatedMonthlySavingsUsd: excess,
    meta: { expected: expectedSpend, actual: actualSpend, overpayPct: overpayPct.toFixed(0) },
  });
}

// ─── Annual billing savings builder ──────────────────────────────────────────

interface AnnualSavingsArgs {
  ruleId: string;
  toolId: string;
  toolName: string;
  seats: number;
  monthlyRatePerSeat: number;
  annualRatePerSeat: number;
  savingsPerMonth: number;
}

export function makeAnnualBillingFinding(args: AnnualSavingsArgs): AuditFinding[] {
  const { ruleId, toolId, toolName, seats, monthlyRatePerSeat, annualRatePerSeat, savingsPerMonth } = args;
  const monthlyTotal     = monthlyRatePerSeat * seats;
  const annualEquiv      = (annualRatePerSeat * seats) / 12;
  const savingsPct       = (savingsPerMonth / monthlyTotal) * 100;
  const annualSavingsUsd = savingsPerMonth * 12;

  return makeFinding({
    id: findingId(ruleId, toolId),
    ruleId,
    toolId,
    toolName,
    severity: savingsPerMonth > 50 ? "warning" : "info",
    category: "annual_savings",
    title: `${toolName}: Save $${annualSavingsUsd.toFixed(0)}/year by switching to annual billing`,
    reasoning: `Paying monthly at $${monthlyRatePerSeat}/seat costs $${monthlyTotal.toFixed(2)}/mo. Annual billing reduces this to ~$${annualEquiv.toFixed(2)}/mo — a ${savingsPct.toFixed(0)}% saving ($${annualSavingsUsd.toFixed(0)}/year) for ${seats} seat${seats !== 1 ? "s" : ""}.`,
    action: "switch_billing_cycle",
    actionDescription: `Switch to annual billing to save $${annualSavingsUsd.toFixed(0)}/year`,
    estimatedMonthlySavingsUsd: savingsPerMonth,
    meta: { monthlyRate: monthlyRatePerSeat, annualRate: annualRatePerSeat, seats },
  });
}

// ─── Excess seats builder ─────────────────────────────────────────────────────

interface ExcessSeatsArgs {
  ruleId: string;
  toolId: string;
  toolName: string;
  seats: number;
  teamSize: number;
  excessCount: number;
  savingsPerMonth: number;
}

export function makeExcessSeatsFinding(args: ExcessSeatsArgs): AuditFinding[] {
  const { ruleId, toolId, toolName, seats, teamSize, excessCount, savingsPerMonth } = args;

  return makeFinding({
    id: findingId(ruleId, toolId),
    ruleId,
    toolId,
    toolName,
    severity: savingsPerMonth > 100 ? "critical" : "warning",
    category: "seat_mismatch",
    title: `${toolName}: ${excessCount} potentially unused seat${excessCount !== 1 ? "s" : ""}`,
    reasoning: `You have ${seats} seats licensed for a team of ${teamSize}. The ${excessCount} excess seat${excessCount !== 1 ? "s" : ""} cost $${savingsPerMonth.toFixed(2)}/mo. Even accounting for contractors or planned hires, this warrants a review.`,
    action: "reduce_seats",
    actionDescription: `Reduce to ${teamSize} seats to save $${savingsPerMonth.toFixed(2)}/mo`,
    estimatedMonthlySavingsUsd: savingsPerMonth,
    meta: { seats, teamSize, excess: excessCount },
  });
}
