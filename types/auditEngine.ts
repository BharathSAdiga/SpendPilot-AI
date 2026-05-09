/**
 * types/auditEngine.ts
 *
 * TypeScript interfaces for the rule-based audit engine output.
 * These are pure data structures — no runtime dependencies.
 */

import type { AuditFormValues, AuditToolEntry } from "@/types/audit";

// ─── Severity ─────────────────────────────────────────────────────────────────

/**
 * How critical a finding is.
 * - critical  : action needed now (wasted budget > $200/mo or major overlap)
 * - warning   : significant opportunity, but not urgent
 * - info      : low-priority tip or best-practice nudge
 */
export type FindingSeverity = "critical" | "warning" | "info";

// ─── Finding categories ───────────────────────────────────────────────────────

export type FindingCategory =
  | "overspend"          // Paying more per seat than market rate
  | "overplan"           // Team too small for current plan tier
  | "underutilized"      // High spend but likely low usage signal
  | "overlap"            // Two tools in the registry serve the same purpose
  | "alternative"        // A cheaper tool covers the same use-case
  | "annual_savings"     // Switch to annual billing for discount
  | "seat_mismatch"      // Seat count far exceeds or is below team size
  | "consolidation";     // Multiple tools in same category, could consolidate

// ─── Recommendation action ────────────────────────────────────────────────────

export type RecommendationAction =
  | "downgrade_plan"
  | "upgrade_plan"
  | "switch_tool"
  | "switch_billing_cycle"
  | "reduce_seats"
  | "consolidate_tools"
  | "remove_tool"
  | "monitor_usage"
  | "no_action";

// ─── Individual finding ───────────────────────────────────────────────────────

/** One discrete finding produced by a single rule. */
export interface AuditFinding {
  /** Unique id for deduplication (rule slug + tool id) */
  id: string;

  /** The rule that generated this finding */
  ruleId: string;

  /** Tool this finding applies to (undefined for cross-tool findings) */
  toolId?: string;
  toolName?: string;

  severity: FindingSeverity;
  category: FindingCategory;

  /** One-line summary for display in a findings list */
  title: string;

  /** Full reasoning paragraph explaining *why* this is a problem */
  reasoning: string;

  /** Specific action the user should take */
  action: RecommendationAction;

  /** Human-readable description of the recommended action */
  actionDescription: string;

  /** Estimated monthly savings in USD if recommendation is followed (0 = unknown) */
  estimatedMonthlySavingsUsd: number;

  /** If recommending a plan change: the target plan id */
  suggestedPlanId?: string;
  suggestedPlanLabel?: string;

  /** If recommending a tool switch: alternative tool name */
  suggestedAlternativeTool?: string;

  /** Optional metadata bag for rendering (e.g. before/after prices) */
  meta?: Record<string, string | number | boolean>;
}

// ─── Per-tool audit summary ───────────────────────────────────────────────────

/** Rolled-up health score and findings for one tool entry. */
export interface ToolAuditSummary {
  toolEntry: AuditToolEntry;

  /** 0–100 efficiency score (100 = perfectly optimized) */
  efficiencyScore: number;

  /** Findings specific to this tool */
  findings: AuditFinding[];

  /** True if this tool has at least one critical finding */
  hasCritical: boolean;

  /** Total potential monthly savings across all findings for this tool */
  potentialSavingsUsd: number;
}

// ─── Full audit result ────────────────────────────────────────────────────────

export interface AuditResult {
  /** ISO timestamp of when the audit was run */
  auditedAt: string;

  /** The form data that was audited */
  input: AuditFormValues;

  /** Per-tool summaries */
  toolSummaries: ToolAuditSummary[];

  /** Cross-tool findings (overlaps, consolidation opportunities) */
  crossToolFindings: AuditFinding[];

  /** All findings combined and sorted by severity then savings */
  allFindings: AuditFinding[];

  /** Overall portfolio health score (0–100) */
  overallScore: number;

  /** Breakdown of findings by severity */
  findingCounts: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };

  /** Total current monthly spend across all tools */
  totalMonthlySpendUsd: number;

  /** Total potential savings if all recommendations are followed */
  totalPotentialSavingsUsd: number;

  /** Structured savings projections broken down by horizon and category */
  savingsProjection: SavingsProjection;

  /** The top 3 highest-impact recommendations to show first */
  topRecommendations: AuditFinding[];

  /** Which rules were evaluated (for transparency / debugging) */
  rulesEvaluated: string[];
}

