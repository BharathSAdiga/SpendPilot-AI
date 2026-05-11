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

export async function POST(req: NextRequest) {
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

  const result = runAudit(parsed.data);
  let public_token: string | undefined;
  let lead_id: string | null = null;

  try {
    // 1. Capture lead if email provided
    if (parsed.data.email) {
      const lead = await captureLead({
        email: parsed.data.email,
        companyName: parsed.data.companyName,
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
      // Build absolute URL for the email
      const origin = req.headers.get("origin") || "https://spendpilot.ai";
      const reportUrl = `${origin}/report/${public_token}`;
      
      // Fire-and-forget: do not block the response
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
    // Continue execution, client will fallback to local sessionStorage
  }

  return NextResponse.json({ result, public_token }, { status: 200 });
}
