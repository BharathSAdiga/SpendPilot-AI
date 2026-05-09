"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditResult, AuditFinding } from "@/types/auditEngine";
import { SavingsProjectionPanel } from "@/components/report/SavingsProjection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-500 border-red-500/30 bg-red-500/10",
  warning:  "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  info:     "text-blue-400 border-blue-400/30 bg-blue-400/10",
};

const ACTION_LABELS: Record<string, string> = {
  downgrade_plan:       "Downgrade Plan",
  switch_billing_cycle: "Switch to Annual",
  reduce_seats:         "Reduce Seats",
  consolidate_tools:    "Consolidate Tools",
  switch_tool:          "Switch Tool",
  monitor_usage:        "Monitor Usage",
  remove_tool:          "Remove Tool",
  upgrade_plan:         "Upgrade Plan",
  no_action:            "No Action",
};

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

// ─── Finding card ─────────────────────────────────────────────────────────────

function FindingCard({ f }: { f: AuditFinding }) {
  const [open, setOpen] = useState(false);
  const cls = SEVERITY_COLORS[f.severity] ?? SEVERITY_COLORS.info;
  return (
    <div className={`glass-card p-5 border ${cls} flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
            {f.severity}
          </span>
          {f.estimatedMonthlySavingsUsd > 0 && (
            <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              Save ${fmt(f.estimatedMonthlySavingsUsd)}/mo
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={open ? "Collapse" : "Expand details"}
        >
          {open ? "▲ Hide" : "▼ Details"}
        </button>
      </div>
      <p className="font-semibold text-foreground text-sm leading-snug">{f.title}</p>
      {open && (
        <>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.reasoning}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</span>
            <span className="text-xs font-medium text-foreground bg-white/5 border border-border px-2 py-0.5 rounded">
              {ACTION_LABELS[f.action] ?? f.action}
            </span>
            <span className="text-xs text-muted-foreground">{f.actionDescription}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-muted-foreground">
      <svg width="32" height="32" viewBox="0 0 14 14" fill="none" className="animate-spin text-primary" aria-hidden>
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M12 7a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p>Loading your audit report…</p>
    </div>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
      <span className="text-5xl">🔍</span>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Report not found</h2>
        <p className="text-muted-foreground mt-2">
          No audit data found for <code className="text-primary">{slug}</code>.<br />
          Reports are stored per-session and are cleared when you close your browser.
        </p>
      </div>
      <Link href="/audit" className="premium-btn-primary">
        Run New Audit
      </Link>
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

  // Unwrap the async params (Next.js 15 style)
  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s);
      const raw = sessionStorage.getItem(`spendpilot:report:${s}`);
      if (raw) {
        try {
          setResult(JSON.parse(raw));
        } catch {
          // malformed — leave result null
        }
      }
      setLoading(false);
    });
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

        {/* ── Savings Projections ── */}
        <SavingsProjectionPanel
          projection={result.savingsProjection}
          currentSpend={totalMonthlySpendUsd}
        />

        {/* ── All findings ── */}
        {allFindings.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-xl text-foreground">
              All Findings ({allFindings.length})
            </h3>
            {allFindings.map((f) => (
              <FindingCard key={f.id} f={f} />
            ))}
          </div>
        )}

        {allFindings.length === 0 && (
          <div className="glass-card p-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">🎉</span>
            <h3 className="text-xl font-bold text-foreground">No issues found!</h3>
            <p className="text-muted-foreground">Your AI tool stack looks well-optimised. Keep it up!</p>
          </div>
        )}

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
            <p className="text-xs text-muted-foreground mt-2">Via downgrades & consolidation</p>
          </div>
        </div>
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
