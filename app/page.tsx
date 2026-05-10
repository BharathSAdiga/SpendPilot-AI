import React from "react";
import Link from "next/link";
import { HeroSection } from "@/components/landing/HeroSection";

export const metadata = {
  title: "SpendPilot AI — Stop Overpaying for AI Tools",
  description:
    "Audit your entire AI subscription stack in minutes. Identify redundant tools, unused licenses, and recover thousands per month in wasted SaaS spend.",
};

export default function Home() {
  return (
    <div className="flex flex-col relative overflow-hidden">

      {/* ── Premium Hero ── */}
      <HeroSection />

      {/* ── Features section ── */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24 border-t border-border/40 max-w-[1100px]">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full"
            style={{
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              color: "#a78bfa",
            }}
          >
            Platform features
          </span>
          <h2 className="font-sans text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-foreground">
            Everything you need to cut AI spend
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Gain deep visibility into your software stack. Find redundant tools, unused licenses, and negotiation opportunities.
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-5 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {FEATURES.map(({ icon, title, body, accent }) => (
            <div
              key={title}
              className="glass-card p-6 flex flex-col gap-4 group hover:scale-[1.02] transition-transform cursor-default"
              style={{ borderColor: `${accent}20` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: `${accent}14`, color: accent }}
              >
                {icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24 border-t border-border/40 max-w-[1100px]">
        <div
          className="relative rounded-3xl overflow-hidden px-8 py-14 md:px-16 text-center flex flex-col items-center gap-6"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(16,185,129,0.08)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(139,92,246,0.08)" }}
          />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Find out how much you're wasting.
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
              Free audit. No credit card. Results in under 5 minutes.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center gap-3">
            <Link href="/audit" className="premium-btn-primary h-12 px-10 text-base rounded-xl">
              Start Free Audit →
            </Link>
            <Link href="/report/demo" className="premium-btn-secondary h-12 px-8 text-base rounded-xl">
              See Demo Report
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    accent: "#10b981",
    title: "Automated Discovery",
    body: "Find all shadow IT and unmanaged expenses instantly with intelligent scanning.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    accent: "#8b5cf6",
    title: "Usage Tracking",
    body: "Connect with your SSO to track actual seat utilization and active engagement.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
      </svg>
    ),
  },
  {
    accent: "#3b82f6",
    title: "Smart Alerts",
    body: "Get notified before renewals and when usage drops below expected thresholds.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    accent: "#f59e0b",
    title: "Savings Projections",
    body: "12-month roadmap showing exactly when and how much you'll recover with each action.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    accent: "#ef4444",
    title: "Overlap Detection",
    body: "Instantly surface duplicate tools doing the same job — consolidate and save immediately.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="5" /><circle cx="15" cy="15" r="5" />
      </svg>
    ),
  },
  {
    accent: "#06b6d4",
    title: "Per-seat Analysis",
    body: "Break down cost-per-head across every tool. Spot overprovisioned licenses instantly.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];
