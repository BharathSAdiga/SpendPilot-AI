import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { getPublicAudit } from "@/lib/supabase/audits";
import { ClientFallback } from "./ClientFallback";
import { LiveReport, DemoReport } from "./components";
import type { AuditResult } from "@/types/auditEngine";

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── Metadata Generation ──────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  if (slug === "demo") {
    return {
      title: "AI Spend Audit | Demo Report",
      description: "See a sample SpendPilot AI cost optimization report.",
    };
  }

  try {
    const audit = await getPublicAudit(slug);
    if (!audit) return {};

    const result = audit.result_snapshot as unknown as AuditResult;
    const { overallScore, totalPotentialSavingsUsd } = result;
    const title = `AI Spend Audit Score: ${overallScore}/100`;
    const description = `We found $${totalPotentialSavingsUsd.toLocaleString()} in potential monthly savings for this AI stack. View the full SpendPilot analysis.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: "AI Spend Audit Report",
    };
  }
}

// ─── Main Server Component ────────────────────────────────────────────────────

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "demo") {
    return <DemoReport />;
  }

  // Next.js App Router Server Components cannot access sessionStorage.
  // We first try to fetch the report from the database.
  // If it's a fallback slug (e.g., timestamp Date.now() created by client on DB failure),
  // getPublicAudit will return null. We then render ClientFallback which reads sessionStorage.
  let auditRow = null;
  
  try {
    // Only attempt UUID fetch if it looks like a valid token format, or just let it fail gracefully
    auditRow = await getPublicAudit(slug);
  } catch (error) {
    // Expected to fail if slug is a timestamp or malformed
  }

  if (!auditRow) {
    return <ClientFallback slug={slug} />;
  }

  // Parse and strip identifying info for privacy on public shareable URL
  const result = auditRow.result_snapshot as unknown as AuditResult;
  
  // Create a deep clone to safely mutate
  const sanitizedResult: AuditResult = JSON.parse(JSON.stringify(result));
  
  // STRIP ALL IDENTIFYING INFO
  sanitizedResult.input.companyName = "Confidential Client";
  if (sanitizedResult.input.email) {
    delete sanitizedResult.input.email;
  }
  if (sanitizedResult.input.jobTitle) {
    delete sanitizedResult.input.jobTitle;
  }

  return <LiveReport result={sanitizedResult} isPublic={true} />;
}
