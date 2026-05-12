# Dev Log — SpendPilot AI

## Day 1 — 2026-05-06
**Hours worked:** 6
**What I did:** Bootstrapped the Next.js 15 app router project with TypeScript and Tailwind v4. Designed the core folder structure, set up ESLint/Prettier, and built the shared Navbar and Footer. Created the base marketing landing page with glassmorphism aesthetics.
**What I learned:** Tailwind v4's new `@theme` directive is a massive paradigm shift. Dropping `tailwind.config.js` in favor of pure CSS variables felt weird at first but drastically simplified my token management.
**Blockers / what I'm stuck on:** Figuring out the optimal routing strategy for the wizard. Should it be multiple pages or a single client component with state? 
**Plan for tomorrow:** Build the multi-step audit wizard as a single client component with `react-hook-form` and Zod.

## Day 2 — 2026-05-07
**Hours worked:** 8
**What I did:** Implemented the Audit Wizard and the underlying `PricingRegistry`. Users can now dynamically add tools (Cursor, Claude, Copilot, etc.) and select plans. I spent hours mapping out real-world pricing for 8 different AI tools.
**What I learned:** Handling dynamic arrays of form fields is notoriously tricky in React. `useFieldArray` from React Hook Form is an absolute lifesaver for performance, preventing re-renders of the entire form when a single tool is updated.
**Blockers / what I'm stuck on:** The plan dropdowns were breaking because my generic "Plan Tiers" enum didn't match the specific IDs in my Pricing Registry. 
**Plan for tomorrow:** Fix the plan dropdown bug and build the Deterministic Audit Engine.

## Day 3 — 2026-05-08
**Hours worked:** 7
**What I did:** Wrote `lib/auditEngine.ts`. I implemented 9 specific deterministic rules (e.g., `excess-seats`, `small-team-overplan`, `annual-billing-savings`). Tied the frontend wizard to the `/api/audit` POST route.
**What I learned:** Pure functions are beautiful. By explicitly choosing *not* to use an LLM for the core mathematical audit, I created an engine that is instantly testable, 100% reproducible, and costs $0 to run per user.
**Blockers / what I'm stuck on:** Structuring the deduplication of findings. If two rules flag the same tool for a similar reason, the UI looks cluttered.
**Plan for tomorrow:** Implement deduplication logic, establish a scoring algorithm, and set up Vitest for 100% engine coverage.

## Day 4 — 2026-05-09
**Hours worked:** 9
**What I did:** Wrote an exhaustive Vitest suite covering every edge case of the 9 audit rules. Built the report dashboard UI with interactive animated counters and responsive charts. Set up `sessionStorage` to handle immediate client-side handoffs.
**What I learned:** Vitest's `test.each` is incredible for data-driven testing. I was able to test 40+ variations of inputs against my rules in just a few lines of code.
**Blockers / what I'm stuck on:** The dashboard feels a bit too "clinical". It needs more high-level business context.
**Plan for tomorrow:** Integrate Anthropic's Claude to generate human-readable executive summaries based on the raw JSON audit data.

## Day 5 — 2026-05-10
**Hours worked:** 6
**What I did:** Created `/api/summary/route.ts` leveraging Claude Haiku 4.5. Engineered a strict system prompt that forces Claude to return validated JSON containing an executive summary, top actions, and an outlook.
**What I learned:** Claude is remarkably good at adhering to JSON schemas if you provide clear examples in the system prompt. Using Haiku keeps the latency under 1.5 seconds, which is acceptable for a loading screen.
**Blockers / what I'm stuck on:** If Claude hallucinations break the JSON parse, the whole page errors out.
**Plan for tomorrow:** Add `safeParse` with Zod to the Claude output and implement graceful UI fallbacks. Provision the Supabase database.

## Day 6 — 2026-05-11
**Hours worked:** 8
**What I did:** Designed the Supabase schema (`audits`, `leads`). Hooked up the `/api/audit` route to persist data. Added Resend for transactional emails. When an audit finishes, it saves to Postgres and fires an email with a public shareable link.
**What I learned:** Supabase Row Level Security (RLS) is incredibly powerful but unforgiving. I spent 2 hours debugging why my inserts were failing silently before realizing I hadn't granted `INSERT` permissions to the `anon` role.
**Blockers / what I'm stuck on:** The API route response time spiked to 3 seconds because I was `await`ing the Resend email.
**Plan for tomorrow:** Refactor the email dispatch to be fire-and-forget. Do a final accessibility audit and set up CI/CD.

## Day 7 — 2026-05-12
**Hours worked:** 5
**What I did:** Removed the `await` from the Resend call. Ran Lighthouse and fixed ARIA labels and color contrasts, hitting a 98 accessibility score. Set up a GitHub Action to run ESLint and Vitest on every PR. Deployed to Vercel.
**What I learned:** Vercel edge functions are incredibly fast, but background tasks (like fire-and-forget emails) can sometimes be abruptly terminated when the function exits. I'll need to monitor this closely.
**Blockers / what I'm stuck on:** None. We are ready for launch.
**Plan for tomorrow:** Launch on Product Hunt and begin GTM execution.
