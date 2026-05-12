"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SavingsProjection, SavingsTimeline } from "@/types/auditEngine";

// ─── Easing ───────────────────────────────────────────────────────────────────

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ─── Animated counter hook ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, enabled = false) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled || target === 0) return;
    const t0 = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - t0) / duration, 1);
      setVal(Math.round(easeOutExpo(progress) * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current != null) cancelAnimationFrame(raf.current); };
  }, [target, duration, enabled]);
  return val;
}

// ─── Intersection observer ────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function fmtFull(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── 12-month area+line chart ─────────────────────────────────────────────────

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function AnnualChart({
  projection,
  started,
}: {
  projection: SavingsProjection;
  started: boolean;
}) {
  const { monthlyChart } = projection;
  const maxVal = Math.max(...monthlyChart.map((p) => p.cumulativeSavingsUsd), 1);

  const W = 600;
  const H = 180;
  const PAD = { top: 20, right: 20, bottom: 36, left: 60 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  // All 12 x/y points
  const pts = monthlyChart.map((p, i) => ({
    x: PAD.left + ((i + 1) / 12) * cW,
    y: PAD.top + cH - (p.cumulativeSavingsUsd / maxVal) * cH,
    v: p.cumulativeSavingsUsd,
    m: p.marginalSavingsUsd,
  }));

  const origin = { x: PAD.left, y: PAD.top + cH };
  const linePoints = [origin, ...pts].map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M ${origin.x} ${origin.y} ` +
    pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    ` L ${pts[pts.length - 1].x.toFixed(1)} ${PAD.top + cH} Z`;

  // Y axis ticks at 0, 25%, 50%, 75%, 100%
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    y: PAD.top + cH - r * cH,
    label: fmtCompact(r * maxVal),
  }));

  // Milestone markers: months 1, 2, 4 (timeline start months)
  const milestones: { idx: number; color: string }[] = [
    { idx: 0, color: "#10b981" },  // Month 1 — immediate
    { idx: 1, color: "#eab308" },  // Month 2 — short-term
    { idx: 3, color: "#3b82f6" },  // Month 4 — strategic
  ];

  const last = pts[pts.length - 1];

  return (
    <div className="relative group">
      <div id="chart-desc" className="sr-only">
        This chart shows a 12-month projection of cumulative savings. 
        Starting from zero, the savings grow as recommendations are implemented across immediate, 
        short-term, and strategic phases, reaching a total of {fmtCompact(last.v)} by the end of the year.
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-labelledby="chart-title chart-desc"
        role="img"
      >
        <title id="chart-title">12-month cumulative savings projection chart</title>
      <defs>
        <linearGradient id="sh-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        {/* Animated clip for wipe-in */}
        <clipPath id="sh-clip">
          <rect
            x={PAD.left}
            y={0}
            width={started ? cW : 0}
            height={H}
            style={{ transition: "width 2s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </clipPath>
      </defs>

      {/* Y-axis grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.left} y1={t.y}
            x2={PAD.left + cW} y2={t.y}
            stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
          />
          <text
            x={PAD.left - 8} y={t.y + 4}
            textAnchor="end" fontSize={9}
            fill="currentColor" opacity={0.4}
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* X-axis month labels */}
      {pts.map((p, i) => (
        (i % 2 === 0 || i === 11) && (
          <text
            key={i}
            x={p.x} y={H - 6}
            textAnchor="middle" fontSize={9}
            fill="currentColor" opacity={0.4}
          >
            {MONTH_SHORT[i]}
          </text>
        )
      ))}

      {/* Area + line (clipped for wipe animation) */}
      <g clipPath="url(#sh-clip)">
        <path d={areaPath} fill="url(#sh-grad)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#10b981"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Milestone dots */}
      {milestones.map(({ idx, color }) => {
        const p = pts[idx];
        return (
          <g key={idx} clipPath="url(#sh-clip)">
            <circle cx={p.x} cy={p.y} r={5} fill={color} />
            <circle cx={p.x} cy={p.y} r={8} fill={color} fillOpacity={0.2} />
          </g>
        );
      })}

      {/* End marker with annotation */}
      <g clipPath="url(#sh-clip)">
        <circle cx={last.x} cy={last.y} r={5} fill="#10b981" />
        <circle cx={last.x} cy={last.y} r={9} fill="#10b981" fillOpacity={0.25} />
        <rect
          x={last.x - 36} y={last.y - 22}
          width={72} height={18}
          rx={5}
          fill="rgba(16,185,129,0.15)"
          stroke="rgba(16,185,129,0.3)"
          strokeWidth={1}
        />
        <text
          x={last.x} y={last.y - 9}
          textAnchor="middle" fontSize={9}
          fill="#34d399" fontWeight="bold"
        >
          {fmtCompact(last.v)}
        </text>
      </g>
    </svg>
    </div>
  );
}

// ─── Timeline bucket card ─────────────────────────────────────────────────────

const TIMELINE_CFG: Record<
  SavingsTimeline,
  { label: string; when: string; accent: string; glow: string; border: string }
> = {
  immediate: {
    label: "This Week",
    when: "< 1 week",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.20)",
  },
  short_term: {
    label: "This Month",
    when: "1–4 weeks",
    accent: "#eab308",
    glow: "rgba(234,179,8,0.10)",
    border: "rgba(234,179,8,0.20)",
  },
  strategic: {
    label: "Long-term",
    when: "1–6 months",
    accent: "#3b82f6",
    glow: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.20)",
  },
};

function TimelineBucket({
  timeline,
  monthly,
  annual,
  showAnnual,
  enabled,
}: {
  timeline: SavingsTimeline;
  monthly: number;
  annual: number;
  showAnnual: boolean;
  enabled: boolean;
}) {
  const cfg = TIMELINE_CFG[timeline];
  const displayed = useCountUp(showAnnual ? annual : monthly, 1600, enabled);

  return (
    <div
      className="relative flex flex-col gap-3 rounded-2xl p-5 overflow-hidden"
      style={{
        background: cfg.glow,
        border: `1px solid ${cfg.border}`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse shrink-0"
          style={{ background: cfg.accent }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: cfg.accent }}
        >
          {cfg.label}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{cfg.when}</span>
      </div>
      <div
        className="text-3xl font-extrabold tabular-nums leading-none"
        style={{ color: cfg.accent }}
        aria-label={`${fmtFull(displayed)} ${showAnnual ? "per year" : "per month"}`}
      >
        <span aria-hidden="true">{fmtFull(displayed)}</span>
        <span className="text-sm font-semibold ml-1 opacity-70" aria-hidden="true">
          /{showAnnual ? "yr" : "mo"}
        </span>
      </div>
    </div>
  );
}

// ─── Donut ring ───────────────────────────────────────────────────────────────

function SavingsRing({
  pct,
  label,
  color,
  started,
}: {
  pct: number;
  label: string;
  color: string;
  started: boolean;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = started ? (pct / 100) * circ : 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width={64} height={64} viewBox="0 0 64 64" className="-rotate-90" aria-hidden>
          <circle cx={32} cy={32} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={7} fill="none" />
          <circle
            cx={32} cy={32} r={r}
            stroke={color} strokeWidth={7} fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <span className="absolute text-xs font-bold tabular-nums" style={{ color }} aria-hidden>
          {Math.round(pct)}%
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[60px]" aria-hidden>
        {label}
      </span>
      <span className="sr-only">{label}: {Math.round(pct)}% of total savings</span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface SavingsHeroProps {
  projection: SavingsProjection;
  currentSpend: number;
  companyName?: string;
}

export function SavingsHero({ projection, currentSpend, companyName }: SavingsHeroProps) {
  const { ref, inView } = useInView(0.08);
  const [showAnnual, setShowAnnual] = useState(true);

  const {
    totalMonthlyUsd,
    totalAnnualUsd,
    immediateMonthlyUsd,
    shortTermMonthlyUsd,
    strategicMonthlyUsd,
    savingsRatePct,
    byTimeline,
    byCategory,
  } = projection;

  // Primary counter target
  const primaryTarget = showAnnual ? totalAnnualUsd : totalMonthlyUsd;
  const primaryCount = useCountUp(primaryTarget, 2000, inView);

  // Optimised monthly run-rate
  const optimisedMonthly = currentSpend - totalMonthlyUsd;

  // Category rings (top 3)
  const catEntries = Object.entries(byCategory as Record<string, number>)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const CATEGORY_LABELS: Record<string, string> = {
    overspend: "Overspend",
    overplan: "Oversized Plan",
    underutilized: "Underutilized",
    overlap: "Overlapping",
    alternative: "Alternatives",
    annual_savings: "Annual Billing",
    seat_mismatch: "Excess Seats",
    consolidation: "Consolidation",
  };
  const RING_COLORS = ["#10b981", "#8b5cf6", "#3b82f6"];

  return (
    <>
      <style>{`
        @keyframes sh-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sh-appear { animation: sh-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <section
        ref={ref as React.RefObject<HTMLDivElement>}
        className="relative w-full rounded-3xl overflow-hidden"
        aria-label="Annual savings projection hero"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(40px)",
        }}
      >
        {/* ── Ambient orbs ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-24 -left-16 w-96 h-96 rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 right-0 w-80 h-80 rounded-full blur-[90px]"
            style={{ background: "radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 70%)" }}
          />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col gap-8">

          {/* ── Top bar: label + toggle ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 sh-appear" style={{ animationDelay: "0ms" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]
                    px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.10)",
                    border: "1px solid rgba(16,185,129,0.22)",
                    color: "#34d399",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Savings Projection
                </span>
                {companyName && (
                  <span className="text-xs text-muted-foreground">· {companyName}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Full-year impact if all recommendations are actioned
              </p>
            </div>

            {/* Monthly / Annual toggle */}
            <div
              className="flex items-center rounded-xl p-1 gap-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
              role="group"
              aria-label="Savings view toggle"
            >
              {(["Monthly", "Annual"] as const).map((v) => {
                const isActive = showAnnual === (v === "Annual");
                return (
                  <button
                    key={v}
                    id={`savings-hero-toggle-${v.toLowerCase()}`}
                    onClick={() => setShowAnnual(v === "Annual")}
                    aria-pressed={isActive}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={
                      isActive
                        ? {
                            background: "rgba(16,185,129,0.18)",
                            color: "#34d399",
                            border: "1px solid rgba(16,185,129,0.30)",
                          }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Primary hero number ── */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 sh-appear" style={{ animationDelay: "60ms" }}>
            {/* Big counter */}
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Total {showAnnual ? "Annual" : "Monthly"} Savings Identified
              </span>
                <div
                  className="text-6xl md:text-7xl lg:text-8xl font-extrabold tabular-nums leading-none tracking-tight"
                  style={{
                    background: "linear-gradient(135deg,#34d399 0%,#10b981 45%,#059669 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                  aria-label={`${fmtFull(primaryCount)} total savings identified`}
                >
                  <span aria-hidden="true">{fmtFull(primaryCount)}</span>
                </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="text-sm text-muted-foreground">
                  <span
                    className="font-semibold"
                    style={{ color: "#34d399" }}
                  >
                    {savingsRatePct.toFixed(0)}%
                  </span>{" "}
                  of current spend
                </span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  Optimised run-rate:{" "}
                  <span className="font-semibold text-foreground">
                    {fmtFull(optimisedMonthly)}/mo
                  </span>
                </span>
              </div>
            </div>

            {/* Category rings */}
            {catEntries.length > 0 && (
              <div className="flex items-center gap-4 shrink-0">
                {catEntries.map(([cat, val], i) => {
                  const pct = totalMonthlyUsd > 0 ? (val / totalMonthlyUsd) * 100 : 0;
                  return (
                    <SavingsRing
                      key={cat}
                      pct={pct}
                      label={CATEGORY_LABELS[cat] ?? cat}
                      color={RING_COLORS[i]}
                      started={inView}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Timeline buckets ── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sh-appear"
            style={{ animationDelay: "120ms" }}
          >
            <TimelineBucket
              timeline="immediate"
              monthly={immediateMonthlyUsd}
              annual={immediateMonthlyUsd * 12}
              showAnnual={showAnnual}
              enabled={inView}
            />
            <TimelineBucket
              timeline="short_term"
              monthly={byTimeline.short_term}
              annual={byTimeline.short_term * 12}
              showAnnual={showAnnual}
              enabled={inView}
            />
            <TimelineBucket
              timeline="strategic"
              monthly={strategicMonthlyUsd}
              annual={strategicMonthlyUsd * 12}
              showAnnual={showAnnual}
              enabled={inView}
            />
          </div>

          {/* ── 12-month chart ── */}
          <div
            className="flex flex-col gap-4 sh-appear"
            style={{ animationDelay: "180ms" }}
          >
            {/* Chart header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  12-Month Cumulative Savings Projection
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Savings unlock as actions are implemented across three phases
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums"
                style={{
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.22)",
                  color: "#34d399",
                }}
              >
                {fmtFull(totalAnnualUsd)} saved by Month 12
              </div>
            </div>

            {/* SVG chart */}
            <div
              className="rounded-xl overflow-hidden p-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <AnnualChart projection={projection} started={inView} />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {[
                { color: "#10b981", label: "Immediate actions (Month 1)" },
                { color: "#eab308", label: "Short-term (Month 2)" },
                { color: "#3b82f6", label: "Strategic (Month 4)" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Annual projection callout strip ── */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
              rounded-2xl px-6 py-5 sh-appear"
            style={{
              animationDelay: "240ms",
              background: "linear-gradient(135deg,rgba(16,185,129,0.07) 0%,rgba(139,92,246,0.05) 100%)",
              border: "1px solid rgba(16,185,129,0.18)",
            }}
          >
            {/* Left: year label */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Annual Projection
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  If all actions are completed by end of Q1
                </p>
              </div>
            </div>

            {/* Right: three milestones */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { label: "Immediate", val: immediateMonthlyUsd * 12, color: "#10b981" },
                { label: "By month 2", val: shortTermMonthlyUsd * 12, color: "#eab308" },
                { label: "Full year", val: totalAnnualUsd, color: "#a78bfa" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {label}
                  </span>
                  <span
                    className="text-lg font-extrabold tabular-nums leading-tight"
                    style={{ color }}
                  >
                    {fmtCompact(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
