# Architecture — SpendPilot AI

> System design and technical decisions for the SpendPilot AI platform.

---

## Overview

SpendPilot AI is a full-stack SaaS platform built on the Next.js 15 App Router. It follows a **server-first** architecture, using React Server Components for data fetching and Client Components only where interactivity is needed.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                    │
│   Landing  │   Audit Wizard  │   Report Dashboard       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│               Next.js 15 App (Vercel Edge)              │
│                                                         │
│  app/layout.tsx   → Root Shell (Navbar + Footer)        │
│  app/page.tsx     → Landing (RSC)                       │
│  app/audit/       → Audit Input (Client + Server)       │
│  app/report/      → Report (RSC, dynamic slug)          │
│  app/api/         → Route Handlers (planned)            │
└───────────────┬──────────────────────────┬──────────────┘
                │                          │
     ┌──────────▼──────────┐   ┌───────────▼──────────┐
     │   Postgres (Prisma) │   │  AI Service (OpenAI) │
     │   Users, Reports,   │   │  Spend Classification │
     │   Subscriptions     │   │  Recommendations      │
     └─────────────────────┘   └──────────────────────┘
```

---

## Routing Architecture

| Route                  | Type   | Description                         |
|------------------------|--------|-------------------------------------|
| `/`                    | RSC    | Marketing landing page              |
| `/audit`               | Client | SSO connection & CSV upload wizard  |
| `/report/[slug]`       | RSC    | Dynamic per-team audit report       |
| `/api/audit`           | Route Handler | Trigger audit job (planned) |
| `/api/report/[id]`     | Route Handler | Fetch report data (planned) |

---

## Data Flow

```
User uploads CSV / connects SSO
       │
       ▼
API Route Handler validates input
       │
       ▼
Background job parses & classifies spend
       │
       ├── OpenAI → tag each line item (category, vendor, waste risk)
       │
       ▼
Report saved to Postgres
       │
       ▼
User redirected to /report/[slug]
       │
       ▼
RSC fetches report data server-side → streamed to browser
```

---

## Key Technical Decisions

### 1. Next.js App Router (RSC First)
Server Components are the default. Client Components (`"use client"`) are used only for interactive elements: forms, charts, modals.

### 2. Tailwind CSS v4 with `@theme`
Design tokens are defined in `globals.css` using Tailwind v4's native `@theme` directive — eliminating the need for `tailwind.config.js` and keeping tokens co-located with styles.

### 3. CSS Variables for Theming
All colors are CSS custom properties. Dark/light mode is handled via `@media (prefers-color-scheme: dark)` with no JavaScript or class toggling required.

### 4. Dynamic Reports via Slugs
Each audit report gets a unique slug (e.g., `acme-q2-2024`). The `app/report/[slug]` route fetches data server-side and streams the full report. The slug is resolved using `React.use(params)` per Next.js 15 conventions.

---

## Planned Integrations

| Integration     | Purpose                              | Status      |
|-----------------|--------------------------------------|-------------|
| Clerk           | Authentication & user management     | Planned     |
| Prisma + Postgres| Persistent data layer               | Planned     |
| OpenAI          | Spend classification & suggestions   | Planned     |
| Stripe          | Billing & subscription management    | Planned     |
| Google OAuth    | SSO workspace connection             | Planned     |
| Okta            | Enterprise SSO integration           | Planned     |
| AWS S3          | CSV file storage                     | Planned     |

---

## Performance Targets

| Metric            | Target    |
|-------------------|-----------|
| LCP (Landing)     | < 1.5s    |
| TTI               | < 2.0s    |
| Lighthouse Score  | > 95      |
| Core Web Vitals   | All Green |

---

## Security Considerations

- All API routes will require JWT authentication (Clerk)
- CSV uploads will be virus-scanned before parsing
- Sensitive spend data encrypted at rest
- Row-level security enforced in Postgres
- No PII stored in audit logs
