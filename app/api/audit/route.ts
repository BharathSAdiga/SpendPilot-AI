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

  return NextResponse.json(result, { status: 200 });
}
