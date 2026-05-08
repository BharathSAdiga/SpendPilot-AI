/**
 * types/pricing.ts
 *
 * Scalable TypeScript type system for AI tool pricing configuration.
 * Designed to be the single source of truth consumed by:
 *   - The audit form (plan selectors, spend hints)
 *   - Report pages (benchmark comparisons)
 *   - Future pricing recommendation engine
 */

// ─── Billing cadence ──────────────────────────────────────────────────────────

export type BillingCadence = "monthly" | "annual" | "usage" | "one_time";

// ─── Pricing model ────────────────────────────────────────────────────────────

/**
 * Flat rate: fixed $/month regardless of usage.
 * e.g. ChatGPT Plus at $20/user/month
 */
export interface FlatRatePricing {
  model: "flat_rate";
  pricePerSeatMonthly: number; // USD
  billingCadence: Extract<BillingCadence, "monthly" | "annual">;
  /** Annual price per seat when paid yearly (undefined = same as monthly × 12) */
  pricePerSeatAnnual?: number;
}

/**
 * Usage-based: pay per token, request, or unit consumed.
 * e.g. OpenAI API, Anthropic API
 */
export interface UsageBasedPricing {
  model: "usage_based";
  /** Human-readable unit label: "1M tokens", "1K requests", etc. */
  unit: string;
  /** Price in USD per unit */
  pricePerUnit: number;
  /** Soft monthly spend cap estimate for a typical team (for budgeting hints) */
  typicalMonthlySpend?: { min: number; max: number };
}

/**
 * Tiered: price changes at usage thresholds.
 * e.g. Anthropic API with volume discounts
 */
export interface TieredPricing {
  model: "tiered";
  tiers: Array<{
    upToUnits: number | "unlimited";
    pricePerUnit: number;
    unit: string;
  }>;
}

/**
 * Custom/negotiated: no public price.
 * e.g. GitHub Copilot Enterprise
 */
export interface CustomPricing {
  model: "custom";
  /** Contact URL or email */
  contactUrl?: string;
  /** Starting-at price hint, if publicly known */
  startingAtMonthly?: number;
}

/** Discriminated union covering all pricing models */
export type PricingModel =
  | FlatRatePricing
  | UsageBasedPricing
  | TieredPricing
  | CustomPricing;

// ─── Seat suitability ─────────────────────────────────────────────────────────

export type SeatSuitability =
  | "individual"    // Best for single power users
  | "small_team"    // 2–20 seats sweet spot
  | "mid_market"    // 20–200 seats
  | "enterprise"    // 200+ seats / org-wide
  | "any";          // Scales well at all sizes

// ─── Intended user roles ──────────────────────────────────────────────────────

export type IntendedRole =
  | "developer"
  | "designer"
  | "data_scientist"
  | "product_manager"
  | "writer"
  | "researcher"
  | "devops"
  | "executive"
  | "any";

// ─── Plan tier ────────────────────────────────────────────────────────────────

export interface PlanTierConfig {
  /** Machine-readable key aligned with audit.ts PlanTier */
  id: string;
  /** Display name */
  label: string;
  /** One-line value proposition for this plan */
  tagline: string;
  /** Bullet points covering what's included */
  features: string[];
  pricing: PricingModel;
  /** Who benefits most from this plan */
  intendedRoles: IntendedRole[];
  /** How many seats this plan suits */
  seatSuitability: SeatSuitability;
  /** Is this the recommended/highlighted plan? */
  isPopular?: boolean;
  /** Whether this plan is generally available (false = waitlist / preview) */
  isAvailable?: boolean;
}

// ─── Tool category ────────────────────────────────────────────────────────────

export type ToolCategory =
  | "coding_assistant"
  | "chat_assistant"
  | "api_platform"
  | "multimodal"
  | "agentic";

// ─── Top-level tool pricing entry ─────────────────────────────────────────────

export interface AiToolPricingEntry {
  /** Canonical tool identifier — must match AI_TOOLS in types/audit.ts */
  id: string;
  /** Display name */
  name: string;
  /** Tool vendor / company */
  vendor: string;
  /** Short description of what the tool does */
  description: string;
  category: ToolCategory;
  /** URL to the official pricing page */
  pricingUrl: string;
  /** All available plans, ordered cheapest → most expensive */
  plans: PlanTierConfig[];
  /**
   * Estimated monthly spend range for a team of ~10 using a typical plan.
   * Used as a quick reference hint in the audit form.
   */
  typicalTeamSpend?: { min: number; max: number };
  /** Last date this pricing data was verified (ISO date string) */
  lastVerified: string;
}

// ─── Registry shape ───────────────────────────────────────────────────────────

/** The full pricing registry — keyed by tool id for O(1) lookup */
export type PricingRegistry = Readonly<Record<string, AiToolPricingEntry>>;

// ─── Derived utility types ────────────────────────────────────────────────────

/** Extract the union of all plan ids from a registry entry */
export type PlanIdsOf<T extends AiToolPricingEntry> =
  T["plans"][number]["id"];

/** Flat spend estimate returned by budgeting helpers */
export interface SpendEstimate {
  toolId: string;
  toolName: string;
  planId: string;
  seats: number;
  estimatedMonthlyUsd: number;
  pricingModel: PricingModel["model"];
}
