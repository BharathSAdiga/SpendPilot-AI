/**
 * lib/auditRules.ts
 *
 * Deterministic audit rules for the SpendPilot engine.
 *
 * Each rule is a focused condition-check that delegates all pricing lookups
 * to pricingUtils and all finding construction to findingFactory.
 * Rules contain NO formatting logic, NO pricing math, and NO object literals.
 */

import type { AuditFinding, AuditRule, RuleContext } from "@/types/auditEngine";
import { PRICING_REGISTRY } from "@/data/pricingConfig";
import { findPricingEntry } from "@/lib/pricing";

import {
  resolveFlatRatePlan,
  expectedMonthlySpend,
  annualMonthlyEquiv,
  findCheaperPlan,
  findSuitablePlan,
  planDowngradeSavings,
  flatMonthlyPrice,
} from "@/lib/utils/pricingUtils";

import {
  findingId,
  makeFinding,
  makePerToolFinding,
  makeDowngradeFinding,
  makeOverspendFinding,
  makeAnnualBillingFinding,
  makeExcessSeatsFinding,
} from "@/lib/utils/findingFactory";

import type { AiTool } from "@/types/audit";

/** Tools that overlap in function — paying for 2+ in a group is likely wasteful. */
const OVERLAP_GROUPS: ReadonlyArray<readonly AiTool[]> = [
  ["Cursor", "Windsurf", "GitHub Copilot"],   // coding assistants / AI IDEs
  ["ChatGPT", "Claude", "Gemini"],            // general-purpose chat assistants
  ["OpenAI API", "Anthropic API"],            // direct API platforms
];

/** Use-cases where enterprise API tools are almost always overkill. */
const LIGHTWEIGHT_USE_CASES = new Set(["content", "design", "customer_support"]);

// ─── Rule 1: Small team on enterprise / business plan ─────────────────────────

