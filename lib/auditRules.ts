/**
 * lib/auditRules.ts — All deterministic audit rules.
 */

import type { AuditFinding, AuditRule, RuleContext } from "@/types/auditEngine";
import { PRICING_REGISTRY } from "@/data/pricingConfig";
import { findPricingEntry, formatPlanPrice } from "@/lib/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function id(ruleId: string, toolId?: string, suffix?: string) {
  return [ruleId, toolId, suffix].filter(Boolean).join(":");
}

// Map pricing seatSuitability → seat thresholds
const SEAT_LIMITS: Record<string, { max: number }> = {
  individual: { max: 1 },
  small_team: { max: 20 },
  mid_market: { max: 200 },
  enterprise: { max: Infinity },
  any: { max: Infinity },
};

// Tools that overlap in function — groups where paying for 2+ is likely wasteful
const OVERLAP_GROUPS: string[][] = [
  ["Cursor", "Windsurf", "GitHub Copilot"],          // coding assistants / AI IDEs
  ["ChatGPT", "Claude", "Gemini"],                   // general-purpose chat assistants
  ["OpenAI API", "Anthropic API"],                   // API platforms (same class of product)
];

// ─── Rule 1: Small team on enterprise/business plan ───────────────────────────

const smallTeamOverplan: AuditRule = {
  id: "small-team-overplan",
  name: "Small team on oversized plan",
  scope: "per_tool",
  evaluate({ input, toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    const currentPlan = entry.plans.find((p) => p.id === toolEntry.plan);
    if (!currentPlan) return [];

    const suitability = currentPlan.seatSuitability;
    const maxSeats = SEAT_LIMITS[suitability]?.max ?? Infinity;

    // Flag when seats are well below what the plan is designed for
    if (suitability === "enterprise" && toolEntry.seats < 20) {
      // Find cheapest suitable plan
      const cheaper = entry.plans.find(
        (p) =>
          p.id !== currentPlan.id &&
          (SEAT_LIMITS[p.seatSuitability]?.max ?? Infinity) >= toolEntry.seats &&
          p.pricing.model === "flat_rate" &&
          p.pricing.pricePerSeatMonthly < (currentPlan.pricing.model === "flat_rate" ? currentPlan.pricing.pricePerSeatMonthly : Infinity)
      );
      const savings =
        cheaper && cheaper.pricing.model === "flat_rate" && currentPlan.pricing.model === "flat_rate"
          ? (currentPlan.pricing.pricePerSeatMonthly - cheaper.pricing.pricePerSeatMonthly) * toolEntry.seats
          : 0;

      return [{
        id: id("small-team-overplan", toolEntry.tool),
        ruleId: "small-team-overplan",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: "warning",
        category: "overplan",
        title: `${entry.name}: Enterprise plan for only ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""}`,
        reasoning: `The "${currentPlan.label}" plan is designed for large organisations. Your team of ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""} can access the same core capabilities on a lower tier without paying for unused enterprise features.`,
        action: "downgrade_plan",
        actionDescription: cheaper
          ? `Downgrade to "${cheaper.label}" (${formatPlanPrice(cheaper)})`
          : "Review available plans on the vendor's pricing page",
        estimatedMonthlySavingsUsd: savings,
        suggestedPlanId: cheaper?.id,
        suggestedPlanLabel: cheaper?.label,
        meta: { currentPlan: currentPlan.label, seats: toolEntry.seats },
      }];
    }

    if (suitability === "mid_market" && toolEntry.seats < 5) {
      const cheaper = entry.plans.find(
        (p) => p.id !== currentPlan.id && ["individual", "small_team"].includes(p.seatSuitability)
      );
      const savings =
        cheaper && cheaper.pricing.model === "flat_rate" && currentPlan.pricing.model === "flat_rate"
          ? (currentPlan.pricing.pricePerSeatMonthly - cheaper.pricing.pricePerSeatMonthly) * toolEntry.seats
          : 0;

      return [{
        id: id("small-team-overplan", toolEntry.tool),
        ruleId: "small-team-overplan",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: "info",
        category: "overplan",
        title: `${entry.name}: Business plan may be oversized for ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""}`,
        reasoning: `"${currentPlan.label}" targets teams of 20+. With only ${toolEntry.seats} active seats you're likely paying for admin and compliance features you don't need yet.`,
        action: "downgrade_plan",
        actionDescription: cheaper
          ? `Consider downgrading to "${cheaper.label}" until the team grows`
          : "Review plans as the team scales",
        estimatedMonthlySavingsUsd: Math.max(savings, 0),
        suggestedPlanId: cheaper?.id,
        suggestedPlanLabel: cheaper?.label,
        meta: { seats: toolEntry.seats, maxSeats },
      }];
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
    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    const currentPlan = entry.plans.find((p) => p.id === toolEntry.plan);
    if (!currentPlan || currentPlan.pricing.model !== "flat_rate") return [];

    const expectedSpend = currentPlan.pricing.pricePerSeatMonthly * toolEntry.seats;
    const overpayRatio = toolEntry.monthlySpend / (expectedSpend || 1);

    // Paying >30% more than list price (e.g. legacy contract, wrong seats)
    if (expectedSpend > 0 && overpayRatio > 1.3) {
      const excess = toolEntry.monthlySpend - expectedSpend;
      return [{
        id: id("overspend-benchmark", toolEntry.tool),
        ruleId: "overspend-benchmark",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: excess > 100 ? "critical" : "warning",
        category: "overspend",
        title: `${entry.name}: Paying $${excess.toFixed(0)}/mo above list price`,
        reasoning: `At ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""} on "${currentPlan.label}", the list price is $${expectedSpend.toFixed(2)}/mo but you reported $${toolEntry.monthlySpend.toFixed(2)}/mo — ${((overpayRatio - 1) * 100).toFixed(0)}% above market rate. This often indicates legacy pricing, incorrect seat counts, or add-ons that could be removed.`,
        action: "monitor_usage",
        actionDescription: "Audit seat count and check for unnecessary add-ons or legacy contracts",
        estimatedMonthlySavingsUsd: excess,
        meta: { expected: expectedSpend, actual: toolEntry.monthlySpend, overpayPct: ((overpayRatio - 1) * 100).toFixed(0) },
      }];
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
    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    const plan = entry.plans.find((p) => p.id === toolEntry.plan);
    if (!plan || plan.pricing.model !== "flat_rate") return [];

    const { pricePerSeatMonthly, pricePerSeatAnnual } = plan.pricing;
    if (!pricePerSeatAnnual) return [];

    const monthlyTotal = pricePerSeatMonthly * toolEntry.seats;
    const annualMonthlyEquiv = (pricePerSeatAnnual * toolEntry.seats) / 12;
    const savings = monthlyTotal - annualMonthlyEquiv;
    const savingsPct = (savings / monthlyTotal) * 100;

    if (savings > 5) {
      return [{
        id: id("annual-billing-savings", toolEntry.tool),
        ruleId: "annual-billing-savings",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: savings > 50 ? "warning" : "info",
        category: "annual_savings",
        title: `${entry.name}: Save $${(savings * 12).toFixed(0)}/year by switching to annual billing`,
        reasoning: `Paying monthly at $${pricePerSeatMonthly}/seat costs $${monthlyTotal.toFixed(2)}/mo. Annual billing reduces this to ~$${annualMonthlyEquiv.toFixed(2)}/mo — a ${savingsPct.toFixed(0)}% saving ($${(savings * 12).toFixed(0)}/year) for ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""}.`,
        action: "switch_billing_cycle",
        actionDescription: `Switch to annual billing to save $${(savings * 12).toFixed(0)}/year`,
        estimatedMonthlySavingsUsd: savings,
        meta: { monthlyRate: pricePerSeatMonthly, annualRate: pricePerSeatAnnual, seats: toolEntry.seats },
      }];
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
    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    const plan = entry.plans.find((p) => p.id === toolEntry.plan);
    if (!plan || plan.pricing.model !== "flat_rate") return [];

    const { teamSize } = input;
    const excessRatio = toolEntry.seats / teamSize;

    // Seats > 150% of team size is suspicious
    if (excessRatio > 1.5 && toolEntry.seats - teamSize >= 3) {
      const excessCount = toolEntry.seats - teamSize;
      const savings = excessCount * plan.pricing.pricePerSeatMonthly;
      return [{
        id: id("excess-seats", toolEntry.tool),
        ruleId: "excess-seats",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: savings > 100 ? "critical" : "warning",
        category: "seat_mismatch",
        title: `${entry.name}: ${excessCount} potentially unused seat${excessCount !== 1 ? "s" : ""}`,
        reasoning: `You have ${toolEntry.seats} seats licensed for a team of ${teamSize}. The ${excessCount} excess seat${excessCount !== 1 ? "s" : ""} cost $${savings.toFixed(2)}/mo. Even accounting for contractors or planned hires, this warrants a review.`,
        action: "reduce_seats",
        actionDescription: `Reduce to ${teamSize} seats to save $${savings.toFixed(2)}/mo`,
        estimatedMonthlySavingsUsd: savings,
        meta: { seats: toolEntry.seats, teamSize, excess: excessCount },
      }];
    }

    return [];
  },
};

// ─── Rule 5: High spend for lightweight use-case ──────────────────────────────

const lightweightOverspend: AuditRule = {
  id: "lightweight-overspend",
  name: "Expensive tool for lightweight use-case",
  scope: "per_tool",
  evaluate({ input, toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    // Use-cases that rarely need enterprise-tier AI tools
    const lightweightCases = new Set(["content", "design", "customer_support"]);
    if (!lightweightCases.has(input.primaryUseCase)) return [];

    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    // API platforms are almost always overkill for content/design teams
    if (entry.category === "api_platform" && toolEntry.monthlySpend > 100) {
      return [{
        id: id("lightweight-overspend", toolEntry.tool),
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
      }];
    }

    return [];
  },
};

// ─── Rule 6b: Underutilized plan ────────────────────────────────────────────────────────────

/**
 * Fires when the reported monthly spend is well below what the selected plan
 * implies. Signals the tool is barely used — consider the free tier or a lower
 * plan before renewing.
 *
 * Threshold: actual spend < 40% of expected spend (seats × per-seat price).
 * Minimum gap: $15/mo to avoid noise on cheap tools.
 */
const underutilizedPlan: AuditRule = {
  id: "underutilized-plan",
  name: "Plan appears underutilized",
  scope: "per_tool",
  evaluate({ toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    const entry = findPricingEntry(toolEntry.tool);
    if (!entry) return [];

    const plan = entry.plans.find((p) => p.id === toolEntry.plan);
    if (!plan || plan.pricing.model !== "flat_rate") return [];

    const expectedSpend = plan.pricing.pricePerSeatMonthly * toolEntry.seats;
    if (expectedSpend <= 0) return [];

    const utilRatio = toolEntry.monthlySpend / expectedSpend;
    const gap = expectedSpend - toolEntry.monthlySpend;

    // Paying < 40% of what the plan costs with a gap of at least $15
    if (utilRatio < 0.4 && gap >= 15) {
      // Find the free plan or cheapest alternative
      const freePlan = entry.plans.find((p) => p.id === "free" || p.pricing.model === "flat_rate" && p.pricing.pricePerSeatMonthly === 0);
      const cheaperPlans = entry.plans
        .filter((p) => p.pricing.model === "flat_rate" && p.pricing.pricePerSeatMonthly < plan.pricing.pricePerSeatMonthly)
        .sort((a, b) => {
          const aPrice = a.pricing.model === "flat_rate" ? a.pricing.pricePerSeatMonthly : Infinity;
          const bPrice = b.pricing.model === "flat_rate" ? b.pricing.pricePerSeatMonthly : Infinity;
          return bPrice - aPrice; // highest of the cheaper options first
        });

      const suggested = cheaperPlans[0] ?? freePlan;
      const savings = suggested && suggested.pricing.model === "flat_rate"
        ? (plan.pricing.pricePerSeatMonthly - suggested.pricing.pricePerSeatMonthly) * toolEntry.seats
        : gap;

      return [{
        id: id("underutilized-plan", toolEntry.tool),
        ruleId: "underutilized-plan",
        toolId: toolEntry.tool,
        toolName: entry.name,
        severity: savings > 50 ? "warning" : "info",
        category: "underutilized",
        title: `${entry.name}: Spend ($${toolEntry.monthlySpend.toFixed(0)}/mo) is ${Math.round(utilRatio * 100)}% of plan cost — plan may be underutilized`,
        reasoning: `You\'re on the "${plan.label}" plan ($${expectedSpend.toFixed(2)}/mo for ${toolEntry.seats} seat${toolEntry.seats !== 1 ? "s" : ""}) but only spending $${toolEntry.monthlySpend.toFixed(2)}/mo — just ${Math.round(utilRatio * 100)}% of capacity. This typically means the team isn\'t making full use of the plan\'s capabilities. Consider downgrading until utilisation increases.`,
        action: suggested ? "downgrade_plan" : "monitor_usage",
        actionDescription: suggested
          ? `Downgrade to "${suggested.label}" (${formatPlanPrice(suggested)}) and save $${savings.toFixed(0)}/mo`
          : "Review actual usage before next renewal and consider switching to a lower tier",
        estimatedMonthlySavingsUsd: Math.max(0, savings),
        suggestedPlanId: suggested?.id,
        suggestedPlanLabel: suggested?.label,
        meta: { expectedSpend, actualSpend: toolEntry.monthlySpend, utilPct: Math.round(utilRatio * 100) },
      }];
    }

    return [];
  },
};

// ─── Rule 7: Overlapping tools in the same category ──────────────────────────

const overlappingTools: AuditRule = {
  id: "overlapping-tools",
  name: "Overlapping AI tools",
  scope: "portfolio",
  evaluate({ input }: RuleContext): AuditFinding[] {
    const findings: AuditFinding[] = [];
    const toolIds = input.tools.map((t) => t.tool);

    for (const group of OVERLAP_GROUPS) {
      const overlap = group.filter((t) => toolIds.includes(t as any));
      if (overlap.length < 2) continue;

      // Keep the cheapest, flag the rest
      const entries = overlap.map((toolName) => {
        const toolEntry = input.tools.find((t) => t.tool === toolName)!;
        return { toolName, toolEntry, spend: toolEntry.monthlySpend };
      }).sort((a, b) => a.spend - b.spend);

      const [cheapest, ...expensive] = entries;
      const saveable = expensive.reduce((s, e) => s + e.spend, 0);
      const category = PRICING_REGISTRY[cheapest.toolName]?.category ?? "coding_assistant";
      const categoryLabel = category.replace(/_/g, " ");

      findings.push({
        id: id("overlapping-tools", overlap.join("-")),
        ruleId: "overlapping-tools",
        severity: saveable > 100 ? "critical" : "warning",
        category: "overlap",
        title: `Overlapping ${categoryLabel}s: ${overlap.join(", ")}`,
        reasoning: `You're paying for ${overlap.length} tools in the same "${categoryLabel}" category: ${overlap.join(", ")}. Teams typically get 80%+ of the value from a single best-fit tool. Consolidating to ${cheapest.toolName} (your lowest-cost option at $${cheapest.spend.toFixed(2)}/mo) could save $${saveable.toFixed(2)}/mo.`,
        action: "consolidate_tools",
        actionDescription: `Consolidate to ${cheapest.toolName} and remove ${expensive.map((e) => e.toolName).join(", ")}`,
        estimatedMonthlySavingsUsd: saveable,
        meta: { tools: overlap.join(", "), keepTool: cheapest.toolName, saveableMonthly: saveable },
      });
    }

    return findings;
  },
};

// ─── Rule 7: Free plan with zero spend (sanity / info) ───────────────────────

const freePlanWithSpend: AuditRule = {
  id: "free-plan-spend-mismatch",
  name: "Spend reported on free plan",
  scope: "per_tool",
  evaluate({ toolEntry }: RuleContext): AuditFinding[] {
    if (!toolEntry) return [];
    if (toolEntry.plan !== "free") return [];
    if (toolEntry.monthlySpend <= 0) return [];

    return [{
      id: id("free-plan-spend-mismatch", toolEntry.tool),
      ruleId: "free-plan-spend-mismatch",
      toolId: toolEntry.tool,
      toolName: toolEntry.tool,
      severity: "info",
      category: "overspend",
      title: `${toolEntry.tool}: Spend reported on a free plan`,
      reasoning: `You selected the Free plan for ${toolEntry.tool} but reported $${toolEntry.monthlySpend.toFixed(2)}/mo. This may indicate the plan is incorrect, or there are usage overage charges not captured in the plan selection.`,
      action: "monitor_usage",
      actionDescription: "Verify the correct plan is selected and check for overage fees",
      estimatedMonthlySavingsUsd: 0,
      meta: { reportedSpend: toolEntry.monthlySpend },
    }];
  },
};

// ─── Rule 8: High per-head AI spend ──────────────────────────────────────────

const highPerHeadSpend: AuditRule = {
  id: "high-per-head-spend",
  name: "High total AI spend per team member",
  scope: "portfolio",
  evaluate({ input }: RuleContext): AuditFinding[] {
    const totalSpend = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
    const perHead = totalSpend / input.teamSize;

    // >$100/person/month is high for most teams
    if (perHead > 100) {
      return [{
        id: "high-per-head-spend:portfolio",
        ruleId: "high-per-head-spend",
        severity: perHead > 200 ? "critical" : "warning",
        category: "overspend",
        title: `AI spend is $${perHead.toFixed(0)}/person/month — above the $100 benchmark`,
        reasoning: `Total AI spend of $${totalSpend.toFixed(2)}/mo across ${input.teamSize} people equals $${perHead.toFixed(2)}/person/month. Industry benchmarks for well-managed dev teams run $40–$80/person/month. Review the overlapping tools and oversized plans flagged below to bring this in line.`,
        action: "consolidate_tools",
        actionDescription: "Follow the specific tool recommendations below to reduce per-head cost",
        estimatedMonthlySavingsUsd: (perHead - 80) * input.teamSize,
        meta: { totalSpend, perHead: perHead.toFixed(2), teamSize: input.teamSize },
      }];
    }

    return [];
  },
};

// ─── Exported rule registry ───────────────────────────────────────────────────

export const AUDIT_RULES: AuditRule[] = [
  // Portfolio-level (run once, see all tools)
  highPerHeadSpend,
  overlappingTools,
  // Per-tool (run once per tool)
  smallTeamOverplan,
  overspendBenchmark,
  annualBillingSavings,
  excessSeats,
  lightweightOverspend,
  underutilizedPlan,
  freePlanWithSpend,
];
