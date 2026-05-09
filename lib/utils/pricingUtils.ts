/**
 * lib/utils/pricingUtils.ts
 *
 * Pure pricing query utilities used by audit rules.
 * Extends lib/pricing.ts with rule-specific helpers that aren't
 * general enough to live in the shared pricing library.
 *
 * All functions are pure — no side effects, safe in server and worker contexts.
 */

import type { AiToolPricingEntry, FlatRatePricing, PlanTierConfig } from "@/types/pricing";
import { findPricingEntry } from "@/lib/pricing";
import type { AuditToolEntry } from "@/types/audit";

// ─── Plan resolution ──────────────────────────────────────────────────────────

export interface ResolvedPlan {
  entry: AiToolPricingEntry;
  plan: PlanTierConfig & { pricing: FlatRatePricing };
}

/**
 * Resolves a tool entry to its registry entry + flat-rate plan config.
 * Returns null if the tool is not in the registry or the plan is not flat-rate.
 * Eliminates the `findPricingEntry → plans.find → model guard` pattern
 * repeated in every per-tool rule.
 */
export function resolveFlatRatePlan(toolEntry: AuditToolEntry): ResolvedPlan | null {
  const entry = findPricingEntry(toolEntry.tool);
  if (!entry) return null;

  const plan = entry.plans.find((p) => p.id === toolEntry.plan);
  if (!plan || plan.pricing.model !== "flat_rate") return null;

  return { entry, plan: plan as PlanTierConfig & { pricing: FlatRatePricing } };
}

/**
 * Resolves a tool entry to its registry entry + any plan (including non-flat-rate).
 * Returns null if the tool or plan is not found.
 */
export function resolvePlan(
  toolEntry: AuditToolEntry
): { entry: AiToolPricingEntry; plan: PlanTierConfig } | null {
  const entry = findPricingEntry(toolEntry.tool);
  if (!entry) return null;

  const plan = entry.plans.find((p) => p.id === toolEntry.plan);
  if (!plan) return null;

  return { entry, plan };
}

// ─── Expected spend ───────────────────────────────────────────────────────────

/**
 * Computes the expected monthly spend for a flat-rate plan at a given seat count.
 * Returns 0 for usage-based or custom plans.
 */
export function expectedMonthlySpend(plan: PlanTierConfig, seats: number): number {
  if (plan.pricing.model !== "flat_rate") return 0;
  return plan.pricing.pricePerSeatMonthly * seats;
}

/**
 * Computes the monthly equivalent of the annual billing rate.
 * Returns null if no annual rate exists for this plan.
 */
export function annualMonthlyEquiv(
  plan: PlanTierConfig & { pricing: FlatRatePricing },
  seats: number
): number | null {
  const { pricePerSeatAnnual } = plan.pricing;
  if (!pricePerSeatAnnual) return null;
  return (pricePerSeatAnnual * seats) / 12;
}

// ─── Plan comparison helpers ──────────────────────────────────────────────────

/** Returns the per-seat monthly price, or Infinity for non-flat-rate plans. */
export function flatMonthlyPrice(plan: PlanTierConfig): number {
  return plan.pricing.model === "flat_rate"
    ? plan.pricing.pricePerSeatMonthly
    : Infinity;
}

/**
 * Finds the best (highest-priced) plan that is cheaper than the current plan.
 * "Best" = closest step down rather than jumping straight to free, since
 * the team should retain as many features as they need.
 *
 * Returns null if no cheaper flat-rate plan exists.
 */
export function findCheaperPlan(
  entry: AiToolPricingEntry,
  currentPlan: PlanTierConfig
): PlanTierConfig | null {
  const currentPrice = flatMonthlyPrice(currentPlan);

  const cheaper = entry.plans
    .filter(
      (p) =>
        p.id !== currentPlan.id &&
        p.pricing.model === "flat_rate" &&
        p.pricing.pricePerSeatMonthly < currentPrice
    )
    .sort((a, b) => flatMonthlyPrice(b) - flatMonthlyPrice(a)); // highest of the cheaper options

  return cheaper[0] ?? null;
}

/**
 * Finds a plan suitable for the given seat count by seatSuitability tier.
 * Prefers the least expensive plan that still fits the team.
 */
export function findSuitablePlan(
  entry: AiToolPricingEntry,
  seats: number,
  excludePlanId: string
): PlanTierConfig | null {
  const SEAT_MAX: Record<string, number> = {
    individual: 1,
    small_team: 20,
    mid_market: 200,
    enterprise: Infinity,
    any: Infinity,
  };

  const candidates = entry.plans
    .filter(
      (p) =>
        p.id !== excludePlanId &&
        (SEAT_MAX[p.seatSuitability] ?? Infinity) >= seats &&
        p.pricing.model === "flat_rate"
    )
    .sort((a, b) => flatMonthlyPrice(a) - flatMonthlyPrice(b));

  return candidates[0] ?? null;
}

// ─── Savings arithmetic ───────────────────────────────────────────────────────

/**
 * Computes the monthly saving from switching from one flat-rate plan to another.
 * Returns 0 if either plan is not flat-rate, or if the switch is not cheaper.
 */
export function planDowngradeSavings(
  from: PlanTierConfig,
  to: PlanTierConfig,
  seats: number
): number {
  if (from.pricing.model !== "flat_rate" || to.pricing.model !== "flat_rate") return 0;
  return Math.max(
    0,
    (from.pricing.pricePerSeatMonthly - to.pricing.pricePerSeatMonthly) * seats
  );
}
