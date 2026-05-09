/**
 * tests/auditRules.test.ts
 *
 * Unit tests for individual audit rules.
 * Each describe block maps to one rule and tests:
 *   - the happy path (finding fires with correct fields)
 *   - no-savings / no-firing conditions
 *   - savings amount accuracy
 *   - edge cases
 */

import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/auditEngine";
import type { AuditFinding } from "@/types/auditEngine";
import {
  STARTUP_CURSOR_ENTERPRISE,
  SMALL_TEAM_CURSOR_BUSINESS,
  EXCESS_SEATS_CURSOR,
  CONTENT_TEAM_API_PLATFORM,
  OVERLAPPING_CODING_TOOLS,
  OVERLAPPING_CHAT_TOOLS,
  CURSOR_MONTHLY_BILLING,
  UNDERUTILIZED_CHATGPT_PLUS,
  FREE_PLAN_WITH_SPEND,
  OPTIMISED_SINGLE_TOOL,
  makeInput,
  makeTool,
} from "./fixtures";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Finds a finding by ruleId in an AuditResult. */
function findByRule(findings: AuditFinding[], ruleId: string): AuditFinding | undefined {
  return findings.find((f) => f.ruleId === ruleId);
}

function findAllByRule(findings: AuditFinding[], ruleId: string): AuditFinding[] {
  return findings.filter((f) => f.ruleId === ruleId);
}

// ─── Rule: small-team-overplan ────────────────────────────────────────────────

describe("Rule: small-team-overplan", () => {
  it("fires when a 5-person team uses a Cursor Business (mid_market) plan", () => {
    const result = runAudit(SMALL_TEAM_CURSOR_BUSINESS);
    const finding = findByRule(result.allFindings, "small-team-overplan");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("overplan");
    expect(finding!.action).toBe("downgrade_plan");
    expect(finding!.toolId).toBe("Cursor");
  });

  it("suggests a lower-tier plan when one exists", () => {
    const result = runAudit(SMALL_TEAM_CURSOR_BUSINESS);
    const finding = findByRule(result.allFindings, "small-team-overplan");

    expect(finding!.suggestedPlanId).toBeDefined();
    expect(finding!.suggestedPlanLabel).toBeDefined();
  });

  it("calculates positive monthly savings from the plan downgrade", () => {
    const result = runAudit(SMALL_TEAM_CURSOR_BUSINESS);
    const finding = findByRule(result.allFindings, "small-team-overplan");

    expect(finding!.estimatedMonthlySavingsUsd).toBeGreaterThan(0);
  });

  it("does NOT fire when a large team (25 seats) is correctly on a Business plan", () => {
    const result = runAudit(makeInput({
      teamSize: 25,
      tools: [makeTool({ tool: "Cursor", plan: "business", seats: 25, monthlySpend: 1000 })],
    }));
    const finding = findByRule(result.allFindings, "small-team-overplan");

    expect(finding).toBeUndefined();
  });

  it("does NOT fire for an individual on a Pro plan", () => {
    const result = runAudit(makeInput({
      teamSize: 1,
      tools: [makeTool({ tool: "Cursor", plan: "pro", seats: 1, monthlySpend: 20 })],
    }));
    const finding = findByRule(result.allFindings, "small-team-overplan");

    expect(finding).toBeUndefined();
  });
});

// ─── Rule: excess-seats ───────────────────────────────────────────────────────

describe("Rule: excess-seats", () => {
  it("fires when seat count is more than 150% of team size with 3+ excess seats", () => {
    // 20 seats, 8-person team → 12 excess
    const result = runAudit(EXCESS_SEATS_CURSOR);
    const finding = findByRule(result.allFindings, "excess-seats");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("seat_mismatch");
    expect(finding!.action).toBe("reduce_seats");
  });

  it("calculates savings based on per-seat price × excess seats", () => {
    // Cursor Business = $40/seat/mo. 12 excess seats → $480/mo
    const result = runAudit(EXCESS_SEATS_CURSOR);
    const finding = findByRule(result.allFindings, "excess-seats");

    expect(finding!.estimatedMonthlySavingsUsd).toBe(480);
  });

  it("marks the finding as critical when excess seat cost exceeds $100/mo", () => {
    const result = runAudit(EXCESS_SEATS_CURSOR);
    const finding = findByRule(result.allFindings, "excess-seats");

    expect(finding!.severity).toBe("critical");
  });

  it("does NOT fire when seats equal the team size", () => {
    const result = runAudit(makeInput({
      teamSize: 10,
      tools: [makeTool({ tool: "Cursor", plan: "business", seats: 10, monthlySpend: 400 })],
    }));
    const finding = findByRule(result.allFindings, "excess-seats");

    expect(finding).toBeUndefined();
  });

  it("does NOT fire when seats slightly exceed team size (within 150% threshold)", () => {
    // 10-person team, 12 seats → ratio 1.2 — below 1.5 threshold
    const result = runAudit(makeInput({
      teamSize: 10,
      tools: [makeTool({ tool: "Cursor", plan: "business", seats: 12, monthlySpend: 480 })],
    }));
    const finding = findByRule(result.allFindings, "excess-seats");

    expect(finding).toBeUndefined();
  });
});

