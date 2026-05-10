/**
 * types/aiSummary.ts
 *
 * Shared TypeScript contracts for the AI-generated audit summary feature.
 * Used by both the API route (server) and the client hook/component.
 */

// ─── Request shape sent to POST /api/summary ─────────────────────────────────

export interface SummaryRequest {
  companyName: string;
  teamSize: number;
  primaryUseCase: string;

  totalMonthlySpendUsd: number;
  totalPotentialSavingsUsd: number;
  totalAnnualSavingsUsd: number;
  savingsRatePct: number;
  overallScore: number;

  findingCounts: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };

  /** Top 3 findings (title + action + monthly saving) */
  topFindings: {
    title: string;
    action: string;
    monthlySavingUsd: number;
  }[];

  /** Savings breakdown by implementation timeline */
  byTimeline: {
    immediate: number;
    short_term: number;
    strategic: number;
  };
}

// ─── Structured response from Claude ─────────────────────────────────────────

/** The three-section structured summary Claude produces. */
export interface AuditSummaryResult {
  /** 1–2 sentence executive overview */
  executive: string;

  /** 2–4 bullet points of the most impactful actions */
  topActions: string[];

  /**
   * Forward-looking statement: what the team can achieve
   * if recommendations are followed within 90 days
   */
  outlook: string;

  /** ISO timestamp of when this summary was generated */
  generatedAt: string;

  /** Which Claude model was used */
  model: string;

  /** Approximate prompt token usage */
  inputTokens: number;

  /** Approximate completion token usage */
  outputTokens: number;
}

// ─── API response envelope ────────────────────────────────────────────────────

export type SummaryApiResponse =
  | { ok: true;  summary: AuditSummaryResult }
  | { ok: false; error: string; code?: string };
