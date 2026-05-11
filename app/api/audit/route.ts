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

  try {
    const row = await insertAudit(parsed.data, result);
    // Make it public by default for the MVP so share links work
    await setAuditPublic(row.id, true);
    public_token = row.public_token;
  } catch (error) {
    console.error("[audit] Failed to persist to Supabase:", error);
    // Continue execution, client will fallback to local sessionStorage
  }

  return NextResponse.json({ result, public_token }, { status: 200 });
}
