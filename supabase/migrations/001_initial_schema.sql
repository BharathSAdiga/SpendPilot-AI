-- =============================================================================
-- SpendPilot AI — Supabase Schema Migration 001
-- =============================================================================
-- Tables:   audits, leads
-- Features: RLS, public report tokens, secure inserts, timestamps, indexes
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable UUID extension (idempotent)
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------------

create type finding_severity    as enum ('critical', 'warning', 'info');
create type finding_category    as enum (
  'overspend', 'overplan', 'underutilized', 'overlap',
  'alternative', 'annual_savings', 'seat_mismatch', 'consolidation'
);
create type recommendation_action as enum (
  'downgrade_plan', 'upgrade_plan', 'switch_tool',
  'switch_billing_cycle', 'reduce_seats', 'consolidate_tools',
  'remove_tool', 'monitor_usage', 'no_action'
);
create type primary_use_case as enum (
  'coding', 'content', 'research', 'customer_support',
  'data_analysis', 'design', 'devops', 'other'
);
create type lead_status as enum ('new', 'contacted', 'qualified', 'converted', 'churned');

-- =============================================================================
-- TABLE: audits
-- =============================================================================
-- Stores every audit run. Supports both authenticated users (user_id)
-- and anonymous public shares (public_token).
-- =============================================================================

