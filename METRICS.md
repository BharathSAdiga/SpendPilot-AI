# Product Metrics & Analytics

*Focus: SaaS metrics for product-led growth.*

## North Star Metric
**Total Wasted Spend Identified ($)**
This is the ultimate measure of the value we deliver. If SpendPilot AI is not consistently finding thousands of dollars in savings for our users, the core value proposition has failed. Tracking the cumulative dollar amount saved creates a compounding marketing narrative.

## 3 Input Metrics

1. **Audit Completion Rate (%)**
   - *What it is:* The percentage of users who start the `/audit` wizard and successfully submit the form.
   - *Why it matters:* If this drops below 60%, it means our form is too complex or requires data the user doesn't have on hand. It dictates the friction of our top-of-funnel.

2. **Lead Capture Conversion Rate (%)**
   - *What it is:* The percentage of users who complete the audit and provide their email to receive the persistent report.
   - *Why it matters:* This measures the perceived value of the initial free output. If they don't want the report emailed to them, our insights weren't compelling enough.

3. **High-Overlap Stack Percentage (%)**
   - *What it is:* The percentage of audited companies flagged for having 2+ tools in the same category (e.g., both ChatGPT and Claude).
   - *Why it matters:* This validates our core hypothesis about "shadow IT sprawl." If this number is high, our messaging about tool consolidation is perfectly aligned with market reality.

## Analytics Instrumentation
- **Vercel Web Analytics:** Used for privacy-first tracking of page views, unique visitors, and core web vitals (LCP, CLS) to ensure Lighthouse scores remain above 90.
- **PostHog (Planned):** Will be used for event-based tracking. Key events to instrument: `audit_started`, `tool_added`, `audit_completed`, `email_submitted`, `report_viewed`.

## Pivot Trigger Numbers
We must remain intellectually honest. If we hit the following numbers, we need to pivot the product or the GTM strategy:
- **Trigger 1:** After 500 audits, the average "Wasted Spend Identified" is < $100/mo. *(Meaning: Startups are actually very efficient, and the problem doesn't exist).*
- **Trigger 2:** The Lead Capture Conversion Rate stays < 5% after 1,000 visitors. *(Meaning: The product is interesting, but not painful enough to warrant giving up an email address).*
- **Trigger 3:** Zero demos booked after 50 lead capture emails. *(Meaning: The report is a "nice-to-have" novelty, but not a serious enough problem to pay for a B2B SaaS solution).*