// ─── Savings Projection ─────────────────────────────────────────────────────────────

/**
 * Action timeline bucket — how quickly the saving can be realised.
 * - immediate   : can be done in < 1 week (click a button, remove a seat)
 * - short_term  : 1–4 weeks (plan change negotiation, contract notice period)
 * - strategic   : 1–6 months (tool migration, team retraining)
 */
export type SavingsTimeline = "immediate" | "short_term" | "strategic";

/** Maps a RecommendationAction to its typical implementation timeline. */
export const ACTION_TIMELINE: Record<RecommendationAction, SavingsTimeline> = {
  reduce_seats:         "immediate",
  switch_billing_cycle: "immediate",
  monitor_usage:        "immediate",
  downgrade_plan:       "short_term",
  remove_tool:          "short_term",
  consolidate_tools:    "strategic",
  switch_tool:          "strategic",
  upgrade_plan:         "short_term",
  no_action:            "strategic",
};

/**
 * A single month’s data point for the cumulative savings chart.
 * `month` is 1-indexed (1 = first month of action).
 */
export interface MonthlySavingsPoint {
  month: number;
  /** Label, e.g. "Month 1", "Month 6" */
  label: string;
  /** Cumulative savings realised up to and including this month */
  cumulativeSavingsUsd: number;
  /** Marginal new savings starting this month (some actions take time to kick in) */
  marginalSavingsUsd: number;
}

/** Full savings projection attached to every AuditResult. */
export interface SavingsProjection {
  // ─ Headline numbers ────────────────────────────────────────────────────────────
  /** Total monthly saving if every recommendation is actioned */
  totalMonthlyUsd: number;
  /** Annualised version of totalMonthlyUsd (simple × 12) */
  totalAnnualUsd: number;
  /** Savings achievable within 1 week (immediate actions only) */
  immediateMonthlyUsd: number;
  /** Savings achievable within 1 month (immediate + short-term) */
  shortTermMonthlyUsd: number;
  /** Remaining savings requiring tool migrations or retraining */
  strategicMonthlyUsd: number;

  // ─ Percentage impact ─────────────────────────────────────────────────────────
  /** What % of current spend could be saved (0–100) */
  savingsRatePct: number;

  // ─ Category breakdown ────────────────────────────────────────────────────────
  /** Monthly savings per finding category */
  byCategory: Partial<Record<FindingCategory, number>>;
  /** Monthly savings per action type */
  byAction: Partial<Record<RecommendationAction, number>>;
  /** Monthly savings per implementation timeline */
  byTimeline: Record<SavingsTimeline, number>;

  // ─ 12-month chart ───────────────────────────────────────────────────────────
  /** Month-by-month cumulative saving data for the 12-month chart */
  monthlyChart: MonthlySavingsPoint[];

  // ─ Prioritised action list ─────────────────────────────────────────────────────
  /** Findings sorted by (timeline asc, savings desc) — the optimal action order */
  prioritisedActions: PrioritisedAction[];
}

/** A finding enriched with timeline metadata for the action roadmap. */
export interface PrioritisedAction {
  finding: AuditFinding;
  timeline: SavingsTimeline;
  /** Cumulative saving achieved if this and all higher-priority actions are done */
  runningTotalUsd: number;
}

// ─── Rule interface ───────────────────────────────────────────────────────────

/** Context object passed into every rule evaluation function. */
export interface RuleContext {
  /** The full validated form submission */
  input: AuditFormValues;

  /** The specific tool entry being evaluated (undefined for cross-tool rules) */
  toolEntry?: AuditToolEntry;

  /** Index of toolEntry in input.tools */
  toolIndex?: number;
}

/** A single audit rule. */
export interface AuditRule {
  /** Unique slug, e.g. "small-team-enterprise-plan" */
  id: string;

  /** Short human-readable name */
  name: string;

  /** Whether this rule evaluates a single tool (per-tool) or the full portfolio */
  scope: "per_tool" | "portfolio";

  /**
   * Returns zero or more findings.
   * Returning an empty array means the rule found nothing to flag.
   */
  evaluate(ctx: RuleContext): AuditFinding[];
}
