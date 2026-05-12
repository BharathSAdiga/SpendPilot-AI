# SpendPilot AI

> Deterministic SaaS spend audit and optimization engine for modern engineering teams.

SpendPilot AI is a high-performance, rule-based audit platform designed to instantly discover wasted SaaS spend, plan mismatches, and tool consolidation opportunities. By strictly analyzing subscription tiers and utilization metrics, it provides actionable right-sizing recommendations without manual spreadsheet crunching.

## Features
- **Deterministic Audit Engine**: 90+ custom rules analyzing overspending, underutilization, and feature overlap.
- **AI Executive Summaries**: Powered by Claude Haiku to distill technical audit data into C-level actionable insights.
- **Interactive Dashboards**: Glassmorphism UI with real-time dynamic savings counters and responsive typography.
- **Transactional Reports**: Automated post-audit email delivery via Resend.
- **Sharable Public Reports**: Secure, tokenized URLs for team sharing and collaboration.
- **Accessibility Hardened**: Fully keyboard navigable with a Lighthouse score of 95+.

## Live Demo
[https://spendpilot.ai](https://spendpilot.ai) *(Placeholder)*

## Screenshots

![Landing Page](/placeholders/landing-page.png)
*SpendPilot AI Landing Page*

![Audit Dashboard](/placeholders/audit-dashboard.png)
*Interactive Savings Dashboard*

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Native `@theme` API)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Anthropic SDK (Claude Haiku 4.5)
- **Email Delivery**: Resend
- **Testing**: Vitest
- **Deployment**: Vercel

## Architecture Summary
SpendPilot AI embraces a server-first architecture using React Server Components. The core value is derived from a deterministic TypeScript rule engine (`lib/auditEngine.ts`) that evaluates user inputs against a static Pricing Registry. Results are persisted to Supabase and fed into an Anthropic API route to generate an AI summary. The final report is delivered asynchronously via Resend and accessible via a public tokenized route.

## 5 Meaningful Engineering Decisions / Trade-Offs

1. **Deterministic Rule Engine over Pure LLM Analysis**: We chose to hardcode audit rules in TypeScript rather than feeding raw data to an LLM. *Trade-off*: Higher upfront development cost to map out rules, but it guarantees instant, reproducible, and zero-cost audits at runtime.
2. **Supabase over Prisma + PlanetScale**: We opted for Supabase for rapid iteration with its built-in PostgreSQL edge functions and RLS. *Trade-off*: Tighter vendor lock-in with Supabase's specific client SDKs, but significantly faster scaffolding for an MVP.
3. **Tailwind v4 `@theme` over `tailwind.config.js`**: We adopted the cutting-edge Tailwind v4 CSS-first approach. *Trade-off*: Less community documentation available, but it drastically simplified our styling architecture and reduced build times.
4. **Fire-and-Forget Email Dispatch**: Email sending via Resend is done asynchronously without `await` in the main API route. *Trade-off*: If the email fails, the user isn't immediately notified, but it prevents the Vercel edge function from timing out and ensures the user instantly sees the UI redirect.
5. **SessionStorage Fallback**: Client-side reports read from `sessionStorage` while DB persistence happens in the background. *Trade-off*: Reports can be lost if the DB fails and the tab is closed, but it ensures a perceived zero-latency transition to the report view.

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/BharathSAdiga/SpendPilot-AI.git
cd SpendPilot-AI

# 2. Install dependencies
npm ci

# 3. Setup environment variables
cp .env.example .env.local
# Add your NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY

# 4. Start the development server
npm run dev
```

## Deployment

This project is optimized for deployment on Vercel.

1. Push the code to a GitHub repository.
2. Import the project into Vercel.
3. Add the required Environment Variables in the Vercel dashboard.
4. Click **Deploy**. CI/CD is fully automated via GitHub Actions (`.github/workflows/ci.yml`).