create table if not exists public.audits (
  -- ── Identity ───────────────────────────────────────────────────────────────
  id                      uuid primary key default gen_random_uuid(),

  -- ── Ownership (nullable → anonymous audit) ────────────────────────────────
  user_id                 uuid references auth.users(id) on delete set null,

  -- ── Public sharing ────────────────────────────────────────────────────────
  -- A short random token for shareable, public report URLs (/report/<token>)
  public_token            text unique not null default encode(gen_random_bytes(12), 'hex'),
  is_public               boolean not null default false,

  -- ── Company context (from AuditFormValues) ────────────────────────────────
  company_name            text not null,
  team_size               integer not null check (team_size > 0),
  primary_use_case        primary_use_case not null,

  -- ── Raw input snapshot (the full AuditFormValues payload) ─────────────────
  -- Stored as JSONB so we can always replay the audit with the original input
  input_snapshot          jsonb not null,

  -- ── Engine output ─────────────────────────────────────────────────────────
  -- Full AuditResult stored as JSONB — allows schema-free evolution of the
  -- engine output without requiring migration for every rule change.
  result_snapshot         jsonb not null,

  -- ── Derived / indexed scalars (denormalised for fast queries) ─────────────
  overall_score           integer not null check (overall_score between 0 and 100),
  total_monthly_spend_usd numeric(10, 2) not null check (total_monthly_spend_usd >= 0),
  total_potential_savings_usd numeric(10, 2) not null check (total_potential_savings_usd >= 0),
  findings_critical_count integer not null default 0 check (findings_critical_count >= 0),
  findings_warning_count  integer not null default 0 check (findings_warning_count >= 0),
  findings_info_count     integer not null default 0 check (findings_info_count >= 0),
  tools_audited_count     integer not null default 0 check (tools_audited_count >= 0),

  -- ── Engine metadata ───────────────────────────────────────────────────────
  engine_version          text not null default '1.0.0',
  rules_evaluated         text[] not null default '{}',

  -- ── Lead linkage (optional, set if audit came via a lead capture) ─────────
  lead_id                 uuid,  -- FK added after leads table is created

  -- ── Timestamps ────────────────────────────────────────────────────────────
  audited_at              timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table  public.audits                          is 'Every SpendPilot AI audit run, authenticated or anonymous.';
comment on column public.audits.public_token             is 'Opaque token used in the shareable public report URL.';
comment on column public.audits.is_public                is 'When true, anyone with the public_token can view the report.';
comment on column public.audits.input_snapshot           is 'Full AuditFormValues JSON at time of submission — immutable audit trail.';
comment on column public.audits.result_snapshot          is 'Full AuditResult JSON produced by the audit engine — immutable audit trail.';
comment on column public.audits.overall_score            is 'Denormalised portfolio health score (0–100) for fast list queries.';

-- ---------------------------------------------------------------------------
-- Indexes — audits
-- ---------------------------------------------------------------------------
create index idx_audits_user_id        on public.audits (user_id);
create index idx_audits_public_token   on public.audits (public_token) where is_public = true;
create index idx_audits_lead_id        on public.audits (lead_id);
create index idx_audits_audited_at     on public.audits (audited_at desc);
create index idx_audits_overall_score  on public.audits (overall_score);
create index idx_audits_company_name   on public.audits using gin (to_tsvector('english', company_name));

-- ---------------------------------------------------------------------------
-- Auto-update updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_audits_updated_at
  before update on public.audits
  for each row execute function public.handle_updated_at();

-- =============================================================================
-- TABLE: leads
-- =============================================================================
-- Captures marketing leads who submitted their email before or after an audit.
-- Linked back to audits via lead_id / audits.lead_id.
-- =============================================================================

create table if not exists public.leads (
  -- ── Identity ───────────────────────────────────────────────────────────────
  id                      uuid primary key default gen_random_uuid(),

  -- ── Contact info ──────────────────────────────────────────────────────────
  email                   text not null,
  first_name              text,
  last_name               text,
  company_name            text,
  job_title               text,

  -- ── Source tracking ───────────────────────────────────────────────────────
  -- utm_* mirrors standard GA4 / campaign fields
  source                  text,                  -- e.g. "organic", "ProductHunt"
  medium                  text,                  -- e.g. "cpc", "email"
  campaign                text,
  referrer_url            text,

  -- ── CRM pipeline ─────────────────────────────────────────────────────────
  status                  lead_status not null default 'new',
  notes                   text,

  -- ── Optional auth linkage (set when lead creates an account) ─────────────
  user_id                 uuid references auth.users(id) on delete set null,

  -- ── Consent (GDPR / CAN-SPAM) ────────────────────────────────────────────
  consented_marketing     boolean not null default false,
  consented_at            timestamptz,

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table  public.leads                       is 'Marketing leads captured from the landing page or post-audit email gate.';
comment on column public.leads.email                 is 'Primary contact email — uniqueness enforced per source to allow re-entry on different campaigns.';
comment on column public.leads.consented_marketing   is 'GDPR / CAN-SPAM opt-in flag — must be true before sending marketing emails.';

-- ---------------------------------------------------------------------------
-- Constraint: unique email (allows upsert on conflict)
-- ---------------------------------------------------------------------------
alter table public.leads
  add constraint leads_email_unique unique (email);

-- ---------------------------------------------------------------------------
-- Indexes — leads
-- ---------------------------------------------------------------------------
create index idx_leads_email      on public.leads (email);
create index idx_leads_status     on public.leads (status);
create index idx_leads_user_id    on public.leads (user_id);
create index idx_leads_created_at on public.leads (created_at desc);
create index idx_leads_source     on public.leads (source);

-- ---------------------------------------------------------------------------
-- Auto-update trigger
-- ---------------------------------------------------------------------------
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Cross-table FK: audits.lead_id → leads.id
-- (Added after leads table exists)
-- ---------------------------------------------------------------------------
alter table public.audits
  add constraint fk_audits_lead_id
  foreign key (lead_id) references public.leads(id) on delete set null;

-- =============================================================================
-- ROW-LEVEL SECURITY
-- =============================================================================

-- ── audits ────────────────────────────────────────────────────────────────────
alter table public.audits enable row level security;

-- Authenticated owners can read / write their own rows
create policy "audits: owner read"
  on public.audits for select
  using (auth.uid() = user_id);

create policy "audits: owner update"
  on public.audits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "audits: owner delete"
  on public.audits for delete
  using (auth.uid() = user_id);

-- Anyone (incl. anon) can read a public report
create policy "audits: public report read"
  on public.audits for select
  using (is_public = true);

-- Service-role key used by the API route bypasses RLS — no public insert policy needed.
-- To allow anonymous inserts from the browser directly (alternative pattern), uncomment:
-- create policy "audits: anon insert"
--   on public.audits for insert
--   with check (true);

-- ── leads ─────────────────────────────────────────────────────────────────────
alter table public.leads enable row level security;

-- Only service-role can read leads (marketing data stays private)
-- Anon can insert their own email (lead capture form)
create policy "leads: anon insert"
  on public.leads for insert
  with check (true);

-- Authenticated users can see / edit their own lead record
create policy "leads: owner read"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "leads: owner update"
  on public.leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
