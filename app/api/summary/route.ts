/**
 * app/api/summary/route.ts
 *
 * POST /api/summary
 *
 * Accepts a SummaryRequest, calls Claude (claude-3-5-haiku-20241022 by default)
 * and returns an AuditSummaryResult.
 *
 * Security:
 *  - ANTHROPIC_API_KEY is read server-side only (never sent to the client)
 *  - Input is validated with Zod before touching the model
 *  - Claude response is parsed and validated — malformed JSON is caught
 *  - Rate-limit friendly: uses the fastest/cheapest Haiku model
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import {
  AUDIT_SUMMARY_SYSTEM,
  buildAuditSummaryPrompt,
} from "@/lib/prompts/auditSummaryPrompt";
import type { SummaryApiResponse, AuditSummaryResult } from "@/types/aiSummary";

// ─── Model config ─────────────────────────────────────────────────────────────

const MODEL   = "claude-haiku-4-5";
const MAX_TOKENS = 512;

// ─── Input validation ─────────────────────────────────────────────────────────

const topFindingSchema = z.object({
  title:           z.string().max(200),
  action:          z.string().max(60),
  monthlySavingUsd: z.number().nonnegative(),
});

const summaryRequestSchema = z.object({
  companyName:             z.string().min(1).max(120),
  teamSize:                z.number().int().positive(),
  primaryUseCase:          z.string().min(1).max(80),
  totalMonthlySpendUsd:    z.number().nonnegative(),
  totalPotentialSavingsUsd: z.number().nonnegative(),
  totalAnnualSavingsUsd:   z.number().nonnegative(),
  savingsRatePct:          z.number().min(0).max(100),
  overallScore:            z.number().min(0).max(100),
  findingCounts: z.object({
    critical: z.number().int().nonnegative(),
    warning:  z.number().int().nonnegative(),
    info:     z.number().int().nonnegative(),
    total:    z.number().int().nonnegative(),
  }),
  topFindings: z.array(topFindingSchema).max(5),
  byTimeline: z.object({
    immediate:  z.number().nonnegative(),
    short_term: z.number().nonnegative(),
    strategic:  z.number().nonnegative(),
  }),
});

// ─── Claude response schema ───────────────────────────────────────────────────

const claudeOutputSchema = z.object({
  executive:  z.string().min(10).max(300),
  topActions: z.array(z.string().min(5).max(200)).length(3),
  outlook:    z.string().min(5).max(300),
});

// ─── Helper: safe JSON parse ──────────────────────────────────────────────────

function extractJson(raw: string): unknown {
  // Claude may wrap in markdown fences despite instructions — strip them
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<SummaryApiResponse>> {
  // 1. Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY is not configured", code: "missing_key" },
      { status: 503 }
    );
  }

  // 2. Parse + validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body", code: "bad_json" },
      { status: 400 }
    );
  }

  const parsed = summaryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", code: "invalid_input" },
      { status: 422 }
    );
  }

  // 3. Build prompt
  const userPrompt = buildAuditSummaryPrompt(parsed.data);

  // 4. Call Claude
  const client = new Anthropic({ apiKey });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     AUDIT_SUMMARY_SYSTEM,
      messages:   [{ role: "user", content: userPrompt }],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Anthropic API error";
    console.error("[/api/summary] Anthropic error:", msg);
    return NextResponse.json(
      { ok: false, error: msg, code: "anthropic_error" },
      { status: 502 }
    );
  }

  // 5. Extract text content
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { ok: false, error: "No text content in Claude response", code: "empty_response" },
      { status: 502 }
    );
  }

  // 6. Parse + validate Claude JSON output
  let claudeJson: unknown;
  try {
    claudeJson = extractJson(textBlock.text);
  } catch {
    console.error("[/api/summary] Claude returned non-JSON:", textBlock.text.slice(0, 200));
    return NextResponse.json(
      { ok: false, error: "Claude returned malformed JSON", code: "parse_error" },
      { status: 502 }
    );
  }

  const validated = claudeOutputSchema.safeParse(claudeJson);
  if (!validated.success) {
    console.error("[/api/summary] Claude JSON schema mismatch:", validated.error.flatten());
    return NextResponse.json(
      { ok: false, error: "Claude response did not match expected schema", code: "schema_mismatch" },
      { status: 502 }
    );
  }

  // 7. Build final response
  const result: AuditSummaryResult = {
    ...validated.data,
    generatedAt:  new Date().toISOString(),
    model:        message.model,
    inputTokens:  message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };

  return NextResponse.json({ ok: true, summary: result }, { status: 200 });
}
