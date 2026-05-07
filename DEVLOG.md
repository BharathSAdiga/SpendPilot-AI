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

## [YYYY-MM-DD] — _Next Entry_

**Status:** _Pending_  
**Focus:** _TBD_

### What was done
_TODO_

### Decisions made
_TODO_

### Blockers
_TODO_

### Next steps
_TODO_
