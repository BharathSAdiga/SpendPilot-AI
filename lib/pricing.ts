/**
 * lib/pricing.ts
 *
 * Pure helper functions for querying the pricing registry.
 * No React deps — safe to use in server components, API routes, and tests.
 */

import { PRICING_REGISTRY } from "@/data/pricingConfig";
import type {
  AiToolPricingEntry,
  FlatRatePricing,
  PlanTierConfig,
  SpendEstimate,
} from "@/types/pricing";

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Returns the full pricing entry for a tool id.
 * Throws if the id is not in the registry (fails fast during development).
 */
export function getPricingEntry(toolId: string): AiToolPricingEntry {
  const entry = PRICING_REGISTRY[toolId];
  if (!entry) {
    throw new Error(
      `[pricing] Unknown tool id: "${toolId}". ` +
        `Valid ids: ${Object.keys(PRICING_REGISTRY).join(", ")}`
    );
  }
  return entry;
}

/**
 * Returns the full pricing entry or undefined (safe version for UI contexts
 * where the tool id may be an unvalidated user input).
 */
export function findPricingEntry(
  toolId: string
): AiToolPricingEntry | undefined {
  return PRICING_REGISTRY[toolId];
}

/**
 * Returns a specific plan config for a tool+plan pair.
 * Throws if either the tool or plan id is not found.
 */
export function getPlanConfig(toolId: string, planId: string): PlanTierConfig {
  const entry = getPricingEntry(toolId);
  const plan = entry.plans.find((p) => p.id === planId);
  if (!plan) {
    throw new Error(
      `[pricing] Plan "${planId}" not found for tool "${toolId}". ` +
        `Valid plans: ${entry.plans.map((p) => p.id).join(", ")}`
    );
  }
  return plan;
}

/**
 * Returns the "popular" plan for a tool, or the first plan if none is flagged.
 */
export function getPopularPlan(toolId: string): PlanTierConfig {
  const entry = getPricingEntry(toolId);
  return entry.plans.find((p) => p.isPopular) ?? entry.plans[0];
}

// ─── Spend estimation ─────────────────────────────────────────────────────────

/**
 * Estimates monthly USD spend for a given tool + plan + seat count.
 *
 * - flat_rate:    pricePerSeatMonthly × seats
 * - usage_based:  returns the midpoint of typicalMonthlySpend if available,
 *                 otherwise 0 (caller should prompt the user for actuals)
 * - tiered:       not auto-estimatable — returns 0
 * - custom:       uses startingAtMonthly if available, otherwise 0
 */
export function estimateMonthlySpend(
  toolId: string,
  planId: string,
  seats: number
): SpendEstimate {
  const entry = getPricingEntry(toolId);
  const plan = getPlanConfig(toolId, planId);
  const { pricing } = plan;

  let estimatedMonthlyUsd = 0;

  if (pricing.model === "flat_rate") {
    estimatedMonthlyUsd = (pricing as FlatRatePricing).pricePerSeatMonthly * seats;
  } else if (pricing.model === "usage_based") {
    const { typicalMonthlySpend } = pricing;
    if (typicalMonthlySpend) {
      estimatedMonthlyUsd = (typicalMonthlySpend.min + typicalMonthlySpend.max) / 2;
    }
  } else if (pricing.model === "custom") {
    estimatedMonthlyUsd = pricing.startingAtMonthly ?? 0;
  }

  return {
    toolId,
    toolName: entry.name,
    planId,
    seats,
    estimatedMonthlyUsd,
    pricingModel: pricing.model,
  };
}

/**
 * Estimates total monthly spend across multiple tool+plan+seat combinations.
 */
export function estimateTotalSpend(
  items: Array<{ toolId: string; planId: string; seats: number }>
): { lineItems: SpendEstimate[]; totalMonthlyUsd: number } {
  const lineItems = items.map((item) =>
    estimateMonthlySpend(item.toolId, item.planId, item.seats)
  );
  const totalMonthlyUsd = lineItems.reduce(
    (sum, item) => sum + item.estimatedMonthlyUsd,
    0
  );
  return { lineItems, totalMonthlyUsd };
}

// ─── Plan display helpers ─────────────────────────────────────────────────────

/**
 * Returns a human-readable price string for a plan.
 * e.g. "$20 / seat / month", "Usage-based", "Custom"
 */
export function formatPlanPrice(plan: PlanTierConfig): string {
  const { pricing } = plan;

  if (pricing.model === "flat_rate") {
    const p = pricing as FlatRatePricing;
    if (p.pricePerSeatMonthly === 0) return "Free";
    return `$${p.pricePerSeatMonthly.toFixed(2)} / seat / month`;
  }

  if (pricing.model === "usage_based") {
    return `Usage-based · $${pricing.pricePerUnit.toFixed(2)} / ${pricing.unit}`;
  }

  if (pricing.model === "tiered") {
    const first = pricing.tiers[0];
    return `From $${first.pricePerUnit.toFixed(4)} / ${first.unit}`;
  }

  if (pricing.model === "custom") {
    const hint = pricing.startingAtMonthly
      ? ` (from $${pricing.startingAtMonthly.toLocaleString()}/mo)`
      : "";
    return `Custom${hint}`;
  }

  return "—";
}

/**
 * Returns all plans for a tool sorted by ascending monthly price.
 * Usage-based and custom plans are pushed to the end.
 */
export function getSortedPlans(toolId: string): PlanTierConfig[] {
  const entry = getPricingEntry(toolId);
  return [...entry.plans].sort((a, b) => {
    const priceOf = (p: PlanTierConfig): number => {
      if (p.pricing.model === "flat_rate") return p.pricing.pricePerSeatMonthly;
      if (p.pricing.model === "usage_based") return p.pricing.pricePerUnit;
      if (p.pricing.model === "custom") return p.pricing.startingAtMonthly ?? Infinity;
      return Infinity;
    };
    return priceOf(a) - priceOf(b);
  });
}

// ─── Registry-level helpers ───────────────────────────────────────────────────

/** Returns all tool ids in the registry */
export function getAllToolIds(): string[] {
  return Object.keys(PRICING_REGISTRY);
}

/** Returns all tool entries as an array */
export function getAllTools(): AiToolPricingEntry[] {
  return Object.values(PRICING_REGISTRY);
}

/** Returns tools filtered by category */
export function getToolsByCategory(
  category: AiToolPricingEntry["category"]
): AiToolPricingEntry[] {
  return getAllTools().filter((t) => t.category === category);
}
