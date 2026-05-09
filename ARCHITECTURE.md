# Architecture — SpendPilot AI

> System design and technical decisions for the SpendPilot AI platform.

---

## Overview

SpendPilot AI is a full-stack SaaS platform built on the Next.js 16 App Router. It follows a **server-first** architecture, using React Server Components for data fetching and Client Components only where interactivity is needed.

The core value driver is a **deterministic, rule-based audit engine** (`lib/auditEngine.ts`) that analyses SaaS subscriptions for overspending, plan mismatches, tool overlaps, and optimization opportunities — without any LLM dependency, making it instant and predictable.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                    │
│   Landing  │   Audit Wizard  │   Report Dashboard       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS POST /api/audit
┌────────────────────────▼────────────────────────────────┐
│               Next.js 16 App (Vercel Edge)              │
│                                                         │
│  app/layout.tsx         → Root Shell (Navbar + Footer)  │
│  app/page.tsx           → Landing (RSC)                 │
│  app/audit/             → Audit Input (Client)          │
│  app/report/[slug]/     → Report (Client, sessionStorage)│
│  app/api/audit/route.ts → POST handler (Route Handler)  │
└───────────────┬──────────────────────────┬──────────────┘
                │                          │
     ┌──────────▼──────────┐   ┌───────────▼──────────┐
     │   Audit Engine      │   │  Pricing Registry    │
     │   lib/auditEngine   │   │  data/pricingConfig  │
     │   lib/auditRules    │   │  8 tools, real plans │
     └─────────────────────┘   └──────────────────────┘
```

---

## Routing Architecture

| Route                  | Type          | Description                              |
|------------------------|---------------|------------------------------------------|
| `/`                    | RSC           | Marketing landing page                   |
| `/audit`               | Client        | Multi-tool spend input wizard            |
| `/report/[slug]`       | Client        | Live audit report (reads sessionStorage) |
| `/api/audit`           | Route Handler | POST → validate → runAudit() → JSON      |

---

## Audit Engine Data Flow

```
User fills AuditForm (company, team size, use case, N tools + plans)
       │
       ▼ POST /api/audit (JSON body)
API Route Handler
       │
       ├── Zod validation (auditFormSchema)
       │
       ▼ runAudit(validatedInput)
lib/auditEngine.ts
       │
       ├── Per-tool rules (run once per tool entry)
       │     ├── small-team-overplan
       │     ├── overspend-benchmark
       │     ├── annual-billing-savings
       │     ├── excess-seats
       │     ├── lightweight-overspend
       │     ├── underutilized-plan        ← NEW
       │     └── free-plan-spend-mismatch
       │
       └── Portfolio rules (run once across all tools)
             ├── high-per-head-spend
             └── overlapping-tools
       │
       ▼ AuditResult (JSON)
Client stores in sessionStorage → redirects to /report/[id]
       │
       ▼
Report page reads sessionStorage → renders score, findings, savings
```

---

## Audit Engine — Rule Catalogue (v1)

| Rule ID                   | Scope     | Category        | Description                                              |
|---------------------------|-----------|-----------------|----------------------------------------------------------|
| `high-per-head-spend`     | portfolio | overspend        | Total AI spend > $100/person/month                       |
| `overlapping-tools`       | portfolio | overlap          | 2+ tools in the same function group (coding, chat, API)  |
| `small-team-overplan`     | per_tool  | overplan         | Team < 20 seats on enterprise plan                       |
| `overspend-benchmark`     | per_tool  | overspend        | Paying >30% above list price                             |
| `annual-billing-savings`  | per_tool  | annual_savings   | Monthly billing when annual would save >$5/mo            |
| `excess-seats`            | per_tool  | seat_mismatch    | Seats > 150% of team size                                |
| `lightweight-overspend`   | per_tool  | alternative      | API platform for content/design workflows                |
| `underutilized-plan`      | per_tool  | underutilized    | Actual spend < 40% of plan's expected spend              |
| `free-plan-spend-mismatch`| per_tool  | overspend        | Spend reported on a free plan                            |

---

## Pricing Registry

Centralised in `data/pricingConfig.ts`. 8 tools supported:

| Tool           | Category          | Plans                                          |
|----------------|-------------------|------------------------------------------------|
| Cursor         | coding_assistant  | Hobby (free), Pro ($20), Business ($40)        |
| Claude         | chat_assistant    | Free, Pro ($20), Team ($25), Enterprise        |
| ChatGPT        | chat_assistant    | Free, Plus ($20), Pro ($200), Team ($30)       |
| Gemini         | multimodal        | Free, Advanced ($19.99), Workspace Business    |
| GitHub Copilot | coding_assistant  | Free, Pro ($10), Business ($19), Enterprise ($39)|
| Anthropic API  | api_platform      | Pay-as-you-go, Build, Scale (custom)           |
| OpenAI API     | api_platform      | Pay-as-you-go, Committed Usage (custom)        |
| Windsurf       | agentic           | Free, Pro ($15), Teams ($35), Enterprise       |

---

## Key Technical Decisions

### 1. Deterministic Engine (No LLM)
Rules are pure TypeScript functions — no API calls, no latency, no cost per audit. Results are reproducible and explainable. LLM classification can be layered on top later for custom/unknown tools.

### 2. Dynamic Plan Dropdown
The form's Plan field reads directly from `PRICING_REGISTRY` based on the selected tool. This ensures plan IDs in form submissions always match registry entries, making rule evaluation accurate.

### 3. sessionStorage for Report State
Audit results are stored in `sessionStorage` keyed by timestamp. This is intentionally stateless for the MVP (no DB dependency), with Postgres persistence planned for authenticated users.

### 4. Next.js App Router (RSC First)
Server Components are the default. Client Components (`"use client"`) are used only for interactive elements: forms, charts, report rendering.

### 5. Tailwind CSS v4 with `@theme`
Design tokens are defined in `globals.css` using Tailwind v4's native `@theme` directive — eliminating the need for `tailwind.config.js`.

---

## Planned Integrations

| Integration       | Purpose                              | Status      |
|-------------------|--------------------------------------|-------------|
| Clerk             | Authentication & user management     | Planned     |
| Prisma + Postgres | Persistent report & user data layer  | Planned     |
| Stripe            | Billing & subscription management    | Planned     |
| Google OAuth      | SSO workspace connection             | Planned     |
| AWS S3            | CSV file storage for bulk import     | Planned     |

---

## Performance Targets

| Metric            | Target    |
|-------------------|-----------| 
| Audit API latency | < 50ms    |
| LCP (Landing)     | < 1.5s    |
| Lighthouse Score  | > 95      |
| Core Web Vitals   | All Green |

---

## Security Considerations

- All API routes will require JWT authentication (Clerk)
- CSV uploads will be virus-scanned before parsing
- Sensitive spend data encrypted at rest
- Row-level security enforced in Postgres
- No PII stored in audit logs