const smallTeamOverplan: AuditRule = {
  id: "small-team-overplan",
  name: "Small team on oversized plan",
  scope: "per_tool",
  evaluate({ input, toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const resolved = resolveFlatRatePlan(toolEntry);
    if (!resolved) return [];
    const { entry, plan } = resolved;

    if (plan.seatSuitability === "enterprise" && toolEntry.seats < 20) {
      const cheaper = findSuitablePlan(entry, toolEntry.seats, plan.id);
      return makeDowngradeFinding({
        ruleId: "small-team-overplan",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: "warning",
        currentPlanLabel: plan.label,
        suggestedPlan: cheaper,
        savingsPerMonth: cheaper ? planDowngradeSavings(plan, cheaper, toolEntry.seats) : 0,
        reasoningDetail: `The "${plan.label}" plan is designed for large organisations. Your team of ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""} can access the same core capabilities on a lower tier without paying for unused enterprise features.`,
        meta: { currentPlan: plan.label, seats: toolEntry.seats },
      });
    }

    if (plan.seatSuitability === "mid_market" && toolEntry.seats < 5) {
      const cheaper = findSuitablePlan(entry, toolEntry.seats, plan.id);
      return makeDowngradeFinding({
        ruleId: "small-team-overplan",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: "info",
        currentPlanLabel: plan.label,
        suggestedPlan: cheaper,
        savingsPerMonth: cheaper ? planDowngradeSavings(plan, cheaper, toolEntry.seats) : 0,
        reasoningDetail: `"${plan.label}" targets teams of 20+. With only ${toolEntry.seats} active seats you're likely paying for admin and compliance features you don't need yet.`,
        meta: { seats: toolEntry.seats },
      });
    }

    return [];
  },
};

// ─── Rule 2: Overspend vs. market benchmark ───────────────────────────────────

const overspendBenchmark: AuditRule = {
  id: "overspend-benchmark",
  name: "Spend exceeds market benchmark",
  scope: "per_tool",
  evaluate({ toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const resolved = resolveFlatRatePlan(toolEntry);
    if (!resolved) return [];
    const { entry, plan } = resolved;

    const listSpend   = expectedMonthlySpend(plan, toolEntry.seats);
    const overpayRatio = toolEntry.monthlySpend / (listSpend || 1);

    // Flag when paying >30% above list price
    if (listSpend > 0 && overpayRatio > 1.3) {
      return makeOverspendFinding({
        ruleId: "overspend-benchmark",
        toolId: toolEntry.tool,
        toolName: entry.name,
        actualSpend: toolEntry.monthlySpend,
        expectedSpend: listSpend,
        overpayPct: (overpayRatio - 1) * 100,
        planLabel: plan.label,
        seats: toolEntry.seats,
      });
    }

    return [];
  },
};

// ─── Rule 3: Annual billing savings ───────────────────────────────────────────

const annualBillingSavings: AuditRule = {
  id: "annual-billing-savings",
  name: "Switch to annual billing",
  scope: "per_tool",
  evaluate({ toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const resolved = resolveFlatRatePlan(toolEntry);
    if (!resolved) return [];
    const { entry, plan } = resolved;

    const annualEquiv = annualMonthlyEquiv(plan, toolEntry.seats);
    if (annualEquiv === null) return [];

    const monthlyTotal  = expectedMonthlySpend(plan, toolEntry.seats);
    const savingsPerMonth = monthlyTotal - annualEquiv;

    if (savingsPerMonth > 5) {
      return makeAnnualBillingFinding({
        ruleId: "annual-billing-savings",
        toolId: toolEntry.tool,
        toolName: entry.name,
        seats: toolEntry.seats,
        monthlyRatePerSeat: plan.pricing.pricePerSeatMonthly,
        annualRatePerSeat:  plan.pricing.pricePerSeatAnnual!,
        savingsPerMonth,
      });
    }

    return [];
  },
};

// ─── Rule 4: Seat count far exceeds team size ─────────────────────────────────

const excessSeats: AuditRule = {
  id: "excess-seats",
  name: "Seat count exceeds team size",
  scope: "per_tool",
  evaluate({ input, toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const resolved = resolveFlatRatePlan(toolEntry);
    if (!resolved) return [];
    const { entry, plan } = resolved;

    const excessRatio = toolEntry.seats / input.teamSize;
    const excessCount = toolEntry.seats - input.teamSize;

    // Flag when seats > 150% of team size with at least 3 excess
    if (excessRatio > 1.5 && excessCount >= 3) {
      return makeExcessSeatsFinding({
        ruleId: "excess-seats",
        toolId: toolEntry.tool,
        toolName: entry.name,
        seats: toolEntry.seats,
        teamSize: input.teamSize,
        excessCount,
        savingsPerMonth: excessCount * plan.pricing.pricePerSeatMonthly,
      });
    }

    return [];
  },
};

// ─── Rule 5: Expensive tool for lightweight use-case ─────────────────────────

const lightweightOverspend: AuditRule = {
  id: "lightweight-overspend",
  name: "Expensive tool for lightweight use-case",
  scope: "per_tool",
  evaluate({ input, toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    if (!LIGHTWEIGHT_USE_CASES.has(input.primaryUseCase)) return [];

    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    // API platforms are almost always overkill for content/design teams
    if (entry.category === "api_platform" && toolEntry.monthlySpend > 100) {
      return makePerToolFinding({
        ruleId: "lightweight-overspend",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: "warning",
        category: "alternative",
        title: `${entry.name}: API platform may be overkill for ${input.primaryUseCase} workflows`,
        reasoning: `Your primary use-case is "${input.primaryUseCase}" which typically doesn't require direct API access. A consumer chat product (ChatGPT Plus, Claude Pro) at a fraction of the cost usually covers these workflows without the engineering overhead of API integration.`,
        action: "switch_tool",
        actionDescription: "Consider ChatGPT Plus or Claude Pro as a simpler, cheaper alternative",
        estimatedMonthlySavingsUsd: Math.max(0, toolEntry.monthlySpend - 25),
        suggestedAlternativeTool: entry.vendor === "Anthropic" ? "Claude" : "ChatGPT",
        meta: { useCase: input.primaryUseCase, spend: toolEntry.monthlySpend },
      });
    }

    return [];
  },
};

// ─── Rule 6: Underutilized plan ───────────────────────────────────────────────

const underutilizedPlan: AuditRule = {
  id: "underutilized-plan",
  name: "Plan appears underutilized",
  scope: "per_tool",
  evaluate({ toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const resolved = resolveFlatRatePlan(toolEntry);
    if (!resolved) return [];
    const { entry, plan } = resolved;

    const listSpend  = expectedMonthlySpend(plan, toolEntry.seats);
    if (listSpend <= 0) return [];

    const utilRatio = toolEntry.monthlySpend / listSpend;
    const gap       = listSpend - toolEntry.monthlySpend;

    // Paying < 40% of plan capacity with a $15+ gap
    if (utilRatio >= 0.4 || gap < 15) return [];

    const suggested    = findCheaperPlan(entry, plan);
    const savingsPerMo = suggested
      ? planDowngradeSavings(plan, suggested, toolEntry.seats)
      : gap;

    return makePerToolFinding({
      ruleId: "underutilized-plan",
      toolId: toolEntry.tool,
      toolName: entry.name,
      severity: savingsPerMo > 50 ? "warning" : "info",
      category: "underutilized",
      title: `${entry.name}: Spend ($${toolEntry.monthlySpend.toFixed(0)}/mo) is ${Math.round(utilRatio * 100)}% of plan cost — plan may be underutilized`,
      reasoning: `You're on the "${plan.label}" plan ($${listSpend.toFixed(2)}/mo for ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""}) but only spending $${toolEntry.monthlySpend.toFixed(2)}/mo — just ${Math.round(utilRatio * 100)}% of capacity. Consider downgrading until utilisation increases.`,
      action: suggested ? "downgrade_plan" : "monitor_usage",
      actionDescription: suggested
        ? `Downgrade to "${suggested.label}" and save $${savingsPerMo.toFixed(0)}/mo`
        : "Review actual usage before next renewal and consider switching to a lower tier",
      estimatedMonthlySavingsUsd: Math.max(0, savingsPerMo),
      suggestedPlanId:    suggested?.id,
      suggestedPlanLabel: suggested?.label,
      meta: { listSpend, actualSpend: toolEntry.monthlySpend, utilPct: Math.round(utilRatio * 100) },
    });
  },
};

// ─── Rule 7: Overlapping tools in the same category ──────────────────────────

const overlappingTools: AuditRule = {
  id: "overlapping-tools",
  name: "Overlapping AI tools",
  scope: "portfolio",
  evaluate({ input }: RuleContext): AuditFinding[] {
    const toolIds = new Set(input.tools.map((t) => t.tool));

    return OVERLAP_GROUPS.flatMap((group) => {
      const overlap = group.filter((t) => toolIds.has(t));
      if (overlap.length < 2) return [];

      // Rank by spend — keep the cheapest, flag the rest
      const ranked = overlap
        .map((toolName) => {
          const toolEntry = input.tools.find((t) => t.tool === toolName)!;
          return { toolName, spend: toolEntry.monthlySpend };
        })
        .sort((a, b) => a.spend - b.spend);

      const [cheapest, ...expensive] = ranked;
      const saveable       = expensive.reduce((s, e) => s + e.spend, 0);
      const category       = PRICING_REGISTRY[cheapest.toolName]?.category ?? "coding_assistant";
      const categoryLabel  = category.replace(/_/g, " ");

      return makeFinding({
        id:       findingId("overlapping-tools", overlap.join("-")),
        ruleId:   "overlapping-tools",
        severity: saveable > 100 ? "critical" : "warning",
        category: "overlap",
        title:    `Overlapping ${categoryLabel}s: ${overlap.join(", ")}`,
        reasoning: `You're paying for ${overlap.length} tools in the same "${categoryLabel}" category: ${overlap.join(", ")}. Teams typically get 80%+ of value from a single best-fit tool. Consolidating to ${cheapest.toolName} (lowest cost at $${cheapest.spend.toFixed(2)}/mo) could save $${saveable.toFixed(2)}/mo.`,
        action: "consolidate_tools",
        actionDescription: `Consolidate to ${cheapest.toolName} and remove ${expensive.map((e) => e.toolName).join(", ")}`,
        estimatedMonthlySavingsUsd: saveable,
        meta: { tools: overlap.join(", "), keepTool: cheapest.toolName, saveableMonthly: saveable },
      });
    });
  },
};

// ─── Rule 8: Spend reported on a free plan ────────────────────────────────────

const freePlanWithSpend: AuditRule = {
  id: "free-plan-spend-mismatch",
  name: "Spend reported on free plan",
  scope: "per_tool",
  evaluate({ toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    if (toolEntry.plan !== "free" || toolEntry.monthlySpend <= 0) return [];

    return makeFinding({
      id:       findingId("free-plan-spend-mismatch", toolEntry.tool),
      ruleId:   "free-plan-spend-mismatch",
      toolId:   toolEntry.tool,
      toolName: toolEntry.tool,
      severity: "info",
      category: "overspend",
      title:    `${toolEntry.tool}: Spend reported on a free plan`,
      reasoning: `You selected the Free plan for ${toolEntry.tool} but reported $${toolEntry.monthlySpend.toFixed(2)}/mo. This may indicate the plan is incorrect or there are usage overage charges not captured in the plan selection.`,
      action: "monitor_usage",
      actionDescription: "Verify the correct plan is selected and check for overage fees",
      estimatedMonthlySavingsUsd: 0,
      meta: { reportedSpend: toolEntry.monthlySpend },
    });
  },
};

// ─── Rule 9: High per-head AI spend ──────────────────────────────────────────

const highPerHeadSpend: AuditRule = {
  id: "high-per-head-spend",
  name: "High total AI spend per team member",
  scope: "portfolio",
  evaluate({ input }: RuleContext): AuditFinding[] {
    const totalSpend = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
    const perHead    = totalSpend / input.teamSize;

    // > $100/person/month is above industry benchmark
    if (perHead <= 100) return [];

    return makeFinding({
      id:       "high-per-head-spend:portfolio",
      ruleId:   "high-per-head-spend",
      severity: perHead > 200 ? "critical" : "warning",
      category: "overspend",
      title:    `AI spend is $${perHead.toFixed(0)}/person/month — above the $100 benchmark`,
      reasoning: `Total AI spend of $${totalSpend.toFixed(2)}/mo across ${input.teamSize} people equals $${perHead.toFixed(2)}/person/month. Industry benchmarks for well-managed dev teams run $40–$80/person/month. Review overlapping tools and oversized plans to bring this in line.`,
      action: "consolidate_tools",
      actionDescription: "Follow the specific tool recommendations below to reduce per-head cost",
      estimatedMonthlySavingsUsd: (perHead - 80) * input.teamSize,
      meta: { totalSpend, perHead: perHead.toFixed(2), teamSize: input.teamSize },
    });
  },
};

// ─── Rule registry ────────────────────────────────────────────────────────────

export const AUDIT_RULES: AuditRule[] = [
  // Portfolio rules (run once across all tools)
  highPerHeadSpend,
  overlappingTools,
  // Per-tool rules (run once per tool entry)
  smallTeamOverplan,
  overspendBenchmark,
  annualBillingSavings,
  excessSeats,
  lightweightOverspend,
  underutilizedPlan,
  freePlanWithSpend,
];
