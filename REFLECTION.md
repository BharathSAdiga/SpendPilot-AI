# Project Reflection

## 1. Hardest Bug and Debugging Journey
**The Silent `sessionStorage` Hydration Mismatch**
The hardest bug I encountered was a React hydration error on the `/report/:token` page. Because I was reading `sessionStorage` directly in the component body to instantly render the report, the server HTML (which obviously has no access to `sessionStorage`) didn't match the client HTML. The app would violently flash and drop CSS styles.

*The Journey:* First, I tried checking `if (typeof window !== 'undefined')`, but Next.js still complained about UI mismatches. Then, I tried putting the read inside a `useEffect`, but that introduced a jarring UI flicker where the page would load empty and then populate a split second later.
*The Solution:* I built a custom `useHydratedReport` hook that renders a beautiful, intentional "Analyzing..." skeleton loader until the component mounts and successfully parses the `sessionStorage`. It turned a technical bug into a premium UX feature.

## 2. Reversed Decision Mid-Project
**Ditching LLM-driven Audits for Deterministic Rules**
Initially, my plan was to take the user's form input, dump it into GPT-4o, and ask it to "find the wasted spend."
*Why I reversed it:* By day 2, I realized this was a terrible architectural decision. LLMs are non-deterministic, slow, and expensive. If a user ran the exact same audit twice, they might get two slightly different savings calculations, destroying trust. I scrapped the LLM approach entirely for the core engine, rewriting it as a suite of pure TypeScript functions. I relegated the LLM (Claude) *only* to the presentation layer—summarizing the hard math that the TypeScript engine had already perfectly calculated.

## 3. Week 2 Roadmap
If I had another week, I would focus entirely on **Data Ingestion and Auth**:
1. **CSV Uploads:** The manual form is great for 3-4 tools, but enterprise users have 50+. I need a robust CSV parser (using PapaParse) that can ingest a Brex or Ramp credit card statement, fuzzily match merchant names to my pricing registry, and auto-populate the audit.
2. **Clerk Authentication:** I'd lock the historical dashboard behind Clerk so CFOs can log in and see their spend drift over time.
3. **Weekly Slack Alerts:** Build a cron job via Inngest that pings a Slack channel when spending exceeds a predefined threshold.

## 4. AI Tools Used + Mistakes AI Made
I heavily utilized GitHub Copilot and an agentic assistant for scaffolding.
*The Good:* The AI was phenomenal at generating the boilerplate for my 9 Vitest test cases and mocking out the `PricingRegistry` data.
*The Mistake:* I asked the AI to write a complex Supabase RLS policy. It confidently generated a SQL snippet that looked perfect but had a subtle logic flaw allowing *any* authenticated user to update *any* report, not just their own. It took me a frustrating hour of manually testing edge cases to realize the `auth.uid() = user_id` check was in the wrong `USING` clause. AI is great at syntax, but dangerous with security logic.

## 5. Self-Ratings
- **Code Quality:** 8/10. The deterministic engine is pristine and well-tested. The Next.js frontend has a few prop-drilling smells in the Audit Wizard that I'd like to refactor into a Context provider.
- **Product Viability:** 9/10. SaaS bloat is a massive pain point. By making the MVP instant and visually stunning, it functions perfectly as a lead-generation magnet.
- **Velocity:** 10/10. Going from zero to a fully deployed, CI/CD-backed, database-connected application with AI integration in 7 days is something I'm incredibly proud of.
- **Design:** 8/10. The Tailwind v4 glassmorphism looks very premium, but mobile responsiveness on the complex Recharts graphs needs some fine-tuning.
