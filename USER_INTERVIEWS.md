# Customer Discovery: SpendPilot AI

> Structured notes from early customer discovery calls validating the core problem space for AI-driven spend optimization.

---

## Executive Summary

After speaking with 12 engineering leaders and founders, the core hypothesis is validated: **Nobody actually knows what they are paying for.** The transition from Seed to Series A is when SaaS sprawl becomes critical, yet procurement tools are too heavy for them. 

The biggest surprise was that users care more about *discovering inactive seats* than negotiating better plan pricing. They want immediate actionable items, not long-tail consulting projects.

---

## Interview 1: The "Shadow IT" Problem

**Role:** Head of Engineering  
**Company Stage:** Series A B2B SaaS (45 employees)  
**Duration:** 30 minutes (Zoom)

### Key Quotes
> *"I just found out we're still paying $400 a month for a staging environment on Heroku that we migrated away from 8 months ago. It just lived on a corporate card."*

> *"I don't want another dashboard. Just tell me what to cancel. Give me a hit list."*

### Surprising Insights
- The engineering team is using 4 different AI coding assistants (Copilot, Cursor, ChatGPT, Anthropic) because different developers expensed different tools. There is zero standardization.
- She actively avoids logging into AWS/GCP billing portals because "the UI makes me want to cry."

### Feature Implications & Product Changes
- **Change Inspired:** We must pivot the UI from "Here is your spend breakdown" to "Here is your Hit List of things to cancel today."
- **Implication:** The engine needs a specific rule to flag overlapping categories (e.g., flagging if both GitHub Copilot and Cursor are on the same audit).

---

## Interview 2: The "Over-Provisioned" Founder

**Role:** Founder & CEO  
**Company Stage:** Seed Stage DevTools (15 employees)  
**Duration:** 25 minutes (Google Meet)

### Key Quotes
> *"We're a team of 15, but somehow we have 22 active seats on our Notion Enterprise plan. I'm too scared to delete the extras in case they belong to contractors or integrations."*

> *"Honestly, if you could just read my credit card statement and tell me what's useless, I'd pay you $100 right now."*

### Surprising Insights
- The founder is doing all the financial ops themselves. They spend 2-3 hours at the end of every month reconciling Expensify and Ramp.
- They are over-provisioning seats because offboarding is a manual, messy process. When someone leaves, their email is disabled, but their SaaS seats remain active.

### Feature Implications & Product Changes
- **Change Inspired:** Added "Inactive Seat Detection" as a core messaging pillar. 
- **Implication:** We need a way to integrate directly with Google Workspace (SSO) to cross-reference active employee emails against provisioned SaaS seats. CSV upload alone won't solve the seat-matching problem.

---

## Interview 3: The "Tool Fatigue" Operator

**Role:** Director of Finance / RevOps  
**Company Stage:** Series B E-Commerce (110 employees)  
**Duration:** 45 minutes (Zoom)

### Key Quotes
> *"Our marketing team bought Jasper, our content team uses Copy.ai, and engineering uses OpenAI directly. We are paying for three different wrappers around the exact same model."*

> *"The problem isn't the $20/month subscription. The problem is that we have eighty of them."*

### Surprising Insights
- The finance team tries to enforce a "No new tools without approval" policy, but employees just use personal cards and expense it under "Software".
- They care heavily about consolidating tools to save on security/compliance headaches, not just the hard dollar cost.

### Feature Implications & Product Changes
- **Change Inspired:** The audit report (`/report/[slug]`) needs a "Consolidation Opportunities" section.
- **Implication:** The AI pricing registry must be smart enough to recognize that Jasper and Copy.ai serve the same underlying "Content Generation" use case, and recommend consolidating into a single Enterprise contract.

---

## Synthesis & Next Steps

1. **Build the "Hit List" UI:** The report page must prioritize high-confidence cancellations above the fold.
2. **Overlap Rules:** Immediately update `lib/auditRules.ts` to aggressively flag overlapping AI tools.
3. **Workspace Integration Roadmap:** CSV uploads are good for MVP, but Google Workspace API integration is required to solve the "Seat Mismatch" problem effectively.
