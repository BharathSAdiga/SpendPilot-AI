"use client";

import React from "react";
import Link from "next/link";
import type { AuditResult } from "@/types/auditEngine";
import { SavingsProjectionPanel } from "@/components/report/SavingsProjection";
import { SavingsHero } from "@/components/report/SavingsHero";
import { RecommendationList } from "@/components/report/RecommendationCard";
import { SpendCharts } from "@/components/report/SpendCharts";
import { AuditSummaryPanel } from "@/components/report/AuditSummaryPanel";

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ScoreRing({ score }: { score: number }) {
  const colour = score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center" role="img" aria-label={`Efficiency score: ${score} out of 100`}>
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90" aria-hidden="true">
        <circle cx="56" cy="56" r={r} stroke="#ffffff10" strokeWidth="10" fill="none" />
        <circle
          cx="56" cy="56" r={r}
          stroke={colour} strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <span className="absolute text-2xl font-bold tabular-nums" style={{ color: colour }} aria-hidden="true">
        {score}
      </span>
    </div>
  );
}

export function NotFoundState({ slug }: { slug: string }) {
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

function CredexCTA({ monthlySavings }: { monthlySavings: number }) {
  if (monthlySavings > 500) {
    return (
      <div className="glass-card mt-8 p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center gap-6 border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-3">
            Unlock ${fmt(monthlySavings * 12)} in Annual Savings
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            You have significant optimization opportunities. Our team of software procurement experts at Credex can negotiate better contracts and right-size your stack for you—often with zero upfront cost.
          </p>
          <a href="https://credex.com/consultation" target="_blank" rel="noreferrer" className="premium-btn-primary px-8 py-4 text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 inline-flex items-center gap-2 group">
            Book Free Expert Consultation
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>
      </div>
    );
  }

  if (monthlySavings < 100) {
    return (
      <div className="glass-card mt-8 p-8 flex items-start gap-4 border-green-500/20 bg-green-500/5">
        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">You're already spending efficiently!</h3>
          <p className="text-muted-foreground mt-1">
            Your SaaS stack looks highly optimized. Keep up the good work. If your team scales and you need help managing procurement, Credex is here to help.
          </p>
        </div>
      </div>
    );
  }

  // standard CTA
  return (
    <div className="glass-card mt-8 p-8 text-center flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-foreground">Need help implementing these recommendations?</h3>
      <p className="text-muted-foreground max-w-lg">
        Tackling SaaS sprawl can be time-consuming. Get expert advice on consolidating tools and reducing your software spend.
      </p>
      <a href="https://credex.com/contact" target="_blank" rel="noreferrer" className="premium-btn-secondary mt-2">
        Talk to an Expert
      </a>
    </div>
  );
}

export function LiveReport({ result, isPublic }: { result: AuditResult; isPublic?: boolean }) {
  const { input, overallScore, findingCounts, totalMonthlySpendUsd, totalPotentialSavingsUsd, allFindings, toolSummaries } = result;

  const auditedDate = new Date(result.auditedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const displayName = isPublic ? "Confidential Client" : input.companyName;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1200px]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Audit Report:{" "}
              <span className="text-muted-foreground font-normal">{displayName}</span>
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

        <AuditSummaryPanel result={result} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-6 flex flex-col items-center gap-3">
            <ScoreRing score={overallScore} />
            <div className="text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Portfolio Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {overallScore >= 75 ? "Well optimised" : overallScore >= 50 ? "Needs attention" : "Action required"}
              </p>
            </div>
          </div>

          <article className="glass-card p-6 relative overflow-hidden group" aria-labelledby="total-spend-heading">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 id="total-spend-heading" className="tracking-tight text-sm font-medium text-muted-foreground">Total Monthly Spend</h3>
            <div className="text-3xl font-bold mt-3 text-foreground">${fmt(totalMonthlySpendUsd)}</div>
            <p className="text-xs text-muted-foreground mt-2">{input.tools.length} tools · {input.teamSize} seats</p>
          </article>

          <article className="glass-card p-6 relative overflow-hidden group border-red-500/20" aria-labelledby="findings-heading">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 id="findings-heading" className="tracking-tight text-sm font-medium text-muted-foreground">Findings</h3>
            <div className="text-3xl font-bold mt-3 text-red-500">{findingCounts.total}</div>
            <p className="text-xs text-muted-foreground mt-2 flex gap-2">
              <span className="text-red-400">{findingCounts.critical} critical</span>
              <span>·</span>
              <span className="text-yellow-400">{findingCounts.warning} warnings</span>
              <span>·</span>
              <span className="text-blue-400">{findingCounts.info} info</span>
            </p>
          </article>

          <article className="glass-card p-6 relative overflow-hidden group border-green-500/20" aria-labelledby="savings-heading">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 id="savings-heading" className="tracking-tight text-sm font-medium text-muted-foreground">Potential Savings</h3>
            <div className="text-3xl font-bold mt-3 text-green-500">${fmt(totalPotentialSavingsUsd)}/mo</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              ${fmt(totalPotentialSavingsUsd * 12)}/year if actioned
            </p>
          </article>
        </div>

        <section className="glass-card overflow-hidden" aria-labelledby="tool-breakdown-heading">
          <div className="p-6 border-b border-border/40 bg-white/5">
            <h3 id="tool-breakdown-heading" className="font-semibold text-lg text-foreground">Tool Breakdown</h3>
          </div>
          <div className="p-2">
            <ul className="space-y-1" role="list">
              {toolSummaries.map((ts) => {
                const initials = ts.toolEntry.tool.slice(0, 2).toUpperCase();
                const score = ts.efficiencyScore;
                const scoreColor = score >= 75 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
                return (
                  <li key={ts.toolEntry.tool} className="flex items-center justify-between p-4 rounded-md hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${ts.hasCritical ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-primary/10 border-primary/20 text-primary"} border flex items-center justify-center font-bold text-sm`} aria-hidden="true">
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
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <SpendCharts toolSummaries={toolSummaries} totalMonthlySpend={totalMonthlySpendUsd} projection={result.savingsProjection} />

        <SavingsHero projection={result.savingsProjection} currentSpend={totalMonthlySpendUsd} companyName={displayName} />

        <SavingsProjectionPanel projection={result.savingsProjection} currentSpend={totalMonthlySpendUsd} />

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
            toolPlanMap={Object.fromEntries(toolSummaries.map((ts) => [ts.toolEntry.tool, `${ts.toolEntry.tool} (${ts.toolEntry.plan})`]))}
            initialVisible={5}
          />
        </div>

        <CredexCTA monthlySavings={totalPotentialSavingsUsd} />
      </div>
    </div>
  );
}

const DEMO_PROJECTION: import("@/types/auditEngine").SavingsProjection = {
  totalMonthlyUsd:     8900,
  totalAnnualUsd:      106800,
  immediateMonthlyUsd: 3200,
  shortTermMonthlyUsd: 5400,
  strategicMonthlyUsd: 3500,
  savingsRatePct:      19.7,
  byCategory: { seat_mismatch: 3200, overplan: 2100, overlap: 1800, annual_savings: 1800 },
  byAction: { reduce_seats: 3200, downgrade_plan: 2100, consolidate_tools: 1800, switch_billing_cycle: 1800 },
  byTimeline: { immediate: 3200, short_term: 2200, strategic: 3500 },
  monthlyChart: (() => {
    const byTl: Record<string, number> = { immediate: 3200, short_term: 2200, strategic: 3500 };
    const starts: Record<string, number> = { immediate: 1, short_term: 2, strategic: 4 };
    let cum = 0;
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const marginal = Object.entries(byTl).reduce((s, [k, v]) => s + (m === starts[k] ? v : 0), 0);
      cum += marginal;
      return { month: m, label: `Month ${m}`, cumulativeSavingsUsd: cum, marginalSavingsUsd: marginal };
    });
  })(),
  prioritisedActions: [],
};

export function DemoReport() {
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
        <SavingsHero projection={DEMO_PROJECTION} currentSpend={45231} companyName="demo" />
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
