-- =============================================================================
-- SpendPilot AI — Supabase Seed Data
-- =============================================================================
-- Use: supabase db reset   (runs migration + seed)
-- =============================================================================

-- ── Sample leads ──────────────────────────────────────────────────────────────
insert into public.leads (email, first_name, last_name, company_name, job_title, source, status, consented_marketing, consented_at)
values
  ('alice@acmecorp.io',   'Alice',   'Chen',    'ACME Corp',    'CTO',            'ProductHunt', 'qualified',  true,  now() - interval '7 days'),
  ('bob@devstudio.com',   'Bob',     'Müller',  'Dev Studio',   'Engineering Lead','organic',    'new',        true,  now() - interval '2 days'),
  ('carol@fintech.ai',    'Carol',   'Santos',  'FinTech AI',   'COO',            'twitter',     'contacted',  false, null)
on conflict (email) do nothing;

-- ── Sample anonymous audit (no user_id) ───────────────────────────────────────
insert into public.audits (
  company_name, team_size, primary_use_case,
  input_snapshot, result_snapshot,
  overall_score, total_monthly_spend_usd, total_potential_savings_usd,
  findings_critical_count, findings_warning_count, findings_info_count,
  tools_audited_count, is_public,
  engine_version, rules_evaluated
)
values (
  'ACME Corp', 10, 'coding',
  '{"companyName":"ACME Corp","teamSize":10,"primaryUseCase":"coding","tools":[{"tool":"Cursor","plan":"business","monthlySpend":400,"seats":10},{"tool":"GitHub Copilot","plan":"business","monthlySpend":190,"seats":10}]}'::jsonb,
  '{"overallScore":52,"totalMonthlySpendUsd":590,"totalPotentialSavingsUsd":190}'::jsonb,
  52, 590.00, 190.00,
  2, 1, 0,
  2, true,
  '1.0.0', ARRAY['overlapping-tools','overspend-benchmark','excess-seats']
);
