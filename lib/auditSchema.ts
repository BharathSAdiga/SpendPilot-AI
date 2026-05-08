import { z } from "zod";
import { AI_TOOLS, PLAN_TIERS, USE_CASES } from "@/types/audit";

// ─── Tool entry row ────────────────────────────────────────────────────────────

export const auditToolSchema = z.object({
  tool: z.enum(AI_TOOLS, {
    error: "Select a valid AI tool.",
  }),
  plan: z.enum(PLAN_TIERS, {
    error: "Select a billing plan.",
  }),
  monthlySpend: z
    .number({ error: "Enter a valid amount." })
    .min(0, "Spend cannot be negative.")
    .max(1_000_000, "Max $1,000,000 per tool."),
  seats: z
    .number({ error: "Enter a whole number." })
    .int("Seats must be a whole number.")
    .min(1, "At least 1 seat required.")
    .max(9_999, "Max 9,999 seats."),
});

// ─── Full audit form ───────────────────────────────────────────────────────────

export const auditFormSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters.")
    .max(80, "Company name must be 80 characters or fewer."),

  teamSize: z
    .number({ error: "Enter the number of people in your team." })
    .int("Team size must be a whole number.")
    .min(1, "Team size must be at least 1.")
    .max(100_000, "Max 100,000 team members."),

  primaryUseCase: z.enum(USE_CASES, {
    error: "Select a primary use case.",
  }),

  tools: z
    .array(auditToolSchema)
    .min(1, "Add at least one AI tool to audit.")
    .max(20, "You can audit up to 20 tools at once."),
});

export type AuditFormSchema = z.infer<typeof auditFormSchema>;
export type AuditToolSchema = z.infer<typeof auditToolSchema>;
