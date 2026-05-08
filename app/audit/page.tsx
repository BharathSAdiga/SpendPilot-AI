import React from "react";
import { AuditForm } from "@/components/audit";
import type { AuditFormValues } from "@/types/audit";

// ─── Server action stub — swap for real API call / server action ──────────────
async function submitAudit(data: AuditFormValues): Promise<void> {
  "use server";
  // TODO: persist to DB / call API
  console.log("[AuditPage] Submitted audit:", JSON.stringify(data, null, 2));
}

export const metadata = {
  title: "Run Spend Audit — SpendPilot AI",
  description:
    "Audit your team's AI tool subscriptions and uncover wasted spend in minutes.",
};

export default function AuditPage() {
  return (
    <main className="container mx-auto px-4 py-10 md:py-16 max-w-[860px]">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 text-center md:text-left mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Run Spend Audit
        </h1>
        <p className="text-muted-foreground text-lg max-w-[600px] md:mx-0 mx-auto">
          Add every AI tool your team subscribes to and get an instant breakdown
          of spend, utilisation, and optimisation opportunities.
        </p>
      </div>

      {/* ── Dynamic audit form ── */}
      <AuditForm onSubmit={submitAudit} />
    </main>
  );
}
