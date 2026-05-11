# Unit Economics & Financial Projections
**SpendPilot AI — Lead Generation & Monetization Engine**

This document models the realistic unit economics for SpendPilot AI functioning as a high-intent B2B lead generation tool. The primary monetization mechanism is capturing FinOps consulting engagements (high ACV) alongside a secondary self-serve SaaS tracking tier.

---

## 1. Core Revenue Assumptions

| Revenue Stream | Price / ACV | Gross Margin | Description |
| :--- | :--- | :--- | :--- |
| **FinOps Consulting** | $4,500 (one-off) | 85% | "Done-for-you" contract renegotiation and tool consolidation based on the audit. |
| **Premium SaaS Tier** | $99 / month | 95% | Automated monthly API tracking, alerts, and SSO integration for ongoing teams. |

---

## 2. The Conversion Funnel

Based on believable early-stage B2B SaaS benchmarks, here is the monthly funnel projection for an initial marketing budget.

**Monthly Traffic**: 2,000 Unique Visitors  
**Monthly Marketing Spend**: $2,000 (Blended: SEO, X/Twitter Ads, LinkedIn Outreach)

| Funnel Stage | Conversion Rate | Monthly Volume | Metric |
| :--- | :--- | :--- | :--- |
| **1. Site Visitors** | - | 2,000 | Traffic |
| **2. Audits Completed** | 12% | 240 | Qualified Leads (Emails Captured) |
| **3. Consultation Booked** | 8% of Leads | 19 | Strategy Calls |
| **4. Consulting Closed** | 25% of Calls | 4.8 | High-Ticket Deals |
| **5. SaaS Upgrades** | 5% of Leads | 12 | New SaaS Subscriptions |

---

## 3. Unit Economics & Lead Value

Using the funnel above, we can determine the fundamental unit economics of the business model.

* **Cost Per Lead (CPL)**: 
  * $2,000 Marketing Spend ÷ 240 Leads = **$8.33 / Lead**
* **Customer Acquisition Cost (CAC - Consulting)**: 
  * $2,000 ÷ 4.8 Deals = **$416 / Consulting Client**
* **Customer Acquisition Cost (CAC - SaaS)**:
  * $2,000 ÷ 12 Subs = **$166 / SaaS Client**
  * *(Note: Actual blended CAC is highly efficient because marketing spend drives both streams simultaneously).*

### Average Lead Value (ALV)
How much revenue does a single email capture generate on average?
* **Consulting Revenue**: 4.8 deals * $4,500 = $21,600
* **SaaS ARR Added**: 12 subs * $99 * 12 months = $14,256
* **Total Expected Value per Cohort**: $35,856
* **Lead Value**: $35,856 ÷ 240 Leads = **$149.40 per Lead**

> **Unit Economics Conclusion**: Exceptional. With a CPL of $8.33 and a Lead Value of $149.40, the **LTV:CAC ratio is roughly 18:1**, heavily subsidized by the high-margin consulting closures.

---

## 4. ARR & Growth Projections (Year 1)

Assuming a flat 15% month-over-month growth in traffic (due to the viral shareable `/report/[slug]` loop and SEO compounding), here is the 12-month outlook.

* *Month 1*: 240 leads → $21k Consulting + $1.1k MRR
* *Month 6*: 480 leads → $43k Consulting + $5.8k MRR
* *Month 12*: 1,100 leads → $99k Consulting + $18k MRR

**End of Year 1 Run Rate (ARR):**
* SaaS ARR: **$216,000**
* Consulting Revenue (Trailing 12m): **$650,000**
* **Total Annualized Revenue: ~$866,000**

---

## 5. Profitability Thresholds

**Fixed Monthly Costs (Lean Startup):**
* **Infrastructure**: Vercel ($20), Supabase ($25) = $45
* **AI APIs**: Anthropic Claude API (approx $0.05 per audit * 500) = $25
* **Tooling**: Resend, GitHub, Apollo = $130
* **Total Base OpEx**: **$200 / month**

**Break-Even Point:**
Because fixed costs are hyper-lean ($200/mo), the business is fundamentally profitable on the **very first consulting deal closed** ($4,500) or by acquiring just **3 Premium SaaS users** ($297/mo). Every additional dollar goes directly toward founder salaries and reinvestment into paid acquisition loops to accelerate the flywheel.
