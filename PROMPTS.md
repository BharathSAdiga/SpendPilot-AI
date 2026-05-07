# Prompts — SpendPilot AI

> AI prompt library for spend classification, report generation, and user-facing suggestions.

---

## Overview

This document catalogs all AI prompts used in SpendPilot AI. Prompts are versioned and tagged by use case. Each prompt includes the model target, expected output schema, and last tested date.

---

## Prompt Categories

| Category             | Count | Description                                    |
|----------------------|-------|------------------------------------------------|
| Spend Classification | 3     | Tag and categorize line items from CSV         |
| Waste Detection      | 2     | Identify unused/redundant licenses             |
| Recommendations      | 2     | Generate cost-saving action items              |
| Report Summary       | 1     | Executive summary generation for reports       |
| User Onboarding      | 1     | Personalized first-run guidance                |

---

## Spend Classification

### `classify-spend-item` v1

**Model:** `gpt-4o`  
**Temperature:** 0.1  
**Last tested:** _TODO_

```
You are a SaaS spend analyst. Given a single line item from a company's expense report, classify it.

Return a JSON object with:
- vendor: string (vendor name, normalized)
- category: one of [communication, productivity, infrastructure, security, analytics, design, hr, finance, other]
- subcategory: string (e.g. "video conferencing", "cloud storage")
- is_saas: boolean
- confidence: number (0.0 to 1.0)

Line item: "{{LINE_ITEM}}"
```

**Expected output:**
```json
{
  "vendor": "Zoom",
  "category": "communication",
  "subcategory": "video conferencing",
  "is_saas": true,
  "confidence": 0.98
}
```

---

## Waste Detection

### `detect-unused-licenses` v1

**Model:** `gpt-4o`  
**Temperature:** 0.2  
**Last tested:** _TODO_

```
You are a SaaS optimization expert. Given a list of subscriptions with usage data, identify likely wasted spend.

For each subscription, flag if:
- Monthly active users < 60% of licensed seats
- Last login date > 60 days ago for any seat
- Duplicate tools exist in the same category

Subscriptions data: {{SUBSCRIPTIONS_JSON}}

Return a JSON array of waste alerts with:
- vendor: string
- waste_type: "unused_seats" | "duplicate_tool" | "stale_users"
- estimated_monthly_waste: number (USD)
- recommendation: string
```

---

## Report Summary

### `generate-report-summary` v1

**Model:** `gpt-4o`  
**Temperature:** 0.4  
**Last tested:** _TODO_

```
You are a financial analyst writing an executive summary for a SaaS spend audit.

Given this audit data:
- Total spend: {{TOTAL_SPEND}}
- Number of tools: {{TOOL_COUNT}}
- Wasted spend: {{WASTED_SPEND}}
- Top savings opportunity: {{TOP_OPPORTUNITY}}

Write a 2–3 sentence executive summary in plain business English. Be specific, confident, and action-oriented.
Do not use filler phrases like "In conclusion" or "It is worth noting."
```

---

## Prompt Versioning Policy

- Prompts are versioned (`v1`, `v2`, etc.) when output schema or behavior changes significantly
- Minor wording tweaks do not increment the version
- All production prompts are A/B tested before full rollout
- Prompt performance tracked by: classification accuracy, hallucination rate, latency

---

## Planned Prompts

| Prompt Name                   | Priority | Notes                              |
|-------------------------------|----------|------------------------------------|
| `suggest-vendor-alternatives` | High     | Suggest cheaper alternatives       |
| `forecast-annual-spend`       | Medium   | Project next 12 months from trends |
| `draft-renewal-negotiation`   | Low      | Draft renewal negotiation email    |
