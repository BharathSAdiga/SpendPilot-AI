# User Interview Summaries

*Note: Placeholder structure for early customer discovery calls.*

## Interview 1: "The Spreadsheet Nightmare"
- **Initials:** J.D.
- **Role:** VP of Engineering
- **Company Stage:** Series B (120 employees)

**Direct Quotes:**
- *"I literally spent 4 hours last Friday cross-referencing our GitHub org against our HR system to figure out who actually needed a Copilot license."*
- *"We bought ChatGPT Enterprise seats for the whole company, but I'm pretty sure sales is just using it to write emails once a week. It's a massive waste."*
- *"If you could just connect to our Okta and tell me who hasn't logged into Cursor in 30 days, I'd pay you right now."*

**Surprising Insight:**
The pain isn't just the money; it's the *compliance and offboarding*. When employees leave, their SaaS seats often remain active for months because engineering doesn't talk to finance.

**Product Changes Made:**
Added the `excess-seats` rule to the deterministic engine to specifically highlight the gap between stated team size and billed seats.

---

## Interview 2: "The Shadow IT Sprawl"
- **Initials:** S.K.
- **Role:** Fractional CFO
- **Company Stage:** Seed to Series A (Portfolio)

**Direct Quotes:**
- *"Engineers just expense whatever AI tool they want. We have AWS Bedrock, Anthropic API, and OpenAI API all hitting the same corporate card."*
- *"I don't know what 'Windsurf' is, but we're paying $35/mo for 10 people to use it."*
- *"My ideal tool gives me ammunition. I need hard data to go back to the CTO and say 'We are standardizing on one platform'."*

**Surprising Insight:**
CFOs don't understand the technical differences between Claude and ChatGPT, nor do they care. They view them purely as overlapping categories. 

**Product Changes Made:**
Created the `overlapping-tools` portfolio rule. The engine now groups tools into categories (e.g., `chat_assistant`, `coding_assistant`) and aggressively flags when a company pays for multiple tools in the exact same category.

---

## Interview 3: "The Plan Mismatch"
- **Initials:** A.R.
- **Role:** Head of Platform
- **Company Stage:** Series A (45 employees)

**Direct Quotes:**
- *"We are on the Enterprise plan for [Tool X] purely because we needed SSO. The actual features we don't even use."*
- *"I know we're overpaying, but negotiating with sales reps takes too much time. I'd rather just pay the list price and get back to building."*
- *"I don't want another dashboard. Just email me a PDF once a month telling me what to cancel."*

**Surprising Insight:**
Many startups accept the "SSO Tax" as a cost of doing business, but they are entirely blind to annual vs. monthly billing optimization, which requires zero negotiation to fix.

**Product Changes Made:**
Implemented the `annual-billing-savings` rule. It specifically calculates the exact dollar amount a company would save by simply clicking the "Switch to Annual" button in their billing portals, offering an immediate, frictionless win.
