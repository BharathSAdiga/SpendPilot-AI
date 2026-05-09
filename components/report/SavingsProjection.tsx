"use client";

import React, { useState } from "react";
import type { SavingsProjection, PrioritisedAction, SavingsTimeline } from "@/types/auditEngine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUsd(n: number, compact = false) {
  if (compact && n >= 1000) {
    return `$${(n / 1000).toFixed(1)}k`;
  }
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  overspend:     "Overspend",
  overplan:      "Oversized Plan",
  underutilized: "Underutilized",
  overlap:       "Overlapping Tools",
  alternative:   "Cheaper Alternative",
  annual_savings:"Annual Billing",
  seat_mismatch: "Excess Seats",
  consolidation: "Consolidation",
};

const CATEGORY_COLORS: Record<string, string> = {
  overspend:     "bg-red-500",
  overplan:      "bg-orange-500",
  underutilized: "bg-yellow-500",
  overlap:       "bg-purple-500",
  alternative:   "bg-blue-500",
  annual_savings:"bg-cyan-500",
  seat_mismatch: "bg-rose-500",
  consolidation: "bg-indigo-500",
};

const TIMELINE_CONFIG: Record<SavingsTimeline, { label: string; color: string; dot: string; description: string }> = {
  immediate:  { label: "This Week",   color: "text-green-400",  dot: "bg-green-400",  description: "< 1 week" },
  short_term: { label: "This Month",  color: "text-yellow-400", dot: "bg-yellow-400", description: "1–4 weeks" },
  strategic:  { label: "Long-term",   color: "text-blue-400",   dot: "bg-blue-400",   description: "1–6 months" },
};

// ─── 12-month SVG chart ───────────────────────────────────────────────────────

