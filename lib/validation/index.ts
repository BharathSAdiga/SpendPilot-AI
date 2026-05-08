/**
 * lib/validation/index.ts
 *
 * Single entry-point for all validation exports.
 * Consumers import from "@/lib/validation" — never from sub-files directly.
 *
 * Usage:
 *   import { auditFormSchema, parseAuditForm, type AuditForm } from "@/lib/validation";
 */

// Primitives
export {
  requiredString,
  companyNameSchema,
  monthlySpendSchema,
  seatCountSchema,
  teamSizeSchema,
  aiToolSchema,
  planTierSchema,
  useCaseSchema,
} from "./primitives";

export type {
  CompanyName,
  MonthlySpend,
  SeatCount,
  TeamSize,
  AiToolValue,
  PlanTierValue,
  UseCaseValue,
} from "./primitives";

// Domain schemas + safe-parse helpers
export {
  safeParse,
  toolEntrySchema,
  parseToolEntry,
  toolsArraySchema,
  parseToolsArray,
  orgContextSchema,
  parseOrgContext,
  auditFormSchema,
  parseAuditForm,
  partialAuditFormSchema,
  parsePartialAuditForm,
  spendSummarySchema,
} from "./schemas";

export type {
  ParseSuccess,
  ParseFailure,
  ParseResult,
  ToolEntry,
  ToolsArray,
  OrgContext,
  AuditForm,
  PartialAuditForm,
  SpendSummary,
} from "./schemas";
