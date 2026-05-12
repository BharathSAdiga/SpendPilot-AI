/**
 * app/api/audit/route.ts
 *
 * POST /api/audit
 * Accepts validated AuditFormValues JSON, runs the audit engine,
 * and returns the AuditResult as JSON.
 */

import { NextRequest, NextResponse } from "next/server";
import { auditFormSchema } from "@/lib/auditSchema";
import { runAudit } from "@/lib/auditEngine";
import { insertAudit, setAuditPublic } from "@/lib/supabase/audits";
import { captureLead } from "@/lib/supabase/leads";
import { sendAuditReportEmail } from "@/lib/resend";

// Basic in-memory rate limit for production abuse protection
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;
const ipRequests = new Map<string, { count: number; expires: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  if (!record || record.expires < now) {
    ipRequests.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (record.count >= MAX_REQUESTS) return true;
  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = auditFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Honeypot spam protection
  if (parsed.data.honeypot) {
    // If bots fill in the hidden field, pretend it succeeded to deter them.
    return NextResponse.json({ result: null, public_token: "spam_detected" }, { status: 200 });
  }

  const result = runAudit(parsed.data);
  let public_token: string | undefined;
  let lead_id: string | null = null;

  try {
    // 1. Capture lead if email provided
    if (parsed.data.email) {
      const lead = await captureLead({
        email: parsed.data.email,
        companyName: parsed.data.companyName,
        jobTitle: parsed.data.jobTitle,
        source: "audit_form",
      });
      lead_id = lead.id;
    }

    // 2. Persist audit
    const row = await insertAudit(parsed.data, result, null, lead_id);
    await setAuditPublic(row.id, true);
    public_token = row.public_token;

    // 3. Send transactional email
    if (parsed.data.email && public_token) {
      const origin = req.headers.get("origin") || "https://spendpilot.ai";
      const reportUrl = `${origin}/report/${public_token}`;
      
      // Fire-and-forget
      sendAuditReportEmail({
        email: parsed.data.email,
        companyName: parsed.data.companyName,
        totalSavingsUsd: result.totalPotentialSavingsUsd,
        reportUrl,
        score: result.overallScore,
      }).catch(err => console.error("[resend] async error:", err));
    }
  } catch (error) {
    console.error("[audit] Failed to persist or send email:", error);
    // Return 500 but include the result so the frontend can fallback locally
    return NextResponse.json(
      { error: "Failed to persist audit to database.", result, public_token: undefined }, 
      { status: 500 }
    );
  }

  return NextResponse.json({ result, public_token }, { status: 200 });
}
