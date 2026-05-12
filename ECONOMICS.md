# Unit Economics & Financial Modeling

*Note: This model represents the pathway from a free lead-generation tool to a $1M ARR SaaS business.*

## Assumptions
- **Average Customer:** Series B Startup (150 employees).
- **Average Waste Identified:** $18,000 / year.
- **Pricing Model:** SpendPilot Pro charges a flat **$299/month** ($3,588/year) for continuous monitoring, SSO integrations, and automated seat de-provisioning.
- **Churn Rate:** 3% monthly (high, assuming some customers fix their spend and churn, but continuous API usage tracking aims to mitigate this).

## Converted Lead Value (LTV)
- Average Revenue Per Account (ARPA): $299/mo
- Gross Margin: 90% (Deterministic engine is cheap; main costs are Supabase and Anthropic summaries).
- Estimated Customer Lifespan: 33 months (1 / 0.03 churn).
- **Lifetime Value (LTV) = ~$8,800**

## CAC Assumptions
Because the primary acquisition channel is the free Audit Engine (Product-Led Growth), our Customer Acquisition Cost (CAC) is heavily skewed toward engineering time rather than paid ads.
- Paid Ads Blended CAC: $0 (Not utilizing paid ads initially).
- Content/SEO Blended CAC: ~$150 (Time spent writing tear-downs, hosting).
- **Target CAC: < $200 per paid conversion.**
- **LTV:CAC Ratio:** 44:1 (Extremely healthy, indicating room to scale paid acquisition later).

## Conversion Funnel
1. **Top of Funnel (Website Visitors):** 10,000 / month
2. **Activation (Run Free Audit):** 20% conversion = 2,000 audits.
3. **Lead Capture (Enter Email for Report):** 15% conversion = 300 qualified leads.
4. **Sales Qualified (Booked Demo):** 10% conversion = 30 demos.
5. **Closed Won (Paid Subscription):** 33% conversion = 10 new customers / month.

## Profitability Math (Per 100 Audits)
- **Revenue:** 100 audits -> 15 leads -> 1.5 demos -> 0.5 paid users = **$150/mo new MRR**.
- **Server Costs:** 
  - Vercel/Supabase: negligible base tier.
  - Anthropic Haiku: ~$0.002 per summary * 100 = $0.20.
  - Resend: 15 emails = $0.01.
- **Margin:** The free audit costs literally pennies to run at scale, making it the ultimate loss-leader.

## Path to $1M ARR
To reach $1,000,000 ARR, we need **278 active customers** paying $3,588/year.
Based on our funnel metrics:
- We need 10 new customers per month to offset churn and grow.
- This requires 30 demos/month.
- Which requires 300 captured leads.
- Which requires 2,000 completed audits.
- Which requires **10,000 unique visitors per month**.

If we can stabilize 10k highly-targeted technical visitors a month through SEO and engineering deep-dives, $1M ARR is a highly realistic mathematical outcome within 24-36 months.
