/**
 * lib/validation/primitives.ts
 *
 * Atomic, composable Zod primitives reused across all audit schemas.
 * Each primitive is a standalone schema that can be used independently
 * or combined into larger object schemas.
 */

import { z } from "zod";
import { AI_TOOLS, USE_CASES } from "@/types/audit";

// ─── String primitives ─────────────────────────────────────────────────────────

/** Non-empty, trimmed string with configurable length bounds */
export function requiredString({
  fieldName = "This field",
  min = 2,
  max = 255,
}: {
  fieldName?: string;
  min?: number;
  max?: number;
} = {}) {
  return z
    .string({ error: `${fieldName} is required.` })
    .trim()
    .min(min, `${fieldName} must be at least ${min} characters.`)
    .max(max, `${fieldName} must be ${max} characters or fewer.`);
}

/** Company / organisation name */
export const companyNameSchema = requiredString({
  fieldName: "Company name",
  min: 2,
  max: 80,
});

// ─── Number primitives ─────────────────────────────────────────────────────────

/**
 * Positive monetary amount in USD.
 * - Accepts 0 (free-tier tools)
 * - Rejects negative values
 * - Hard ceiling at $1,000,000 / month per tool
 */
export const monthlySpendSchema = z
  .number({ error: "Enter a valid USD amount." })
  .nonnegative("Monthly spend cannot be negative.")
  .max(1_000_000, "Monthly spend cannot exceed $1,000,000.")
  .refine((v) => Number.isFinite(v), "Monthly spend must be a finite number.")
  .refine(
    (v) => Math.round(v * 100) / 100 === v,
    "Monthly spend can have at most 2 decimal places."
  );

/**
 * Seat / licence count.
 * - Minimum 1 (free tools with a single user still occupy 1 seat)
 * - Integer only (no fractional licences)
 * - Hard ceiling at 9,999
 */
export const seatCountSchema = z
  .number({ error: "Enter the number of seats." })
  .int("Seat count must be a whole number.")
  .min(1, "At least 1 seat is required.")
  .max(9_999, "Seat count cannot exceed 9,999.");

/**
 * Team / headcount size.
 * - Minimum 1 (solo founder is still a team of 1)
 * - Integer only
 * - Hard ceiling at 100,000
 */
export const teamSizeSchema = z
  .number({ error: "Enter your team size." })
  .int("Team size must be a whole number.")
  .min(1, "Team size must be at least 1.")
  .max(100_000, "Team size cannot exceed 100,000.");

// ─── Enum primitives ───────────────────────────────────────────────────────────

/** One of the 8 supported AI tools */
export const aiToolSchema = z.enum(AI_TOOLS, {
  error: "Select a supported AI tool.",
});

/**
 * Plan ID — a non-empty string matching a plan id in the pricing registry
 * (e.g. "pro", "business", "team", "plus", "advanced", "pay_as_you_go").
 * Cross-validated against PRICING_REGISTRY at the engine layer.
 */
export const planTierSchema = z
  .string({ error: "Select a billing plan." })
  .min(1, "Select a billing plan.");

/** Primary team use case */
export const useCaseSchema = z.enum(USE_CASES, {
  error: "Select a primary use case.",
});

// ─── Re-export types ───────────────────────────────────────────────────────────

export type CompanyName = z.infer<typeof companyNameSchema>;
export type MonthlySpend = z.infer<typeof monthlySpendSchema>;
export type SeatCount = z.infer<typeof seatCountSchema>;
export type TeamSize = z.infer<typeof teamSizeSchema>;
export type AiToolValue = z.infer<typeof aiToolSchema>;
export type PlanTierValue = z.infer<typeof planTierSchema>;
export type UseCaseValue = z.infer<typeof useCaseSchema>;
