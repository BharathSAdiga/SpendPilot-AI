/**
 * lib/supabase/audits.ts
 *
 * Typed query helpers for the `audits` table.
 * All public-facing reads use the anon client (RLS enforced).
 * Writes from API routes use supabaseAdmin (service-role).
 */

import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import type { AuditResult }        from "@/types/auditEngine";
import type { AuditFormValues }    from "@/types/audit";
import type { AuditRow, AuditInsert, AuditUpdate } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Lightweight card shape for list views — avoids sending full JSONB blobs. */
export type AuditCard = Pick<
  AuditRow,
  | "id"
  | "public_token"
  | "is_public"
  | "company_name"
  | "team_size"
  | "primary_use_case"
  | "overall_score"
  | "total_monthly_spend_usd"
  | "total_potential_savings_usd"
  | "findings_critical_count"
  | "tools_audited_count"
  | "audited_at"
>;

// ─── Writes (service-role, from API routes only) ──────────────────────────────

/**
 * Persists a completed audit run to Supabase.
 * Called from app/api/audit/route.ts after runAudit() succeeds.
 *
 * @returns The inserted row (includes generated id and public_token).
 */
export async function insertAudit(
  input:  AuditFormValues,
  result: AuditResult,
  userId: string | null = null,
  leadId: string | null = null,
): Promise<AuditRow> {
  const admin = supabaseAdmin;
  if (!admin) throw new Error("[supabase] supabaseAdmin is not initialised — check SUPABASE_SERVICE_ROLE_KEY");

  const payload: AuditInsert = {
    user_id:                     userId,
    company_name:                input.companyName,
    team_size:                   input.teamSize,
    primary_use_case:            input.primaryUseCase as AuditRow["primary_use_case"],
    input_snapshot:              input  as unknown as Record<string, unknown>,
    result_snapshot:             result as unknown as Record<string, unknown>,
    overall_score:               result.overallScore,
    total_monthly_spend_usd:     result.totalMonthlySpendUsd,
    total_potential_savings_usd: result.totalPotentialSavingsUsd,
    findings_critical_count:     result.findingCounts.critical,
    findings_warning_count:      result.findingCounts.warning,
    findings_info_count:         result.findingCounts.info,
    tools_audited_count:         input.tools.length,
    engine_version:              "1.0.0",
    rules_evaluated:             result.rulesEvaluated,
    lead_id:                     leadId,
    is_public:                   false,
  };

  const { data, error } = await admin
    .from("audits")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`[supabase] insertAudit failed: ${error.message}`);
  return data;
}

/**
 * Makes an audit report publicly accessible (or revokes access).
 */
export async function setAuditPublic(
  auditId:  string,
  isPublic: boolean,
): Promise<void> {
  const admin = supabaseAdmin;
  if (!admin) throw new Error("[supabase] supabaseAdmin not initialised");

  const update: AuditUpdate = { is_public: isPublic };
  const { error } = await admin
    .from("audits")
    .update(update)
    .eq("id", auditId);

  if (error) throw new Error(`[supabase] setAuditPublic failed: ${error.message}`);
}

// ─── Reads ────────────────────────────────────────────────────────────────────

/**
 * Fetches a public report by its share token.
 * Uses the anon client — RLS policy "audits: public report read" allows this.
 */
export async function getPublicAudit(token: string): Promise<AuditRow | null> {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("public_token", token)
    .eq("is_public", true)
    .single();

  if (error?.code === "PGRST116") return null;          // not found
  if (error) throw new Error(`[supabase] getPublicAudit failed: ${error.message}`);
  return data;
}

/**
 * Fetches a single audit by ID (owner-scoped via RLS).
 */
export async function getAuditById(id: string): Promise<AuditRow | null> {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(`[supabase] getAuditById failed: ${error.message}`);
  return data;
}

/**
 * Lists the authenticated user's audits as lightweight cards.
 */
export async function listUserAudits(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<AuditCard[]> {
  const { data, error } = await supabase
    .from("audits")
    .select(`
      id, public_token, is_public, company_name, team_size,
      primary_use_case, overall_score, total_monthly_spend_usd,
      total_potential_savings_usd, findings_critical_count,
      tools_audited_count, audited_at
    `)
    .eq("user_id", userId)
    .order("audited_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`[supabase] listUserAudits failed: ${error.message}`);
  return (data ?? []) as AuditCard[];
}
