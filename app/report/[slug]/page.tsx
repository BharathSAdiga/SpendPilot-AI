"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditResult } from "@/types/auditEngine";
import { SavingsProjectionPanel } from "@/components/report/SavingsProjection";
import { SavingsHero } from "@/components/report/SavingsHero";
import { RecommendationList } from "@/components/report/RecommendationCard";
import { SpendCharts } from "@/components/report/SpendCharts";
import { AuditSummaryPanel } from "@/components/report/AuditSummaryPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}



// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const colour =
    score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} stroke="#ffffff10" strokeWidth="10" fill="none" />
        <circle
          cx="56" cy="56" r={r}
          stroke={colour} strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <span
        className="absolute text-2xl font-bold tabular-nums"
        style={{ color: colour }}
      >
        {score}
      </span>
    </div>
  );
}

// FindingCard replaced by RecommendationCard — see components/report/RecommendationCard.tsx

// ─── Loading / Error states ───────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`glass-card p-6 flex flex-col gap-3 relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="h-4 w-24 bg-[var(--border)] rounded animate-pulse" />
      <div className="h-10 w-32 bg-[var(--border)] rounded animate-pulse mt-2" />
      <div className="h-3 w-48 bg-[var(--border)] rounded animate-pulse mt-2" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1200px] animate-in fade-in duration-500">
      <div className="flex flex-col gap-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="flex flex-col gap-3 w-full md:w-1/2">
            <div className="h-10 w-3/4 max-w-[400px] bg-[var(--border)] rounded-lg animate-pulse" />
            <div className="h-4 w-1/2 max-w-[250px] bg-[var(--border)] rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-[var(--border)] rounded-lg animate-pulse" />
        </div>

        {/* AI Summary Panel Skeleton */}
        <div className="glass-card p-6 border-l-4 border-[var(--border)] relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-full bg-[var(--border)] shrink-0 animate-pulse" />
             <div className="w-full flex flex-col gap-3 pt-1">
               <div className="h-5 w-48 bg-[var(--border)] rounded animate-pulse" />
               <div className="h-4 w-full bg-[var(--border)] rounded animate-pulse" />
               <div className="h-4 w-5/6 bg-[var(--border)] rounded animate-pulse" />
               <div className="h-4 w-2/3 bg-[var(--border)] rounded animate-pulse" />
             </div>
          </div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="w-28 h-28 rounded-full bg-[var(--border)] animate-pulse" />
            <div className="h-4 w-24 bg-[var(--border)] rounded animate-pulse mt-2" />
          </div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
           <div className="md:col-span-2 glass-card h-[400px] bg-[var(--border)]/50 animate-pulse relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
           </div>
           <div className="glass-card h-[400px] bg-[var(--border)]/50 animate-pulse relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
           </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <div className="container mx-auto px-4 py-16 md:py-32 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-700">
      <div className="relative w-48 h-48 mb-8 flex items-center justify-center group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700 animate-pulse" />
        <div className="absolute inset-0 bg-secondary/80 rounded-full border border-border/50 backdrop-blur-sm" />
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground relative z-10 drop-shadow-lg">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div className="text-center max-w-lg relative z-10 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Report Unavailable</h2>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          We couldn't find the audit report for <code className="bg-white/5 px-2 py-1 rounded text-primary text-sm font-mono tracking-wider border border-white/10">{slug}</code>. 
          <br className="hidden sm:block" />
          It may have been deleted, marked as private, or the link is incorrect.
        </p>
        <Link href="/audit" className="premium-btn-primary inline-flex items-center gap-2 group shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Run a New Audit
        </Link>
      </div>
    </div>
  );
}

// ─── Main report page ─────────────────────────────────────────────────────────

export default function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string>("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    params.then(async ({ slug: s }) => {
      if (!isMounted) return;
      setSlug(s);
      
      // 1. Try local session storage first (fastest, immediately after run)
      const raw = sessionStorage.getItem(`spendpilot:report:${s}`);
      if (raw) {
        try {
          setResult(JSON.parse(raw));
          setLoading(false);
          return;
        } catch {
          // malformed — fallback to remote fetch
        }
      }

      // 2. Not in local session, try fetching public report from Supabase
      if (s !== "demo") {
        try {
          const { getPublicAudit } = await import("@/lib/supabase/audits");
          const audit = await getPublicAudit(s);

          if (audit && isMounted) {
            setResult(audit.result_snapshot as unknown as AuditResult);
          }
        } catch (err) {
          console.error("Failed to fetch public report:", err);
        }
      }
      
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [params]);

  if (loading) return <LoadingState />;

  // Demo slug always works — show a built-in demo result
  if (!result && slug === "demo") {
    return <DemoReport />;
  }

  if (!result) return <NotFoundState slug={slug} />;

  return <LiveReport result={result} />;
}