function CumulativeChart({ projection }: { projection: SavingsProjection }) {
  const { monthlyChart } = projection;
  const maxVal = monthlyChart[monthlyChart.length - 1]?.cumulativeSavingsUsd ?? 1;

  const W = 560;
  const H = 160;
  const PAD = { top: 16, right: 16, bottom: 32, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Build polyline points
  const points = [
    `${PAD.left},${PAD.top + chartH}`, // origin
    ...monthlyChart.map((p, i) => {
      const x = PAD.left + ((i + 1) / 12) * chartW;
      const y = PAD.top + chartH - (p.cumulativeSavingsUsd / maxVal) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }),
  ].join(" ");

  // Area fill path
  const lastX = PAD.left + chartW;
  const baseY = PAD.top + chartH;
  const areaPath = `M ${PAD.left} ${baseY} ` +
    monthlyChart.map((p, i) => {
      const x = PAD.left + ((i + 1) / 12) * chartW;
      const y = PAD.top + chartH - (p.cumulativeSavingsUsd / maxVal) * chartH;
      return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") +
    ` L ${lastX} ${baseY} Z`;

  // Y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => ({
    y: PAD.top + chartH - r * chartH,
    label: fmtUsd(r * maxVal, true),
  }));

  // X-axis labels at month 1, 3, 6, 9, 12
  const xLabels = [1, 3, 6, 9, 12].map(m => ({
    x: PAD.left + (m / 12) * chartW,
    label: `M${m}`,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="12-month cumulative savings chart">
      <defs>
        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={PAD.left + chartW} y2={t.y}
            stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end"
            fontSize="9" fill="currentColor" opacity="0.5">{t.label}</text>
        </g>
      ))}

      {/* X labels */}
      {xLabels.map((xl, i) => (
        <text key={i} x={xl.x} y={H - 6} textAnchor="middle"
          fontSize="9" fill="currentColor" opacity="0.5">{xl.label}</text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#savingsGrad)" />

      {/* Line */}
      <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* End dot */}
      {(() => {
        const last = monthlyChart[11];
        const x = PAD.left + chartW;
        const y = PAD.top + chartH - (last.cumulativeSavingsUsd / maxVal) * chartH;
        return <circle cx={x} cy={y} r="4" fill="#22c55e" />;
      })()}
    </svg>
  );
}

// ─── Category breakdown bars ──────────────────────────────────────────────────

function CategoryBreakdown({ byCategory, total }: {
  byCategory: SavingsProjection["byCategory"];
  total: number;
}) {
  const entries = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([cat, val]) => {
        const pct = total > 0 ? (val / total) * 100 : 0;
        const color = CATEGORY_COLORS[cat] ?? "bg-primary";
        return (
          <div key={cat} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-32 shrink-0">
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground tabular-nums w-20 text-right">
              {fmtUsd(val)}/mo
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Action roadmap ───────────────────────────────────────────────────────────

function ActionRoadmap({ actions }: { actions: PrioritisedAction[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {actions.map((pa, i) => {
        const { finding: f, timeline, runningTotalUsd } = pa;
        const cfg = TIMELINE_CONFIG[timeline];
        const isOpen = expanded === f.id;
        return (
          <div key={f.id} className="glass-card p-4 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              {/* Step number */}
              <span className="shrink-0 w-6 h-6 rounded-full bg-white/5 border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {f.estimatedMonthlySavingsUsd > 0 && (
                    <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                      {fmtUsd(f.estimatedMonthlySavingsUsd)}/mo
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    Running total: {fmtUsd(runningTotalUsd)}/mo
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground mt-1 leading-snug">{f.title}</p>
              </div>
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {isOpen ? "▲" : "▼"}
              </button>
            </div>
            {isOpen && (
              <div className="pl-9 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                <p>{f.actionDescription}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SavingsProjectionPanel({ projection, currentSpend }: {
  projection: SavingsProjection | undefined;
  currentSpend: number;
}) {
  const [view, setView] = useState<"monthly" | "annual">("monthly");

  // Guard against stale sessionStorage reports that pre-date this field
  if (!projection) return null;

  const {
    totalMonthlyUsd, totalAnnualUsd,
    immediateMonthlyUsd, shortTermMonthlyUsd, strategicMonthlyUsd,
    savingsRatePct, byCategory, prioritisedActions,
  } = projection;


  const optimisedSpend = currentSpend - totalMonthlyUsd;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Savings Projections</h2>
        {/* Monthly / Annual toggle */}
        <div className="flex items-center bg-white/5 border border-border rounded-lg p-0.5 gap-0.5">
          {(["monthly", "annual"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                view === v
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero numbers ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Primary savings card */}
        <div className="lg:col-span-2 glass-card p-6 border-green-500/30 bg-green-500/5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest">
            Total Potential Savings
          </p>
          <div className="text-4xl font-bold text-green-400 mt-2 tabular-nums">
            {view === "monthly" ? `${fmtUsd(totalMonthlyUsd)}/mo` : `${fmtUsd(totalAnnualUsd)}/yr`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {savingsRatePct.toFixed(0)}% of current spend · optimised run-rate: {fmtUsd(optimisedSpend)}/mo
          </p>
        </div>

        {/* Immediate */}
        <div className="glass-card p-5 border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <p className="text-xs font-semibold text-green-400 uppercase tracking-widest">This Week</p>
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {view === "monthly" ? fmtUsd(immediateMonthlyUsd) : fmtUsd(immediateMonthlyUsd * 12)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Reduce seats · switch billing</p>
        </div>

        {/* Short-term */}
        <div className="glass-card p-5 border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">This Month</p>
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {view === "monthly" ? fmtUsd(shortTermMonthlyUsd) : fmtUsd(shortTermMonthlyUsd * 12)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Incl. plan downgrades</p>
        </div>
      </div>

      {/* ── Timeline buckets ── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.entries(TIMELINE_CONFIG) as [SavingsTimeline, typeof TIMELINE_CONFIG[SavingsTimeline]][]).map(([key, cfg]) => {
          const val = key === "immediate" ? immediateMonthlyUsd
                    : key === "short_term" ? projection.byTimeline.short_term
                    : strategicMonthlyUsd;
          return (
            <div key={key} className="glass-card p-4 flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</p>
                <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {view === "monthly" ? `${fmtUsd(val)}/mo` : `${fmtUsd(val * 12)}/yr`}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── 12-month cumulative chart ── */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">12-Month Cumulative Savings</h3>
          <span className="text-xs text-muted-foreground">
            {fmtUsd(totalAnnualUsd)} saved by end of year
          </span>
        </div>
        <CumulativeChart projection={projection} />
        <div className="flex gap-6 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Immediate actions (Month 1)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" />Short-term (Month 2)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />Strategic (Month 4)</span>
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {Object.keys(byCategory).length > 0 && (
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="font-semibold text-foreground">Savings by Category</h3>
          <CategoryBreakdown byCategory={byCategory} total={totalMonthlyUsd} />
        </div>
      )}

      {/* ── Action roadmap ── */}
      {prioritisedActions.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Action Roadmap</h3>
            <span className="text-xs text-muted-foreground">Ordered by impact · fastest first</span>
          </div>
          <ActionRoadmap actions={prioritisedActions} />
        </div>
      )}
    </div>
  );
}
