/**
 * lib/prompts/auditSummaryPrompt.ts
 *
 * Builds the structured system + user prompt pair for the Claude
 * audit-summary generation call.
 *
 * Kept in its own file so:
 *   - prompts can be iterated without touching API route logic
 *   - the prompt is unit-testable in isolation
 *   - token cost is easy to estimate before calling the API
 */

import type { SummaryRequest } from "@/types/aiSummary";

// ─── System prompt ────────────────────────────────────────────────────────────

export const AUDIT_SUMMARY_SYSTEM = `\
You are SpendPilot AI, an expert SaaS cost-optimisation analyst.
Your job is to read a structured AI spend audit and produce a concise, \
professional executive summary for the finance and engineering leadership team.

Tone: confident, data-driven, action-oriented. No fluff.
Format: respond ONLY with valid JSON matching this exact schema — no markdown fences, \
no commentary outside the JSON object:

{
  "executive": "<1–2 sentence overview — highlight total savings opportunity and score>",
  "topActions": [
    "<action 1 — start with a verb, include specific $ amount>",
    "<action 2>",
    "<action 3>"
  ],
  "outlook": "<1 sentence forward-looking statement about 90-day impact>"
}

Rules:
- Dollar amounts use $X,XXX format (no cents)
- topActions must contain exactly 3 items
- Each topAction is ≤ 20 words
- executive is ≤ 40 words
- outlook is ≤ 25 words
- Never mention company names in topActions
- Never say "please" or "you should"`;

// ─── User prompt builder ──────────────────────────────────────────────────────

export function buildAuditSummaryPrompt(req: SummaryRequest): string {
  const {
    companyName, teamSize, primaryUseCase,
    totalMonthlySpendUsd, totalPotentialSavingsUsd,
    totalAnnualSavingsUsd, savingsRatePct, overallScore,
    findingCounts, topFindings, byTimeline,
  } = req;

  const fmtUsd = (n: number) =>
    `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const findingLines = topFindings
    .map((f, i) =>
      `  ${i + 1}. [${f.action.replace(/_/g, " ")}] ${f.title} — save ${fmtUsd(f.monthlySavingUsd)}/mo`
    )
    .join("\n");

  return `\
AUDIT REPORT SUMMARY REQUEST
=============================
Company       : ${companyName}
Team size     : ${teamSize} people
Primary use   : ${primaryUseCase}

FINANCIAL OVERVIEW
------------------
Monthly spend         : ${fmtUsd(totalMonthlySpendUsd)}
Monthly savings opp.  : ${fmtUsd(totalPotentialSavingsUsd)} (${savingsRatePct.toFixed(0)}% of spend)
Annual savings opp.   : ${fmtUsd(totalAnnualSavingsUsd)}
Portfolio score       : ${overallScore}/100

FINDINGS BREAKDOWN
------------------
Critical : ${findingCounts.critical}
Warning  : ${findingCounts.warning}
Info     : ${findingCounts.info}
Total    : ${findingCounts.total}

IMPLEMENTATION TIMELINE
-----------------------
Immediate (<1 week)  : ${fmtUsd(byTimeline.immediate)}/mo
Short-term (1–4 wks) : ${fmtUsd(byTimeline.short_term)}/mo
Strategic (1–6 mo)   : ${fmtUsd(byTimeline.strategic)}/mo

TOP FINDINGS
------------
${findingLines}

Generate the JSON summary now.`;
}
