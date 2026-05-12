# SpendPilot AI — Agent Instructions

This file contains the architectural rules, coding conventions, and context for any AI assistant working in this repository. Please read and adhere to these guidelines to maintain codebase consistency.

## Project Context
SpendPilot AI is a deterministic, rule-based SaaS spend audit engine designed to help engineering teams instantly discover wasted spend and consolidation opportunities. The primary value driver is the hardcoded TypeScript rule engine, *not* LLM generation. 

## Core Architectural Rules
1. **Deterministic Engine First:** The core audit engine (`lib/auditEngine.ts`) must remain 100% deterministic pure TypeScript functions. Do not use LLMs, API calls, or non-deterministic logic to calculate savings, find overlaps, or flag plan mismatches.
2. **LLMs for Presentation Only:** The Anthropic Claude API (`/api/summary/route.ts`) is exclusively used to generate a human-readable executive summary of the already-calculated JSON audit results. It does not perform the audit itself.
3. **Server-First Next.js:** Use React Server Components (RSCs) by default. Only use `"use client"` for interactive UI components (forms, charts, toggles) or hooks.
4. **Data Persistence:** All audit results and captured leads are stored in Supabase PostgreSQL. Never use generic ORMs like Prisma; rely on the `@supabase/supabase-js` client.

## Coding Style & Conventions

### TypeScript & React
- **Strict Typing:** Use explicit types and interfaces for all function signatures and data models. Avoid `any`.
- **Validation:** All incoming API payloads and form inputs must be strictly validated using `zod` before processing.
- **Component Structure:** Keep components small, modular, and functional. Colocate styles and sub-components when possible.
- **Error Handling:** Use early returns and throw explicit, descriptive errors. Do not swallow errors silently.

### Styling (Tailwind CSS v4)
- We use Tailwind CSS v4's native `@theme` API (configured in `app/globals.css`). There is no `tailwind.config.js`.
- Embrace glassmorphism and modern UI aesthetics: use `backdrop-blur`, subtle borders, and harmonious dark-mode palettes (`bg-gray-900`, `text-gray-100`).
- Ensure all interactive elements have hover/focus states and accessible ARIA attributes.

## Testing Guidelines
- **Vitest is our testing framework.** Do not use Jest.
- All utility functions, formatting helpers, and specifically the **audit rules** must have 100% unit test coverage.
- Use `describe`, `it`, and `expect`. For multiple test cases against a rule, use `it.each`.
- Place test files alongside their implementation or within the dedicated `tests/` directory as applicable.

## Git Workflow
- Write clear, concise, and descriptive commit messages following Conventional Commits (e.g., `feat: add new SSO-tax audit rule`, `fix: hydration error on report page`).
- Do not introduce massive, sweeping refactors across multiple domains in a single PR. Keep changes focused and scoped.
