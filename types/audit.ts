// ─── AI Tool Catalog ──────────────────────────────────────────────────────────

export const AI_TOOLS = [
  "Cursor",
  "Claude",
  "ChatGPT",
  "GitHub Copilot",
  "Gemini",
  "OpenAI API",
  "Anthropic API",
  "Windsurf",
] as const;

export type AiTool = (typeof AI_TOOLS)[number];

// ─── Plan Tier ────────────────────────────────────────────────────────────────
// Plan IDs are free-form strings that must match an entry in the pricing
// registry (e.g. "pro", "business", "team", "plus", "advanced").
// Validated at the API layer against PRICING_REGISTRY plan ids.
export type PlanTier = string;

// ─── Primary Use Cases ────────────────────────────────────────────────────────

export const USE_CASES = [
  "coding",
  "content",
  "research",
  "customer_support",
  "data_analysis",
  "design",
  "devops",
  "other",
] as const;

export type UseCase = (typeof USE_CASES)[number];

export const USE_CASE_LABELS: Record<UseCase, string> = {
  coding: "Coding & Engineering",
  content: "Content & Copywriting",
  research: "Research & Analysis",
  customer_support: "Customer Support",
  data_analysis: "Data Analysis",
  design: "Design & Creative",
  devops: "DevOps & Infrastructure",
  other: "Other",
};

// ─── Form Shape (mirrors Zod schema output) ───────────────────────────────────

export interface AuditToolEntry {
  tool: AiTool;
  plan: PlanTier;
  monthlySpend: number;
  seats: number;
}

export interface AuditFormValues {
  companyName: string;
  teamSize: number;
  primaryUseCase: UseCase;
  email?: string;
  jobTitle?: string;
  honeypot?: string;
  tools: AuditToolEntry[];
}

// ─── Summary helpers ──────────────────────────────────────────────────────────

export function totalMonthlySpend(tools: AuditToolEntry[]): number {
  return tools.reduce((sum, t) => sum + (t.monthlySpend ?? 0), 0);
}

export function totalSeats(tools: AuditToolEntry[]): number {
  return tools.reduce((sum, t) => sum + (t.seats ?? 0), 0);
}

export function spendPerHead(
  tools: AuditToolEntry[],
  teamSize: number
): number | null {
  if (!teamSize || teamSize <= 0) return null;
  return totalMonthlySpend(tools) / teamSize;
}
