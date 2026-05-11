/**
 * lib/validation/schemas.ts
 *
 * Composable domain schemas built from primitives.
 * All schemas export:
 *   - The Zod schema itself (for runtime validation)
 *   - An inferred TypeScript type (for static typing)
 *   - A safe-parse helper (returns { success, data, errors })
 */

import { z } from "zod";
import {
  aiToolSchema,
  companyNameSchema,
  monthlySpendSchema,
  planTierSchema,
  seatCountSchema,
  teamSizeSchema,
  useCaseSchema,
} from "./primitives";

// ─── Safe-parse result shape ───────────────────────────────────────────────────

export interface ParseSuccess<T> {
  success: true;
  data: T;
  errors: null;
}

export interface ParseFailure {
  success: false;
  data: null;
  /** Flat map of field path → first error message */
  errors: Record<string, string>;
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

/**
 * Wraps z.safeParse and flattens ZodError into a plain Record.
 * Field paths use dot-notation: "tools.0.monthlySpend"
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  input: unknown
): ParseResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, data: null, errors };
}

// ─── 1. Tool entry schema ──────────────────────────────────────────────────────

export const toolEntrySchema = z.object({
  tool: aiToolSchema,
  plan: planTierSchema,
  monthlySpend: monthlySpendSchema,
  seats: seatCountSchema,
});

export type ToolEntry = z.infer<typeof toolEntrySchema>;

export const parseToolEntry = (input: unknown) =>
  safeParse(toolEntrySchema, input);

// ─── 2. Tools array schema ─────────────────────────────────────────────────────

export const toolsArraySchema = z
  .array(toolEntrySchema)
  .min(1, "Add at least one AI tool.")
  .max(20, "You can audit up to 20 tools at once.");

export type ToolsArray = z.infer<typeof toolsArraySchema>;

export const parseToolsArray = (input: unknown) =>
  safeParse(toolsArraySchema, input);

// ─── 3. Organisation context schema ───────────────────────────────────────────

export const orgContextSchema = z.object({
  companyName: companyNameSchema,
  teamSize: teamSizeSchema,
  primaryUseCase: useCaseSchema,
  email: z.string().email("Please enter a valid email address.").optional(),
});

export type OrgContext = z.infer<typeof orgContextSchema>;

export const parseOrgContext = (input: unknown) =>
  safeParse(orgContextSchema, input);

// ─── 4. Full audit form schema (composed) ─────────────────────────────────────

export const auditFormSchema = orgContextSchema.extend({
  tools: toolsArraySchema,
});

export type AuditForm = z.infer<typeof auditFormSchema>;

export const parseAuditForm = (input: unknown) =>
  safeParse(auditFormSchema, input);

// ─── 5. Partial audit schema (for draft / autosave) ───────────────────────────

export const partialAuditFormSchema = auditFormSchema.partial();

export type PartialAuditForm = z.infer<typeof partialAuditFormSchema>;

export const parsePartialAuditForm = (input: unknown) =>
  safeParse(partialAuditFormSchema, input);

// ─── 6. Spend summary schema (read-only, derived output) ──────────────────────

export const spendSummarySchema = z.object({
  totalMonthlySpend: z
    .number()
    .nonnegative()
    .describe("Sum of all tool monthly spend values"),
  totalSeats: z
    .number()
    .int()
    .nonnegative()
    .describe("Sum of all tool seat counts"),
  spendPerHead: z
    .number()
    .nonnegative()
    .nullable()
    .describe("totalMonthlySpend ÷ teamSize; null when teamSize is unknown"),
  toolCount: z
    .number()
    .int()
    .nonnegative()
    .describe("Number of distinct tools in the audit"),
});

export type SpendSummary = z.infer<typeof spendSummarySchema>;
