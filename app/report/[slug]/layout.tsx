import { Metadata } from "next";
import { getPublicAudit } from "@/lib/supabase/audits";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "demo") {
    return {
      title: "SpendPilot Demo Report",
      description: "View an example of a SpendPilot AI SaaS audit report.",
    };
  }

  try {
    const audit = await getPublicAudit(slug);
    
    if (!audit) {
      return {
        title: "Report Not Found | SpendPilot AI",
        description: "The requested audit report could not be found.",
      };
    }

    return {
      title: `SpendPilot Report: ${audit.company_name}`,
      description: `View the AI-powered SaaS spend audit for ${audit.company_name}. Potential savings: $${audit.total_potential_savings_usd}/mo.`,
      openGraph: {
        title: `SpendPilot Report: ${audit.company_name}`,
        description: `View the AI-powered SaaS spend audit for ${audit.company_name}. Potential savings: $${audit.total_potential_savings_usd}/mo.`,
      },
      twitter: {
        card: "summary_large_image",
        title: `SpendPilot Report: ${audit.company_name}`,
        description: `View the AI-powered SaaS spend audit for ${audit.company_name}. Potential savings: $${audit.total_potential_savings_usd}/mo.`,
      },
    };
  } catch (error) {
    return {
      title: "SpendPilot Report",
      description: "View your AI-powered SaaS spend audit.",
    };
  }
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
