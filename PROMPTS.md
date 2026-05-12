# System Prompts & AI Strategy

## Active Prompts

### 1. The Executive Summary Prompt (v2)
**Used in:** `/api/summary/route.ts`
**Model:** `claude-haiku-4-5`

```text
You are an expert fractional CFO specializing in SaaS spend optimization.
Your task is to analyze a raw JSON audit of a company's software stack and return a strict JSON response containing an executive summary, top priority actions, and a future outlook.

Input metrics:
Company: {{companyName}}
Team Size: {{teamSize}}
Total Monthly Spend: ${{totalMonthlySpendUsd}}
Total Potential Savings: ${{totalPotentialSavingsUsd}}
Overall Score: {{overallScore}}/100

Guidelines:
- Tone: Professional, authoritative, and direct. No fluff.
- "executive": A 2-3 sentence high-level summary of their current efficiency.
- "topActions": Exactly 3 highly specific, immediately actionable bullet points based on the highest-saving findings.
- "outlook": A 1-2 sentence projection of their runway/efficiency if they implement the changes.

Output JSON strictly adhering to this schema:
{
  "executive": "string",
  "topActions": ["string", "string", "string"],
  "outlook": "string"
}
```

### Why this prompt works
- **Role Assignment:** Giving Claude the persona of a "fractional CFO" grounds the vocabulary in business reality rather than technical jargon.
- **Strict Data Binding:** We don't feed Claude the raw user input; we feed it the *calculated* output from our deterministic engine. Claude only handles the presentation layer.
- **Enforced JSON Schema:** By explicitly declaring the schema and the keys, we ensure Zod can parse the output with zero formatting errors.

## Failed Prompt Experiments

### Experiment 1: The "Do It All" Prompt
*Status: Failed (High Latency, Hallucinations)*
Initially, I passed the raw form input (Tools, plans, seats) directly into GPT-4o and asked it to "find the wasted spend."
**Result:** GPT-4o would hallucinate pricing. It assumed GitHub Copilot Pro was $19/mo instead of $10/mo, throwing off the savings calculations. It also took ~8 seconds to respond. 

### Experiment 2: The Markdown Table Prompt
*Status: Failed (Parsing fragility)*
I asked Claude to return a markdown table of findings.
**Result:** Parsing a markdown string to map to my React components was a nightmare. A single missing pipe `|` character would break the UI. Switching to strict JSON fixed this entirely.

## Fallback Strategy

If the Anthropic API goes down or the user hits a rate limit, the `/api/summary` route returns a 502 error. The frontend catches this and instantly renders a local, deterministic fallback UI.
Instead of a custom paragraph, it renders:
*"Your audit generated ${totalPotentialSavings} in potential savings. Review the structured findings below to optimize your stack."*
This ensures the user *always* receives value from the audit, even if the AI enhancement layer fails.