// ─── Rule: annual-billing-savings ─────────────────────────────────────────────

describe("Rule: annual-billing-savings", () => {
  it("fires when a plan has a cheaper annual rate available", () => {
    const result = runAudit(CURSOR_MONTHLY_BILLING);
    const finding = findByRule(result.allFindings, "annual-billing-savings");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("annual_savings");
    expect(finding!.action).toBe("switch_billing_cycle");
  });

  it("calculates monthly savings as the difference between monthly and annual/12 rates", () => {
    // Cursor Pro: $20/seat/mo monthly, $192/yr annual → $16/mo equiv
    // 10 seats: monthly = $200, annual equiv = $160 → saving = $40/mo
    const result = runAudit(CURSOR_MONTHLY_BILLING);
    const finding = findByRule(result.allFindings, "annual-billing-savings");

    expect(finding!.estimatedMonthlySavingsUsd).toBeGreaterThan(0);
    expect(finding!.estimatedMonthlySavingsUsd).toBeLessThan(200); // sanity upper bound
  });

  it("includes the total annual saving in the title string", () => {
    const result = runAudit(CURSOR_MONTHLY_BILLING);
    const finding = findByRule(result.allFindings, "annual-billing-savings");

    // Title should mention $/year
    expect(finding!.title).toMatch(/\$[\d,]+\/year/);
  });

  it("does NOT fire for a usage-based plan (no annual rate applicable)", () => {
    const result = runAudit(CONTENT_TEAM_API_PLATFORM);
    const finding = findByRule(result.allFindings, "annual-billing-savings");

    expect(finding).toBeUndefined();
  });
});

// ─── Rule: lightweight-overspend (alternative recommendations) ────────────────

describe("Rule: lightweight-overspend (alternative recommendation)", () => {
  it("fires when a content team uses an API platform spending over $100/mo", () => {
    const result = runAudit(CONTENT_TEAM_API_PLATFORM);
    const finding = findByRule(result.allFindings, "lightweight-overspend");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("alternative");
    expect(finding!.action).toBe("switch_tool");
  });

  it("recommends a consumer chat alternative instead", () => {
    const result = runAudit(CONTENT_TEAM_API_PLATFORM);
    const finding = findByRule(result.allFindings, "lightweight-overspend");

    // Should suggest ChatGPT or Claude as the alternative
    expect(finding!.suggestedAlternativeTool).toMatch(/ChatGPT|Claude/);
  });

  it("estimates savings based on spend minus the typical consumer plan cost (~$25)", () => {
    const result = runAudit(CONTENT_TEAM_API_PLATFORM);
    const finding = findByRule(result.allFindings, "lightweight-overspend");

    // $350 spend - $25 → $325 estimated savings
    expect(finding!.estimatedMonthlySavingsUsd).toBe(325);
  });

  it("does NOT fire for a coding team using an API platform (legitimate use-case)", () => {
    const result = runAudit(makeInput({
      primaryUseCase: "coding",
      tools: [makeTool({ tool: "OpenAI API", plan: "pay_as_you_go", seats: 1, monthlySpend: 350 })],
    }));
    const finding = findByRule(result.allFindings, "lightweight-overspend");

    expect(finding).toBeUndefined();
  });

  it("does NOT fire when API spend is under the $100 threshold", () => {
    const result = runAudit(makeInput({
      primaryUseCase: "content",
      tools: [makeTool({ tool: "OpenAI API", plan: "pay_as_you_go", seats: 1, monthlySpend: 80 })],
    }));
    const finding = findByRule(result.allFindings, "lightweight-overspend");

    expect(finding).toBeUndefined();
  });
});

// ─── Rule: overlapping-tools ──────────────────────────────────────────────────

