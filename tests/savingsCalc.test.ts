/**
 * tests/savingsCalc.test.ts
 *
 * Unit tests for lib/utils/savingsCalc.ts
 * Tests all exported utility functions in isolation — no engine dependency.
 */

import { describe, it, expect } from "vitest";
import {
  computeScore,
  sortFindings,
  deduplicateFindings,
  countFindings,
  computeSavingsProjection,
  computePerToolSavings,
  aggregateToolSavings,
  safeDiv,
  safePercent,
  clampSavings,
} from "@/lib/utils/savingsCalc";
import { makeFindingFixture } from "./fixtures";

// ─── safeDiv ──────────────────────────────────────────────────────────────────

describe("safeDiv", () => {
  it("divides normally for positive values", () => {
    expect(safeDiv(50, 200)).toBeCloseTo(0.25);
  });

  it("returns 0 when denominator is 0 (no division by zero)", () => {
    expect(safeDiv(100, 0)).toBe(0);
  });

  it("returns 0 when denominator is negative", () => {
    expect(safeDiv(100, -50)).toBe(0);
  });

  it("returns 0 when denominator is NaN", () => {
    expect(safeDiv(100, NaN)).toBe(0);
  });

  it("returns 0 when numerator is 0", () => {
    expect(safeDiv(0, 200)).toBe(0);
  });
});

// ─── safePercent ─────────────────────────────────────────────────────────────

describe("safePercent", () => {
  it("returns the correct percentage", () => {
    expect(safePercent(40, 200)).toBeCloseTo(20);
  });

  it("clamps to 100 when savings exceed current spend", () => {
    expect(safePercent(500, 200)).toBe(100);
  });

  it("returns 0 when spend is zero (no division by zero)", () => {
    expect(safePercent(100, 0)).toBe(0);
  });

  it("returns 0 when part is 0", () => {
    expect(safePercent(0, 500)).toBe(0);
  });

  it("never returns a negative value", () => {
    expect(safePercent(-50, 200)).toBeGreaterThanOrEqual(0);
  });
});

// ─── clampSavings ────────────────────────────────────────────────────────────

describe("clampSavings", () => {
  it("passes through positive values unchanged", () => {
    expect(clampSavings(150)).toBe(150);
  });

  it("clamps negative values to 0", () => {
    expect(clampSavings(-80)).toBe(0);
  });

  it("returns 0 for NaN", () => {
    expect(clampSavings(NaN)).toBe(0);
  });

  it("returns 0 for Infinity (guard against runaway math)", () => {
    expect(clampSavings(Infinity)).toBe(0);
  });

  it("returns 0 for -Infinity", () => {
    expect(clampSavings(-Infinity)).toBe(0);
  });
});

// ─── computeScore ─────────────────────────────────────────────────────────────

describe("computeScore", () => {
  it("returns 100 for an empty findings list", () => {
    expect(computeScore([])).toBe(100);
  });

  it("deducts 25 points per critical finding", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "critical", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
    ];
    expect(computeScore(findings)).toBe(75);
  });

  it("deducts 10 points per warning finding", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "warning", category: "overplan", action: "downgrade_plan", estimatedMonthlySavingsUsd: 50 }),
    ];
    expect(computeScore(findings)).toBe(90);
  });

  it("deducts 3 points per info finding", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "info", category: "annual_savings", action: "switch_billing_cycle", estimatedMonthlySavingsUsd: 10 }),
    ];
    expect(computeScore(findings)).toBe(97);
  });

  it("clamps to 0 when findings are catastrophic", () => {
    const criticals = Array.from({ length: 10 }, (_, i) =>
      makeFindingFixture({ id: `c${i}`, ruleId: "r", severity: "critical", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 })
    );
    expect(computeScore(criticals)).toBe(0);
  });

  it("combines mixed severities correctly (1 critical + 1 warning + 1 info = 100 - 25 - 10 - 3 = 62)", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r1", severity: "critical", category: "overspend",     action: "monitor_usage",        estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "b", ruleId: "r2", severity: "warning",  category: "overplan",      action: "downgrade_plan",       estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "c", ruleId: "r3", severity: "info",     category: "annual_savings", action: "switch_billing_cycle", estimatedMonthlySavingsUsd: 0 }),
    ];
    expect(computeScore(findings)).toBe(62);
  });
});

