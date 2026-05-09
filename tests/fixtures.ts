/**
 * tests/fixtures.ts
 *
 * Shared test data factory helpers.
 * Build realistic AuditFormValues and AuditFinding objects with
 * sensible defaults that individual tests can override.
 */

import type { AuditFormValues, AuditToolEntry } from "@/types/audit";
import type { AuditFinding, FindingCategory, FindingSeverity, RecommendationAction } from "@/types/auditEngine";

// ─── Tool entry builder ───────────────────────────────────────────────────────

type ToolOverrides = Partial<AuditToolEntry>;

export function makeTool(overrides: ToolOverrides & { tool: string; plan: string }): AuditToolEntry {
  return {
    seats:        1,
    monthlySpend: 20,
    ...overrides,
  };
}

// ─── Form input builder ───────────────────────────────────────────────────────

type InputOverrides = Partial<Omit<AuditFormValues, "tools">> & { tools: AuditToolEntry[] };

export function makeInput(overrides: InputOverrides): AuditFormValues {
  return {
    companyName:    "ACME Corp",
    teamSize:       10,
    primaryUseCase: "coding",
    ...overrides,
  };
}

// ─── Finding builder (for unit-testing factories / savingsCalc) ───────────────

type FindingOverrides = Partial<AuditFinding> & {
  id: string;
  ruleId: string;
  severity: FindingSeverity;
  category: FindingCategory;
  action: RecommendationAction;
  estimatedMonthlySavingsUsd: number;
};

export function makeFindingFixture(overrides: FindingOverrides): AuditFinding {
  return {
    title:             "Test finding",
    reasoning:         "Test reasoning",
    actionDescription: "Test action description",
    ...overrides,
  };
}

// ─── Scenario helpers ─────────────────────────────────────────────────────────

/** A 5-person startup using Cursor Business — enterprise plan overkill. */
export const STARTUP_CURSOR_ENTERPRISE = makeInput({
  teamSize: 5,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Cursor", plan: "business", seats: 5, monthlySpend: 200 }),
  ],
});

/** A 4-person team on Cursor Business — small team on mid_market plan. */
export const SMALL_TEAM_CURSOR_BUSINESS = makeInput({
  teamSize: 4,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Cursor", plan: "business", seats: 4, monthlySpend: 160 }),
  ],
});

/** 20 Cursor seats for a team of 8 — 12 excess seats. */
export const EXCESS_SEATS_CURSOR = makeInput({
  teamSize: 8,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Cursor", plan: "business", seats: 20, monthlySpend: 800 }),
  ],
});

/** OpenAI API used by a content team — lightweight overspend. */
export const CONTENT_TEAM_API_PLATFORM = makeInput({
  teamSize: 6,
  primaryUseCase: "content",
  tools: [
    makeTool({ tool: "OpenAI API", plan: "pay_as_you_go", seats: 1, monthlySpend: 350 }),
  ],
});

/** Cursor + GitHub Copilot — overlapping coding assistants. */
export const OVERLAPPING_CODING_TOOLS = makeInput({
  teamSize: 10,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Cursor",         plan: "pro",      seats: 10, monthlySpend: 200 }),
    makeTool({ tool: "GitHub Copilot", plan: "business", seats: 10, monthlySpend: 190 }),
  ],
});

/** ChatGPT + Claude — overlapping chat assistants. */
export const OVERLAPPING_CHAT_TOOLS = makeInput({
  teamSize: 10,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "ChatGPT", plan: "plus", seats: 10, monthlySpend: 200 }),
    makeTool({ tool: "Claude",  plan: "pro",  seats: 10, monthlySpend: 200 }),
  ],
});

/** Cursor Pro on monthly billing — annual discount available. */
export const CURSOR_MONTHLY_BILLING = makeInput({
  teamSize: 10,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Cursor", plan: "pro", seats: 10, monthlySpend: 200 }),
  ],
});

/** ChatGPT Plus — spending only $40 when plan costs $200 (underutilized). */
export const UNDERUTILIZED_CHATGPT_PLUS = makeInput({
  teamSize: 10,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "ChatGPT", plan: "pro", seats: 1, monthlySpend: 40 }),
  ],
});

/** Free plan but reporting spend — data mismatch. */
export const FREE_PLAN_WITH_SPEND = makeInput({
  teamSize: 5,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Claude", plan: "free", seats: 1, monthlySpend: 30 }),
  ],
});

/** A well-optimised single tool — no findings expected. */
export const OPTIMISED_SINGLE_TOOL = makeInput({
  teamSize: 5,
  primaryUseCase: "coding",
  tools: [
    makeTool({ tool: "Cursor", plan: "pro", seats: 5, monthlySpend: 100 }),
  ],
});
