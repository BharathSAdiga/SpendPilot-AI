# Metrics — SpendPilot AI

> KPI tracking framework, North Star metric, and analytics implementation plan.

---

## North Star Metric

> **Number of successful audits completed per week**

A "successful audit" = a user uploads data (CSV or SSO) and views a completed report.  
This captures real activation, not just signups.

---

## Metric Tiers

### L1 — Business Health (Weekly review)
| Metric                | Target (Month 3) | Target (Month 12) |
|-----------------------|------------------|-------------------|
| MRR                   | $1,000           | $15,000           |
| New signups/week      | 20               | 100               |
| Audits completed/week | 10               | 80                |
| Paying customers      | 15               | 150               |
| Monthly churn rate    | < 5%             | < 3%              |

### L2 — Product Engagement (Daily review)
| Metric                    | Description                                     |
|---------------------------|-------------------------------------------------|
| Activation rate           | % of signups who complete first audit           |
| Time to first audit       | Median minutes from signup to first report      |
| Report share rate         | % of reports exported or shared                 |
| Return visit rate (D7)    | % of users who return within 7 days             |
| Feature adoption: SSO     | % of paying users with SSO connected            |

### L3 — Marketing (Weekly review)
| Metric                | Description                              |
|-----------------------|------------------------------------------|
| Landing page CVR      | Visitors → signups                       |
| Trial → paid CVR      | Signed up → became paying                |
| CAC by channel        | Cost per acquired customer per channel   |
| Organic traffic/week  | SEO + referral visitors                  |

---

## Funnel

```
Website visitor
     ↓ (CVR target: 8–12%)
Signed up (free)
     ↓ (Activation target: 60%)
Completed first audit
     ↓ (Upgrade target: 10%)
Paying customer (Starter+)
     ↓ (Expansion target: 20%)
Upgraded to Pro
```

---

## Event Tracking Plan

All events tracked via PostHog (or Segment → PostHog).

| Event Name              | Trigger                              | Properties                     |
|-------------------------|--------------------------------------|--------------------------------|
| `page_viewed`           | Any page load                        | `path`, `referrer`             |
| `signup_started`        | Email entered on signup form         | `source`                       |
| `signup_completed`      | Account created                      | `plan`, `provider`             |
| `audit_started`         | Upload or SSO connect initiated      | `method: csv|sso`              |
| `audit_completed`       | Report successfully generated        | `tool_count`, `waste_detected` |
| `report_exported`       | PDF export clicked                   | `report_id`                    |
| `upgrade_clicked`       | Upgrade plan CTA clicked             | `from_plan`, `to_plan`         |
| `subscription_started`  | Payment completed                    | `plan`, `billing: monthly|annual` |
| `subscription_cancelled`| User cancelled plan                  | `plan`, `reason`               |

---

## Dashboard Tools

| Tool          | Purpose                              | Status   |
|---------------|--------------------------------------|----------|
| PostHog       | Product analytics & funnels          | Planned  |
| Stripe        | Revenue, MRR, churn dashboard        | Planned  |
| Vercel Analytics | Core Web Vitals, traffic          | Active   |
| Google Search Console | SEO & organic traffic        | Planned  |

---

## Reporting Cadence

| Cadence  | What's reviewed                          |
|----------|------------------------------------------|
| Daily    | Audit completions, signup count          |
| Weekly   | Full funnel, churn, MRR change           |
| Monthly  | LTV:CAC, cohort retention, NPS           |
| Quarterly| Roadmap reprioritization based on data   |