// ─── sortFindings ─────────────────────────────────────────────────────────────

describe("sortFindings", () => {
  it("orders critical before warning before info", () => {
    const findings = [
      makeFindingFixture({ id: "c", ruleId: "r", severity: "info",     category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "b", ruleId: "r", severity: "critical", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "a", ruleId: "r", severity: "warning",  category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
    ];
    const sorted = sortFindings(findings);
    expect(sorted.map((f) => f.severity)).toEqual(["critical", "warning", "info"]);
  });

  it("sorts by savings descending within the same severity tier", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "warning", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 50  }),
      makeFindingFixture({ id: "b", ruleId: "r", severity: "warning", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 200 }),
      makeFindingFixture({ id: "c", ruleId: "r", severity: "warning", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 120 }),
    ];
    const sorted = sortFindings(findings);
    expect(sorted.map((f) => f.estimatedMonthlySavingsUsd)).toEqual([200, 120, 50]);
  });

  it("does not mutate the original array", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "info",    category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "b", ruleId: "r", severity: "critical", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
    ];
    const original = [...findings];
    sortFindings(findings);
    expect(findings[0].id).toBe(original[0].id);
  });
});

// ─── deduplicateFindings ──────────────────────────────────────────────────────

describe("deduplicateFindings", () => {
  it("removes a duplicate by id, keeping the first occurrence", () => {
    const findings = [
      makeFindingFixture({ id: "dup", ruleId: "r", severity: "warning", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 100 }),
      makeFindingFixture({ id: "dup", ruleId: "r", severity: "warning", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 200 }),
      makeFindingFixture({ id: "unique", ruleId: "r", severity: "info", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 50 }),
    ];
    const result = deduplicateFindings(findings);

    expect(result).toHaveLength(2);
    expect(result[0].estimatedMonthlySavingsUsd).toBe(100); // first occurrence kept
  });

  it("returns the original list unchanged when all ids are unique", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "warning", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "b", ruleId: "r", severity: "info",    category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
    ];
    expect(deduplicateFindings(findings)).toHaveLength(2);
  });

  it("returns an empty array for an empty input", () => {
    expect(deduplicateFindings([])).toEqual([]);
  });
});

// ─── countFindings ────────────────────────────────────────────────────────────

