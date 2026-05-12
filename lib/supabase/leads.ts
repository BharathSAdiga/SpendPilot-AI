/* eslint-disable */
/**
 * lib/supabase/leads.ts
 *
 * Typed query helpers for the `leads` table.
 * Lead capture (insert) uses the anon client — RLS allows anon inserts.
 * Admin reads use supabaseAdmin.
 */

import { supabase, supabaseAdmin } from "@/lib/supabase/client";
import type { LeadRow, LeadInsert, LeadUpdate } from "@/types/database";

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Upserts a lead captured from the landing page or post-audit email gate.
 * Uses anon client — the RLS "leads: anon insert" policy permits this.
 * On email conflict, returns the existing row without error.
 *
 * @returns The upserted lead row.
 */
export async function captureLead(payload: {
  email:               string;
  firstName?:          string;
  lastName?:           string;
  companyName?:        string;
  jobTitle?:           string;
  source?:             string;
  consentedMarketing?: boolean;
}): Promise<LeadRow> {
  const admin = supabaseAdmin;
  if (!admin) throw new Error("[supabase] supabaseAdmin not initialised");

  const insert: LeadInsert = {
    email:                payload.email.toLowerCase().trim(),
    first_name:           payload.firstName    ?? null,
    last_name:            payload.lastName     ?? null,
    company_name:         payload.companyName  ?? null,
    job_title:            payload.jobTitle     ?? null,
    source:               payload.source       ?? null,
    consented_marketing:  payload.consentedMarketing ?? false,
    consented_at:         payload.consentedMarketing ? new Date().toISOString() : null,
    status:               "new",
  };

  const { data, error } = await admin
    .from("leads")
    .insert(insert as unknown as never)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation (email already exists)
      const existing: any = await admin.from("leads").select().eq("email", insert.email).single();
      if (existing.data) return existing.data as LeadRow;
    }
    throw new Error(`[supabase] captureLead failed: ${error.message}`);
  }
  return data;
}

/**
 * Links a lead to a Supabase auth user (called during sign-up flow).
 */
export async function linkLeadToUser(
  leadId: string,
  userId: string,
): Promise<void> {
  const admin = supabaseAdmin;
  if (!admin) throw new Error("[supabase] supabaseAdmin not initialised");

  const update: LeadUpdate = { user_id: userId };
  const { error } = await admin
    .from("leads")
    // @ts-expect-error Supabase types misinfer inside generic builder
    .update(update)
    .eq("id", leadId);

  if (error) throw new Error(`[supabase] linkLeadToUser failed: ${error.message}`);
}

/**
 * Updates a lead's CRM status (service-role only).
 */
export async function updateLeadStatus(
  leadId: string,
  status: LeadRow["status"],
  notes?: string,
): Promise<void> {
  const admin = supabaseAdmin;
  if (!admin) throw new Error("[supabase] supabaseAdmin not initialised");

  const update: LeadUpdate = { status, ...(notes ? { notes } : {}) };
  const { error } = await admin
    .from("leads")
    // @ts-expect-error Supabase types misinfer inside generic builder
    .update(update)
    .eq("id", leadId);

  if (error) throw new Error(`[supabase] updateLeadStatus failed: ${error.message}`);
}

// ─── Reads (admin only) ───────────────────────────────────────────────────────

/**
 * Looks up a lead by email. Returns null if not found.
 */
export async function getLeadByEmail(email: string): Promise<LeadRow | null> {
  const admin = supabaseAdmin;
  if (!admin) throw new Error("[supabase] supabaseAdmin not initialised");

  const { data, error } = await admin
    .from("leads")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(`[supabase] getLeadByEmail failed: ${error.message}`);
  return data;
}
