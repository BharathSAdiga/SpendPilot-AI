# Unit Economics — SpendPilot AI

> Financial model, CAC, LTV, and profitability analysis.

---

## Key Metrics Definitions

| Metric | Definition |
|--------|------------|
| **MRR** | Monthly Recurring Revenue |
| **ARR** | Annual Recurring Revenue (MRR × 12) |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Lifetime Value of a customer |
| **Churn** | % of customers lost per month |
| **LTV:CAC** | Health ratio; target > 3:1 |
| **Payback period** | Months to recoup CAC |

---

## Pricing Assumptions

| Tier       | Price/mo | Expected Mix |
|------------|----------|--------------|
| Free       | $0       | 60%          |
| Starter    | $49      | 30%          |
| Pro        | $149     | 8%           |
| Enterprise | $500+    | 2%           |

**Blended ARPU (paying customers):** ~$80/month

---

## CAC Estimates

| Channel           | Estimated CAC |
|-------------------|---------------|
| Product Hunt      | $0–$20        |
| SEO / Organic     | $20–$50       |
| LinkedIn outbound | $100–$200     |
| Paid ads          | $150–$300     |
| **Blended CAC**   | **~$75**      |

---

## LTV Model

| Input              | Value        |
|--------------------|--------------|
| ARPU               | $80/mo       |
| Monthly churn      | 3%           |
| Avg. customer life | 33 months    |
| **LTV**            | **~$2,640**  |

**LTV:CAC Ratio = 2,640 / 75 = ~35:1** ✅ (target is > 3:1)

---

## Cost Structure (Monthly, early stage)

| Cost Item                  | Estimated/mo |
|----------------------------|--------------|
| Vercel hosting             | $20          |
| Postgres (Supabase)        | $25          |
| OpenAI API                 | $50–$200     |
| Clerk (auth)               | $25          |
| Domain + email             | $10          |
| **Total infra**            | **~$130–$280** |

---

## Break-Even Analysis

| Scenario       | Customers Needed | MRR Required |
|----------------|------------------|--------------|
| Cover infra    | 4 paying users   | $280/mo      |
| Founder salary | ~88 paying users | $7,000/mo    |
| Series A target| ~1,250 users     | $100,000/mo  |

---

## Year 1 Revenue Model

| Month | New Customers | Churned | Total | MRR     |
|-------|--------------|---------|-------|---------|
| 1     | 5            | 0       | 5     | $400    |
| 3     | 15           | 1       | 24    | $1,920  |
| 6     | 20           | 2       | 72    | $5,760  |
| 9     | 25           | 3       | 138   | $11,040 |
| 12    | 30           | 4       | 200   | $16,000 |

---

## Notes

- Free-to-paid conversion target: **5–8%** (industry avg. for PLG tools)
- Annual billing should be offered at 20% discount to reduce churn
- Enterprise deals will significantly skew MRR once 1–2 close
