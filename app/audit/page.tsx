import React from "react";
import { AuditForm } from "@/components/audit";

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

      {/* ── Form POSTs to /api/audit, stores result, redirects to live report ── */}
      <AuditForm />
    </main>
  );
}