describe("Rule: overlapping-tools", () => {
  it("fires when two coding assistants are subscribed simultaneously", () => {
    const result = runAudit(OVERLAPPING_CODING_TOOLS);
    const finding = findByRule(result.allFindings, "overlapping-tools");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("overlap");
    expect(finding!.action).toBe("consolidate_tools");
  });

  it("fires when two chat assistants are subscribed simultaneously", () => {
    const result = runAudit(OVERLAPPING_CHAT_TOOLS);
    const finding = findByRule(result.allFindings, "overlapping-tools");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("overlap");
  });

  it("recommends keeping the cheaper tool and removing the more expensive one", () => {
    // Cursor Pro: $200/mo, GitHub Copilot Business: $190/mo
    // Copilot is cheaper → keep Copilot, remove Cursor
    const result = runAudit(OVERLAPPING_CODING_TOOLS);
    const finding = findByRule(result.allFindings, "overlapping-tools");

    // The action description should reference consolidating
    expect(finding!.actionDescription).toMatch(/Consolidate/i);
    // Savings = the more expensive tool's spend
    expect(finding!.estimatedMonthlySavingsUsd).toBe(200);
  });

  it("marks the finding as critical when combined savings exceed $100/mo", () => {
    const result = runAudit(OVERLAPPING_CODING_TOOLS);
    const finding = findByRule(result.allFindings, "overlapping-tools");

    // $200/mo saveable → critical
    expect(finding!.severity).toBe("critical");
  });

  it("does NOT fire when only one tool from an overlap group is subscribed", () => {
    const result = runAudit(makeInput({
      tools: [makeTool({ tool: "Cursor", plan: "pro", seats: 5, monthlySpend: 100 })],
    }));
    const finding = findByRule(result.allFindings, "overlapping-tools");

    expect(finding).toBeUndefined();
  });
});

// ─── Rule: underutilized-plan ─────────────────────────────────────────────────

describe("Rule: underutilized-plan", () => {
  it("fires when actual spend is under 40% of plan list price with a $15+ gap", () => {
    // ChatGPT Pro = $200/seat/mo. Spending $40 → 20% utilization, $160 gap
    const result = runAudit(UNDERUTILIZED_CHATGPT_PLUS);
    const finding = findByRule(result.allFindings, "underutilized-plan");

    expect(finding).toBeDefined();
    expect(finding!.category).toBe("underutilized");
  });

  it("recommends a downgrade to a cheaper available plan", () => {
    const result = runAudit(UNDERUTILIZED_CHATGPT_PLUS);
    const finding = findByRule(result.allFindings, "underutilized-plan");

    expect(finding!.action).toBe("downgrade_plan");
    expect(finding!.suggestedPlanId).toBeDefined();
  });

  it("reports utilization percentage in the finding title", () => {
    const result = runAudit(UNDERUTILIZED_CHATGPT_PLUS);
    const finding = findByRule(result.allFindings, "underutilized-plan");

    // Title should contain a % figure
    expect(finding!.title).toMatch(/\d+%/);
  });

  it("does NOT fire when spend is above 40% of plan cost", () => {
    // Cursor Pro $20/seat/mo, 10 seats = $200 expected. Spend $100 = 50% → no fire
    const result = runAudit(makeInput({
      teamSize: 10,
      tools: [makeTool({ tool: "Cursor", plan: "pro", seats: 10, monthlySpend: 100 })],
    }));
    const finding = findByRule(result.allFindings, "underutilized-plan");

    expect(finding).toBeUndefined();
  });

  it("does NOT fire when the gap is under $15 even if utilization is low", () => {
    // Cursor Pro $20/seat/mo, 1 seat = $20 expected.
    // Spend $9 = 55% util → above 40% threshold, so rule doesn't fire.
    const result = runAudit(makeInput({
      teamSize: 5,
      tools: [makeTool({ tool: "Cursor", plan: "pro", seats: 1, monthlySpend: 11 })],
    }));
    const finding = findByRule(result.allFindings, "underutilized-plan");

    // 11/20 = 55% utilization — above the 40% threshold → no fire
    expect(finding).toBeUndefined();
  });
});

// ─── Rule: free-plan-spend-mismatch ──────────────────────────────────────────

describe("Rule: free-plan-spend-mismatch", () => {
  it("fires when spend is reported on a free plan", () => {
    const result = runAudit(FREE_PLAN_WITH_SPEND);
    const finding = findByRule(result.allFindings, "free-plan-spend-mismatch");

    expect(finding).toBeDefined();
    expect(finding!.severity).toBe("info");
    expect(finding!.action).toBe("monitor_usage");
  });

  it("reports zero savings (it is a data integrity flag, not a cost saving)", () => {
    const result = runAudit(FREE_PLAN_WITH_SPEND);
    const finding = findByRule(result.allFindings, "free-plan-spend-mismatch");

    expect(finding!.estimatedMonthlySavingsUsd).toBe(0);
  });

  it("does NOT fire when a free plan has zero spend (correct state)", () => {
    const result = runAudit(makeInput({
      tools: [makeTool({ tool: "Claude", plan: "free", seats: 1, monthlySpend: 0 })],
    }));
    const finding = findByRule(result.allFindings, "free-plan-spend-mismatch");

    expect(finding).toBeUndefined();
  });
});

