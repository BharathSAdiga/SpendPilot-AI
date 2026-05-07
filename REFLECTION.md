# Reflection — SpendPilot AI

> Honest retrospective on product, process, and decisions made during development.

---

## Purpose

This document is a space for candid reflection — what worked, what didn't, and what would be done differently with fresh perspective. Updated at meaningful milestones, not daily.

---

## Sprint 1 — Foundation (2026-05-07)

### What went well ✅

- **Project setup was fast.** Next.js 15 scaffold + Tailwind v4 with App Router was surprisingly frictionless.
- **Design system first approach paid off.** Building `globals.css` with design tokens before components ensured consistent aesthetics across all pages from day one.
- **Glassmorphism + dark theme.** The premium visual identity is cohesive and already looks production-grade — a strong foundation for marketing.
- **Conventional commits + GitHub.** Clean commit history from the start; easy to trace decisions.

### What was challenging ⚠️

- **Next.js 15 async params.** The change requiring `React.use(params)` in dynamic routes was a minor gotcha — not well-documented in community examples yet.
- **Tailwind v4 `@theme` vs config.** The shift from `tailwind.config.js` to `@theme` in CSS is powerful but the migration path and debugging is unfamiliar.
- **No backend yet.** All pages are currently using mock/static data. The gap between a beautiful UI and a functional product is still wide.

### What would be done differently 🔄

- **Start with a proper data model** before building UI. Pages built around mock data may need restructuring when real API shapes arrive.
- **Use shadcn/ui** from the start for accessible, pre-built components instead of hand-rolling button and card styles.
- **Add Storybook** early for design system isolation and visual regression testing.

---

## Open Questions

| Question                                            | Status     |
|-----------------------------------------------------|------------|
| Should we use Clerk or NextAuth for auth?           | Undecided  |
| Is the glassmorphism aesthetic sustainable at scale? | Undecided |
| Will enterprise customers accept CSV-only ingestion? | Undecided |
| Is the `report/[slug]` pattern the right abstraction? | Undecided |

---

## Lessons Worth Keeping

1. **Premium design is a forcing function.** Building with a high aesthetic bar from day one raises the quality bar for code quality too.
2. **Conventional commits are free structure.** No extra tooling — just better history, easier changelogs, and cleaner PRs.
3. **Shared layouts save time.** Investing in `RootLayout` with `Navbar` and `Footer` upfront meant zero duplication across pages.

---

_Updated: 2026-05-07_
