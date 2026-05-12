/**
 * types/database.ts
 *
 * Auto-derivable Supabase database types — generated shape matches
 * `supabase gen types typescript --local`.
 *
 * Keep in sync with supabase/migrations/001_initial_schema.sql.
 */

// ─── Enum mirrors ────────────────────────────────────────────────────────────

export type DbFindingSeverity    = "critical" | "warning" | "info";
export type DbFindingCategory    =
  | "overspend" | "overplan" | "underutilized" | "overlap"
  | "alternative" | "annual_savings" | "seat_mismatch" | "consolidation";
export type DbRecommendationAction =
  | "downgrade_plan" | "upgrade_plan" | "switch_tool"
  | "switch_billing_cycle" | "reduce_seats" | "consolidate_tools"
  | "remove_tool" | "monitor_usage" | "no_action";
export type DbPrimaryUseCase =
  | "coding" | "content" | "research" | "customer_support"
  | "data_analysis" | "design" | "devops" | "other";
export type DbLeadStatus = "new" | "contacted" | "qualified" | "converted" | "churned";

// ─── Row types (shape of a SELECT *) ────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface AuditRow {
  id:                          string;
  user_id:                     string | null;
  public_token:                string;
  is_public:                   boolean;
  company_name:                string;
  team_size:                   number;
  primary_use_case:            DbPrimaryUseCase;
  input_snapshot:              Json;  // AuditFormValues JSON
  result_snapshot:             Json;  // AuditResult JSON
  overall_score:               number;
  total_monthly_spend_usd:     number;
  total_potential_savings_usd: number;
  findings_critical_count:     number;
  findings_warning_count:      number;
  findings_info_count:         number;
  tools_audited_count:         number;
  engine_version:              string;
  rules_evaluated:             string[];
  lead_id:                     string | null;
  audited_at:                  string;
  created_at:                  string;
  updated_at:                  string;
}

export interface LeadRow {
  id:                   string;
  email:                string;
  first_name:           string | null;
  last_name:            string | null;
  company_name:         string | null;
  job_title:            string | null;
  source:               string | null;
  medium:               string | null;
  campaign:             string | null;
  referrer_url:         string | null;
  status:               DbLeadStatus;
  notes:                string | null;
  user_id:              string | null;
  consented_marketing:  boolean;
  consented_at:         string | null;
  created_at:           string;
  updated_at:           string;
}

// ─── Insert types (required fields only — DB fills the rest) ────────────────

export type AuditInsert = Omit<
  AuditRow,
  "id" | "public_token" | "audited_at" | "created_at" | "updated_at"
>;

export type LeadInsert = Pick<LeadRow, "email"> &
  Partial<Omit<LeadRow, "id" | "created_at" | "updated_at">>;

// ─── Update types ────────────────────────────────────────────────────────────

export type AuditUpdate = Partial<
  Pick<AuditRow, "is_public" | "lead_id">
>;

export type LeadUpdate = Partial<
  Pick<LeadRow, "status" | "notes" | "user_id" | "consented_marketing" | "consented_at" | "first_name" | "last_name" | "company_name" | "job_title">
>;

// ─── Supabase DB schema type (for createClient<Database>()) ──────────────────

export interface Database {
  public: {
    Tables: {
      audits: {
        Row:    AuditRow;
        Insert: AuditInsert;
        Update: AuditUpdate;
        Relationships: Record<string, unknown>[];
      };
      leads: {
        Row:    LeadRow;
        Insert: LeadInsert;
        Update: LeadUpdate;
        Relationships: Record<string, unknown>[];
      };
    };
    Enums: {
      finding_severity:     DbFindingSeverity;
      finding_category:     DbFindingCategory;
      recommendation_action: DbRecommendationAction;
      primary_use_case:     DbPrimaryUseCase;
      lead_status:          DbLeadStatus;
    };
  };
}