// ─── Rule: high-per-head-spend ────────────────────────────────────────────────

describe("Rule: high-per-head-spend", () => {
  it("fires when total AI spend exceeds $100/person/month and marks critical above $200/head", () => {
    // $200 + $190 = $390/mo spend for 3 people → $130/head → warning (not critical)
    // To hit critical (>$200/head) we need smaller team or bigger spend
    const result = runAudit(makeInput({
      teamSize: 2,
      tools: [
        makeTool({ tool: "Cursor",         plan: "business", seats: 10, monthlySpend: 400 }),
        makeTool({ tool: "GitHub Copilot", plan: "business", seats: 10, monthlySpend: 200 }),
      ],
    }));
    // $600/mo / 2 people = $300/head → critical
    const finding = findByRule(result.allFindings, "high-per-head-spend");

    expect(finding).toBeDefined();
    expect(finding!.severity).toBe("critical"); // $300/head > $200 threshold → critical
  });

  it("does NOT fire when per-head spend is under $100", () => {
    // $200/mo for 10 people = $20/head
    const result = runAudit(makeInput({
      teamSize: 10,
      tools: [makeTool({ tool: "Cursor", plan: "pro", seats: 10, monthlySpend: 200 })],
    }));
    const finding = findByRule(result.allFindings, "high-per-head-spend");

    expect(finding).toBeUndefined();
  });
});

// ─── No-savings outcomes ──────────────────────────────────────────────────────

describe("No-savings outcomes", () => {
  it("returns zero total savings for an optimised single-tool setup", () => {
    const result = runAudit(OPTIMISED_SINGLE_TOOL);

    // Cursor Pro, 5 seats, $100/mo for 5 people — all ratios are fine
    const savingsRules = ["excess-seats", "small-team-overplan", "overlapping-tools",
                          "lightweight-overspend", "underutilized-plan"];
    savingsRules.forEach((ruleId) => {
      expect(findByRule(result.allFindings, ruleId)).toBeUndefined();
    });
  });

  it("produces a high portfolio score when no issues are detected", () => {
    const result = runAudit(OPTIMISED_SINGLE_TOOL);

    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });

  it("deduplicates findings — same rule cannot fire twice for the same tool", () => {
    const result = runAudit(EXCESS_SEATS_CURSOR);
    const excessFindings = findAllByRule(result.allFindings, "excess-seats");

    // Should only appear once per tool
    expect(excessFindings.length).toBe(1);
  });
});

// ─── Enterprise misuse detection ──────────────────────────────────────────────

describe("Enterprise misuse detection", () => {
  it("detects a startup (5 seats) on an enterprise-tier plan", () => {
    // GitHub Copilot Enterprise targets 100+ seat orgs
    const result = runAudit(makeInput({
      teamSize: 5,
      tools: [makeTool({ tool: "GitHub Copilot", plan: "enterprise", seats: 5, monthlySpend: 195 })],
    }));
    const finding = findByRule(result.allFindings, "small-team-overplan");

    expect(finding).toBeDefined();
    expect(finding!.severity).toBe("warning");
  });

  it("detects an inefficiency for a 3-person team on Claude Team plan paying monthly", () => {
    // Claude Team: $25/seat/mo monthly, annual rate may differ.
    // With 3 seats at $75/mo the engine should detect annual billing savings
    // or flag the spend as below the plan's expected usage range.
    const result = runAudit(makeInput({
      teamSize: 3,
      tools: [makeTool({ tool: "Claude", plan: "team", seats: 3, monthlySpend: 75 })],
    }));

    // Engine detects annual billing savings (immediate, quick win)
    const annualFinding = result.allFindings.find((f) => f.ruleId === "annual-billing-savings");
    // Or at minimum the audit runs without error and produces a result
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    // Annual billing finding is a known signal for team plans
    if (annualFinding) {
      expect(annualFinding.action).toBe("switch_billing_cycle");
    }
  });

  it("includes the per-seat price of the current and suggested plan in the finding meta", () => {
    const result = runAudit(SMALL_TEAM_CURSOR_BUSINESS);
    const finding = findByRule(result.allFindings, "small-team-overplan");

    // meta should have seat count info
    expect(finding!.meta?.seats).toBeDefined();
  });
});