// ─── Live report (real engine output) ─────────────────────────────────────────

function LiveReport({ result }: { result: AuditResult }) {
  const { input, overallScore, findingCounts, totalMonthlySpendUsd, totalPotentialSavingsUsd, allFindings, toolSummaries } = result;

  const auditedDate = new Date(result.auditedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1200px]">
      <div className="flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Audit Report:{" "}
              <span className="text-muted-foreground font-normal">{input.companyName}</span>
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Generated on {auditedDate} · {input.teamSize} people · {input.tools.length} tools
            </p>
          </div>
          <Link href="/audit" className="premium-btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
            New Audit
          </Link>
        </div>

        {/* ── AI Executive Summary ── */}
        <AuditSummaryPanel result={result} />

        {/* ── Summary cards ── */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Score */}
          <div className="glass-card p-6 flex flex-col items-center gap-3">
            <ScoreRing score={overallScore} />
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Portfolio Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {overallScore >= 75 ? "Well optimised" : overallScore >= 50 ? "Needs attention" : "Action required"}
              </p>
            </div>
          </div>

          {/* Total spend */}
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Monthly Spend</h3>
            <div className="text-3xl font-bold mt-3 text-foreground">${fmt(totalMonthlySpendUsd)}</div>
            <p className="text-xs text-muted-foreground mt-2">{input.tools.length} tools · {input.teamSize} seats</p>
          </div>

          {/* Findings */}
          <div className="glass-card p-6 relative overflow-hidden group border-red-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Findings</h3>
            <div className="text-3xl font-bold mt-3 text-red-500">{findingCounts.total}</div>
            <p className="text-xs text-muted-foreground mt-2 flex gap-2">
              <span className="text-red-400">{findingCounts.critical} critical</span>
              <span>·</span>
              <span className="text-yellow-400">{findingCounts.warning} warnings</span>
              <span>·</span>
              <span className="text-blue-400">{findingCounts.info} info</span>
            </p>
          </div>

          {/* Savings */}
          <div className="glass-card p-6 relative overflow-hidden group border-green-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Potential Savings</h3>
            <div className="text-3xl font-bold mt-3 text-green-500">${fmt(totalPotentialSavingsUsd)}/mo</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
              ${fmt(totalPotentialSavingsUsd * 12)}/year if actioned
            </p>
          </div>
        </div>

        {/* ── Per-tool table ── */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border/40 bg-white/5">
            <h3 className="font-semibold text-lg text-foreground">Tool Breakdown</h3>
          </div>
          <div className="p-2">
            <div className="space-y-1">
              {toolSummaries.map((ts) => {
                const initials = ts.toolEntry.tool.slice(0, 2).toUpperCase();
                const score = ts.efficiencyScore;
                const scoreColor = score >= 75 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
                return (
                  <div
                    key={ts.toolEntry.tool}
                    className="flex items-center justify-between p-4 rounded-md hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${ts.hasCritical ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-primary/10 border-primary/20 text-primary"} border flex items-center justify-center font-bold text-sm`}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{ts.toolEntry.tool}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ts.toolEntry.seats} seats · Plan: {ts.toolEntry.plan}
                          {ts.findings.length > 0 && (
                            <span className="ml-2 text-yellow-400">· {ts.findings.length} finding{ts.findings.length !== 1 ? "s" : ""}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${fmt(ts.toolEntry.monthlySpend)}/mo</p>
                      <p className={`text-xs mt-1 ${scoreColor}`}>Score: {score}/100</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Spend Charts ── */}
        <SpendCharts
          toolSummaries={toolSummaries}
          totalMonthlySpend={totalMonthlySpendUsd}
          projection={result.savingsProjection}
        />

        {/* ── Savings Hero (annual projection) ── */}
        <SavingsHero
          projection={result.savingsProjection}
          currentSpend={totalMonthlySpendUsd}
          companyName={input.companyName}
        />

        {/* ── Savings Projections (detail panel) ── */}
        <SavingsProjectionPanel
          projection={result.savingsProjection}
          currentSpend={totalMonthlySpendUsd}
        />

        {/* ── Recommendations ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xl text-foreground">
              Recommendations
              {allFindings.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({allFindings.length} finding{allFindings.length !== 1 ? "s" : ""})
                </span>
              )}
            </h3>
            {allFindings.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Ordered by severity · highest impact first
              </span>
            )}
          </div>
          <RecommendationList
            findings={allFindings}
            toolPlanMap={Object.fromEntries(
              toolSummaries.map((ts) => [
                ts.toolEntry.tool,
                `${ts.toolEntry.tool} (${ts.toolEntry.plan})`,
              ])
            )}
            initialVisible={5}
          />
        </div>

      </div>
    </div>
  );
}

// ─── Demo report (static placeholder for /report/demo) ────────────────────────

function DemoReport() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1200px]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Audit Report: <span className="text-muted-foreground font-normal">demo</span>
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Demo data — run a real audit to see your numbers
            </p>
          </div>
          <Link href="/audit" className="premium-btn-primary">Run Real Audit →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-6 flex flex-col items-center gap-3">
            <ScoreRing score={48} />
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Portfolio Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">Needs attention</p>
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Monthly Spend</h3>
            <div className="text-3xl font-bold mt-3 text-foreground">$45,231.00</div>
            <p className="text-xs text-muted-foreground mt-2">+20.1% from last month</p>
          </div>
          <div className="glass-card p-6 border-red-500/20">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Findings</h3>
            <div className="text-3xl font-bold mt-3 text-red-500">7</div>
            <p className="text-xs text-muted-foreground mt-2">2 critical · 3 warnings · 2 info</p>
          </div>
          <div className="glass-card p-6 border-green-500/20">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Potential Savings</h3>
            <div className="text-3xl font-bold mt-3 text-green-500">$8,900.00/mo</div>
            <p className="text-xs text-muted-foreground mt-2">Via downgrades &amp; consolidation</p>
          </div>
        </div>

        {/* ── Savings Hero — demo projection ── */}
        <SavingsHero
          projection={DEMO_PROJECTION}
          currentSpend={45231}
          companyName="demo"
        />

        <div className="glass-card p-8 text-center flex flex-col items-center gap-4">
          <span className="text-4xl">🚀</span>
          <h3 className="text-xl font-bold text-foreground">This is a demo report</h3>
          <p className="text-muted-foreground max-w-md">
            Run a real audit with your actual tool subscriptions to get personalized recommendations and savings estimates from our AI engine.
          </p>
          <Link href="/audit" className="premium-btn-primary">Start Real Audit →</Link>
        </div>
      </div>
    </div>
  );
}

// ─── Demo projection fixture ───────────────────────────────────────────────────
// Mirrors the static $8,900/mo · $106,800/yr figures shown in the summary cards.
// Timeline start months: immediate → M1, short_term → M2, strategic → M4.

const DEMO_PROJECTION: import("@/types/auditEngine").SavingsProjection = {
  totalMonthlyUsd:     8900,
  totalAnnualUsd:      106800,
  immediateMonthlyUsd: 3200,
  shortTermMonthlyUsd: 5400,   // immediate + short_term combined
  strategicMonthlyUsd: 3500,
  savingsRatePct:      19.7,
  byCategory: {
    seat_mismatch:   3200,
    overplan:        2100,
    overlap:         1800,
    annual_savings:  1800,
  },
  byAction: {
    reduce_seats:         3200,
    downgrade_plan:       2100,
    consolidate_tools:    1800,
    switch_billing_cycle: 1800,
  },
  byTimeline: { immediate: 3200, short_term: 2200, strategic: 3500 },
  monthlyChart: (() => {
    const byTl: Record<string, number> = { immediate: 3200, short_term: 2200, strategic: 3500 };
    const starts: Record<string, number> = { immediate: 1, short_term: 2, strategic: 4 };
    let cum = 0;
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const marginal = Object.entries(byTl).reduce(
        (s, [k, v]) => s + (m === starts[k] ? v : 0),
        0
      );
      cum += marginal;
      return { month: m, label: `Month ${m}`, cumulativeSavingsUsd: cum, marginalSavingsUsd: marginal };
    });
  })(),
  prioritisedActions: [],
};
