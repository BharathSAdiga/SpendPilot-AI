# Dev Log — SpendPilot AI

> Chronological record of technical decisions, experiments, and progress.

---

## Format

Each entry follows this structure:

```
## [YYYY-MM-DD] — Title

**Status:** In Progress | Completed | Blocked
**Focus:** Area of work

### What was done
### Decisions made
### Blockers / Open questions
### Next steps
```

---

## [2026-05-07] — Project Initialization

**Status:** Completed  
**Focus:** Scaffolding, routing, design system

### What was done
- Bootstrapped Next.js 15 project with TypeScript, Tailwind v4, and ESLint
- Created scalable folder structure: `app/`, `components/`, `lib/`, `types/`, `data/`, `tests/`
- Built shared `Navbar` and `Footer` layout components
- Implemented App Router pages: landing, `/audit`, `/report/[slug]`
- Designed premium dark mode theme system with CSS variables and glassmorphism utilities
- Connected to GitHub: `BharathSAdiga/SpendPilot-AI`

### Decisions made
- **Tailwind v4 `@theme`** over `tailwind.config.js` for native CSS-first token management
- **`prefers-color-scheme` media query** for dark mode to avoid JS-based class toggling
- **`React.use(params)`** for dynamic route params per Next.js 15 spec
- **Inter font** via `next/font/google` for premium, production-grade typography

### Open questions
- Auth strategy: Clerk vs NextAuth v5?
- Database: Supabase vs PlanetScale vs self-hosted Postgres?
- AI provider: OpenAI GPT-4o vs Anthropic Claude for spend classification?

### Next steps
- [ ] Add authentication (Clerk)
- [ ] Scaffold dashboard route with sidebar
- [ ] Design data model for Reports, Subscriptions, Users
- [ ] Implement CSV parser for spend data ingestion

---

## [2026-05-09] — Rule-Based Audit Engine (v1)

**Status:** Completed  
**Focus:** Audit engine, API route, live report rendering, form–registry alignment

### What was done
- Built `lib/auditRules.ts` — 9 deterministic audit rules across two scopes (per-tool, portfolio)
- Built `lib/auditEngine.ts` — orchestrates all rules into a structured `AuditResult` with score, savings, findings
- Created `app/api/audit/route.ts` — POST handler: validates input with Zod, runs engine, returns JSON
- Rewrote `app/report/[slug]/page.tsx` — client component reading real `AuditResult` from `sessionStorage`
- Updated `components/audit/AuditForm.tsx` — POSTs to `/api/audit`, stores result, auto-redirects to report
- Fixed `components/audit/ToolFieldArray.tsx` — plan dropdown is now **dynamic per tool** from `PRICING_REGISTRY`
- Fixed `types/audit.ts` + `lib/validation/primitives.ts` — replaced broken `PLAN_TIERS` enum with `string` type matching real plan IDs

### Root cause fixed
The original `PLAN_TIERS = ["free","starter","pro","business","enterprise","custom"]` was a generic list that never matched actual plan IDs in the pricing registry (`"plus"`, `"team"`, `"advanced"`, `"pay_as_you_go"`, etc.). This caused `findPricingEntry()` plan lookups to always miss, silently preventing all rules from firing. Now the form dropdown reads directly from `PRICING_REGISTRY[selectedTool].plans`, ensuring IDs are always valid.

### Rules implemented (9 total)

| Rule                      | Scope     | Fires when                                              |
|---------------------------|-----------|---------------------------------------------------------|
| `high-per-head-spend`     | portfolio | Spend > $100/person/month across all tools              |
| `overlapping-tools`       | portfolio | 2+ tools in same category (coding, chat, API platforms) |
| `small-team-overplan`     | per_tool  | < 20 seats on enterprise plan / < 5 on business plan   |
| `overspend-benchmark`     | per_tool  | Paying > 130% of list price for the selected plan       |
| `annual-billing-savings`  | per_tool  | Monthly billing when annual discount > $5/mo            |
| `excess-seats`            | per_tool  | Seats > 150% of team size with ≥ 3 excess               |
| `lightweight-overspend`   | per_tool  | API platform subscription for content/design teams      |
| `underutilized-plan`      | per_tool  | Actual spend < 40% of plan capacity with $15+ gap       |
| `free-plan-spend-mismatch`| per_tool  | Spend > $0 reported against a free plan                 |

### Decisions made
- **No LLM in the engine** — pure TypeScript rule functions. Instant, predictable, no per-audit cost.
- **`sessionStorage` for MVP state** — avoids DB dependency. Reports are per-session and cleared on tab close.
- **Score formula**: 100 – (25 × criticals) – (10 × warnings) – (3 × infos), clamped to [0, 100].
- **Deduplication**: findings are deduplicated by `id` (rule slug + tool id) before scoring.

### Next steps
- [ ] Add CSV bulk import (parse multi-row spend export)
- [ ] Add auth (Clerk) so reports persist to Postgres
- [ ] Add PDF export for the report page
- [ ] Expand pricing registry beyond 8 tools (Notion, Linear, Figma, etc.)
- [ ] Add test suite for all 9 rules with edge cases