describe("countFindings", () => {
  it("returns zeros for an empty list", () => {
    expect(countFindings([])).toEqual({ critical: 0, warning: 0, info: 0, total: 0 });
  });

  it("counts each severity correctly", () => {
    const findings = [
      makeFindingFixture({ id: "a", ruleId: "r", severity: "critical", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "b", ruleId: "r", severity: "critical", category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "c", ruleId: "r", severity: "warning",  category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
      makeFindingFixture({ id: "d", ruleId: "r", severity: "info",     category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: 0 }),
    ];
    expect(countFindings(findings)).toEqual({ critical: 2, warning: 1, info: 1, total: 4 });
  });
});

// ─── computeSavingsProjection ─────────────────────────────────────────────────

describe("computeSavingsProjection", () => {
  const immediateF = makeFindingFixture({
    id: "imm", ruleId: "excess-seats", severity: "critical", category: "seat_mismatch",
    action: "reduce_seats", estimatedMonthlySavingsUsd: 480,
  });
  const shortTermF = makeFindingFixture({
    id: "st", ruleId: "small-team-overplan", severity: "warning", category: "overplan",
    action: "downgrade_plan", estimatedMonthlySavingsUsd: 160,
  });
  const strategicF = makeFindingFixture({
    id: "str", ruleId: "overlapping-tools", severity: "critical", category: "overlap",
    action: "consolidate_tools", estimatedMonthlySavingsUsd: 200,
  });

  it("correctly sums monthly savings across all findings", () => {
    const proj = computeSavingsProjection([immediateF, shortTermF, strategicF], 1000);
    expect(proj.totalMonthlyUsd).toBe(840);
  });

  it("annualises correctly as totalMonthlyUsd × 12", () => {
    const proj = computeSavingsProjection([immediateF], 1000);
    expect(proj.totalAnnualUsd).toBe(proj.totalMonthlyUsd * 12);
  });

  it("buckets savings by timeline correctly", () => {
    const proj = computeSavingsProjection([immediateF, shortTermF, strategicF], 1000);
    expect(proj.byTimeline.immediate).toBe(480);
    expect(proj.byTimeline.short_term).toBe(160);
    expect(proj.byTimeline.strategic).toBe(200);
  });

  it("immediateMonthlyUsd includes only immediate-action savings", () => {
    const proj = computeSavingsProjection([immediateF, shortTermF, strategicF], 1000);
    expect(proj.immediateMonthlyUsd).toBe(480);
  });

  it("shortTermMonthlyUsd is cumulative (immediate + short_term)", () => {
    const proj = computeSavingsProjection([immediateF, shortTermF, strategicF], 1000);
    expect(proj.shortTermMonthlyUsd).toBe(640); // 480 + 160
  });

  it("builds 12 monthly chart data points", () => {
    const proj = computeSavingsProjection([immediateF], 1000);
    expect(proj.monthlyChart).toHaveLength(12);
  });

  it("cumulative savings start flowing from month 1 for immediate actions", () => {
    const proj = computeSavingsProjection([immediateF], 1000);
    expect(proj.monthlyChart[0].cumulativeSavingsUsd).toBe(480);
    expect(proj.monthlyChart[0].marginalSavingsUsd).toBe(480);
  });

  it("short-term savings appear from month 2", () => {
    const proj = computeSavingsProjection([shortTermF], 1000);
    expect(proj.monthlyChart[0].cumulativeSavingsUsd).toBe(0); // month 1: no savings yet
    expect(proj.monthlyChart[1].cumulativeSavingsUsd).toBe(160); // month 2: kicks in
  });

  it("strategic savings appear from month 4", () => {
    const proj = computeSavingsProjection([strategicF], 1000);
    expect(proj.monthlyChart[2].cumulativeSavingsUsd).toBe(0); // month 3: not yet
    expect(proj.monthlyChart[3].cumulativeSavingsUsd).toBe(200); // month 4: kicks in
  });

  it("savingsRatePct is 0 when currentSpend is 0 (no division by zero)", () => {
    const proj = computeSavingsProjection([immediateF], 0);
    expect(proj.savingsRatePct).toBe(0);
  });

  it("savingsRatePct is clamped to 100 when savings exceed spend", () => {
    const proj = computeSavingsProjection([immediateF], 100); // savings > spend
    expect(proj.savingsRatePct).toBe(100);
  });

  it("prioritisedActions orders immediate before short-term before strategic", () => {
    const proj = computeSavingsProjection([strategicF, shortTermF, immediateF], 1000);
    expect(proj.prioritisedActions[0].timeline).toBe("immediate");
    expect(proj.prioritisedActions[1].timeline).toBe("short_term");
    expect(proj.prioritisedActions[2].timeline).toBe("strategic");
  });

  it("prioritisedActions includes a running total that accumulates correctly", () => {
    const proj = computeSavingsProjection([immediateF, shortTermF], 1000);
    expect(proj.prioritisedActions[0].runningTotalUsd).toBe(480);
    expect(proj.prioritisedActions[1].runningTotalUsd).toBe(640); // 480 + 160
  });

  it("returns zero-value projection for an empty findings list", () => {
    const proj = computeSavingsProjection([], 1000);
    expect(proj.totalMonthlyUsd).toBe(0);
    expect(proj.totalAnnualUsd).toBe(0);
    expect(proj.prioritisedActions).toHaveLength(0);
    expect(proj.monthlyChart).toHaveLength(12);
    expect(proj.monthlyChart[11].cumulativeSavingsUsd).toBe(0);
  });
});

// ─── computePerToolSavings ────────────────────────────────────────────────────

describe("computePerToolSavings", () => {
  const findings: ReturnType<typeof makeFindingFixture>[] = [
    makeFindingFixture({ id: "a", ruleId: "excess-seats", toolId: "Cursor",  severity: "critical", category: "seat_mismatch", action: "reduce_seats",   estimatedMonthlySavingsUsd: 480 }),
    makeFindingFixture({ id: "b", ruleId: "annual-billing", toolId: "Cursor", severity: "warning",  category: "annual_savings", action: "switch_billing_cycle", estimatedMonthlySavingsUsd: 160 }),
    makeFindingFixture({ id: "c", ruleId: "underutilized", toolId: "ChatGPT", severity: "warning",  category: "underutilized", action: "downgrade_plan",  estimatedMonthlySavingsUsd: 200 }),
  ];
  const spendMap = { Cursor: 800, ChatGPT: 40, Claude: 0 };

  it("groups savings by tool correctly", () => {
    const summaries = computePerToolSavings(findings, spendMap);
    const cursor = summaries.find((s) => s.toolId === "Cursor");
    expect(cursor!.monthlyUsd).toBe(640); // 480 + 160
  });

  it("annualises correctly", () => {
    const summaries = computePerToolSavings(findings, spendMap);
    const cursor = summaries.find((s) => s.toolId === "Cursor");
    expect(cursor!.annualUsd).toBe(7680); // 640 × 12
  });

  it("computes savingsRatePct relative to current spend", () => {
    const summaries = computePerToolSavings(findings, spendMap);
    const chatgpt = summaries.find((s) => s.toolId === "ChatGPT");
    // $200 savings on $40 spend → clamped to 100%
    expect(chatgpt!.savingsRatePct).toBe(100);
  });

  it("includes tools with zero findings at monthlyUsd = 0", () => {
    const summaries = computePerToolSavings(findings, spendMap);
    const claude = summaries.find((s) => s.toolId === "Claude");
    expect(claude).toBeDefined();
    expect(claude!.monthlyUsd).toBe(0);
  });

  it("excludes portfolio-level findings from per-tool breakdown", () => {
    const portfolioF = makeFindingFixture({
      id: "p", ruleId: "high-per-head-spend", severity: "warning",
      category: "overspend", action: "consolidate_tools", estimatedMonthlySavingsUsd: 300,
      // no toolId — cross-tool finding
    });
    const summaries = computePerToolSavings([portfolioF], spendMap);
    const total = summaries.reduce((s, t) => s + t.monthlyUsd, 0);
    expect(total).toBe(0); // portfolio finding excluded
  });

  it("sorts output by monthly savings descending", () => {
    const summaries = computePerToolSavings(findings, spendMap);
    expect(summaries[0].toolId).toBe("Cursor"); // $640 > $200
  });

  it("clamps negative savings to 0 per tool", () => {
    const badF = makeFindingFixture({
      id: "bad", ruleId: "r", toolId: "Cursor", severity: "info",
      category: "overspend", action: "monitor_usage", estimatedMonthlySavingsUsd: -50,
    });
    const summaries = computePerToolSavings([badF], { Cursor: 200 });
    expect(summaries[0].monthlyUsd).toBe(0);
  });

  it("returns an empty array for empty inputs", () => {
    expect(computePerToolSavings([], {})).toEqual([]);
  });
});

// ─── aggregateToolSavings ─────────────────────────────────────────────────────

describe("aggregateToolSavings", () => {
  it("sums totalMonthlyUsd across all tool summaries", () => {
    const summaries = [
      { toolId: "Cursor",  monthlyUsd: 640, annualUsd: 7680, savingsRatePct: 80,  findingCount: 2 },
      { toolId: "ChatGPT", monthlyUsd: 200, annualUsd: 2400, savingsRatePct: 100, findingCount: 1 },
    ];
    const agg = aggregateToolSavings(summaries);
    expect(agg.totalMonthlyUsd).toBe(840);
    expect(agg.totalAnnualUsd).toBe(10080);
  });

  it("computes average savings rate across tools", () => {
    const summaries = [
      { toolId: "A", monthlyUsd: 100, annualUsd: 1200, savingsRatePct: 60, findingCount: 1 },
      { toolId: "B", monthlyUsd: 100, annualUsd: 1200, savingsRatePct: 40, findingCount: 1 },
    ];
    const agg = aggregateToolSavings(summaries);
    expect(agg.averageSavingsRatePct).toBe(50);
  });

  it("returns zeros for an empty input", () => {
    const agg = aggregateToolSavings([]);
    expect(agg.totalMonthlyUsd).toBe(0);
    expect(agg.totalAnnualUsd).toBe(0);
    expect(agg.averageSavingsRatePct).toBe(0);
  });
});
