"use client";

/**
 * components/report/SpendCharts.tsx
 *
 * Three Recharts-powered visualisations for the SpendPilot audit report:
 *   1. CurrentVsOptimizedChart  — grouped bar: current vs optimised per tool
 *   2. ToolDistributionChart    — donut + legend: spend share per tool
 *   3. AnnualSavingsChart       — area chart: 12-month cumulative savings
 *
 * All charts are:
 *   - Fully responsive via ResponsiveContainer
 *   - Dark-mode native (no hardcoded white backgrounds)
 *   - Accessible (role="img", aria-label, desc elements)
 *   - Typed against AuditResult / SavingsProjection
 */

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine,
} from "recharts";
import type { ToolAuditSummary, SavingsProjection } from "@/types/auditEngine";

// ─── Shared design tokens ─────────────────────────────────────────────────────

const COLORS = [
  "#10b981", "#8b5cf6", "#3b82f6", "#f59e0b",
  "#ef4444", "#06b6d4", "#f97316", "#a78bfa",
];

const GRID_COLOR  = "rgba(255,255,255,0.06)";
const TICK_COLOR  = "rgba(255,255,255,0.35)";
const TICK_SIZE   = 11;

// ─── Shared tooltip shell ─────────────────────────────────────────────────────

function TooltipShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5 text-xs"
      style={{
        background: "rgba(10,10,10,0.92)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        color: "#ededed",
      }}
    >
      {children}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtK(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function fmtFull(v: number) {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  badge,
  badgeColor = "#10b981",
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex flex-col gap-5 rounded-2xl p-5 md:p-6 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[80px] pointer-events-none"
        style={{ background: `${badgeColor}12` }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span
            className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
            style={{
              background: `${badgeColor}14`,
              border: `1px solid ${badgeColor}30`,
              color: badgeColor,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}

// ─── 1. Current vs Optimised bar chart ────────────────────────────────────────

export interface CurrentVsOptimizedChartProps {
  toolSummaries: ToolAuditSummary[];
  /** Total potential savings per tool (toolId → monthly USD) */
  savingsByTool: Record<string, number>;
}

function BarTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const current  = payload.find((p) => p.name === "Current");
  const optimised = payload.find((p) => p.name === "Optimised");
  const saving = (current?.value ?? 0) - (optimised?.value ?? 0);

  return (
    <TooltipShell>
      <p className="font-bold mb-1.5 text-foreground">{label}</p>
      {current && (
        <p className="flex justify-between gap-4">
          <span style={{ color: current.color }}>Current</span>
          <span className="font-semibold tabular-nums">{fmtFull(current.value)}/mo</span>
        </p>
      )}
      {optimised && (
        <p className="flex justify-between gap-4">
          <span style={{ color: optimised.color }}>Optimised</span>
          <span className="font-semibold tabular-nums">{fmtFull(optimised.value)}/mo</span>
        </p>
      )}
      {saving > 0 && (
        <p className="flex justify-between gap-4 mt-1.5 pt-1.5 border-t border-white/10">
          <span className="text-emerald-400">Monthly saving</span>
          <span className="font-bold tabular-nums text-emerald-400">{fmtFull(saving)}</span>
        </p>
      )}
    </TooltipShell>
  );
}

export function CurrentVsOptimizedChart({
  toolSummaries,
  savingsByTool,
}: CurrentVsOptimizedChartProps) {
  const data = toolSummaries.map((ts) => {
    const current   = ts.toolEntry.monthlySpend;
    const saving    = savingsByTool[ts.toolEntry.tool] ?? 0;
    const optimised = Math.max(0, current - saving);
    return {
      name:      ts.toolEntry.tool,
      Current:   current,
      Optimised: optimised,
      saving,
    };
  });

  const totalCurrent   = data.reduce((s, d) => s + d.Current, 0);
  const totalOptimised = data.reduce((s, d) => s + d.Optimised, 0);
  const totalSaving    = totalCurrent - totalOptimised;

  return (
    <ChartCard
      title="Current vs Optimised Monthly Spend"
      subtitle="Per-tool comparison after all recommendations are applied"
      badge={`Save ${fmtK(totalSaving)}/mo`}
      badgeColor="#10b981"
    >
      {/* Summary strip */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Current total", value: fmtFull(totalCurrent) + "/mo", color: "#8b5cf6" },
          { label: "Optimised total", value: fmtFull(totalOptimised) + "/mo", color: "#10b981" },
          { label: "Monthly saving", value: fmtFull(totalSaving), color: "#34d399" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-sm font-bold tabular-nums" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 240 }} role="img" aria-label="Current vs optimised spend bar chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="28%">
            <defs>
              <linearGradient id="barCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="barOptimised" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              dataKey="name"
              tick={{ fill: TICK_COLOR, fontSize: TICK_SIZE }}
              axisLine={false} tickLine={false}
              interval={0}
              tickFormatter={(v: string) => v.length > 9 ? v.slice(0, 8) + "…" : v}
            />
            <YAxis
              tick={{ fill: TICK_COLOR, fontSize: TICK_SIZE }}
              axisLine={false} tickLine={false}
              tickFormatter={fmtK}
              width={46}
            />
            <Tooltip
              content={<BarTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: TICK_COLOR, paddingTop: 12 }}
              iconType="circle" iconSize={8}
            />
            <Bar dataKey="Current"   fill="url(#barCurrent)"   radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="Optimised" fill="url(#barOptimised)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ─── 2. Tool distribution donut ───────────────────────────────────────────────

export interface ToolDistributionChartProps {
  toolSummaries: ToolAuditSummary[];
  totalMonthlySpend: number;
}

function PieTooltip({
  active, payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { pct: number; saving: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <TooltipShell>
      <p className="font-bold text-foreground mb-1">{name}</p>
      <p className="flex justify-between gap-4">
        <span className="text-muted-foreground">Spend</span>
        <span className="font-semibold tabular-nums">{fmtFull(value)}/mo</span>
      </p>
      <p className="flex justify-between gap-4">
        <span className="text-muted-foreground">Share</span>
        <span className="font-semibold tabular-nums">{inner.pct.toFixed(1)}%</span>
      </p>
      {inner.saving > 0 && (
        <p className="flex justify-between gap-4 mt-1 pt-1 border-t border-white/10">
          <span className="text-emerald-400">Savings opp.</span>
          <span className="font-bold tabular-nums text-emerald-400">{fmtFull(inner.saving)}/mo</span>
        </p>
      )}
    </TooltipShell>
  );
}

export function ToolDistributionChart({
  toolSummaries,
  totalMonthlySpend,
}: ToolDistributionChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const data = toolSummaries
    .filter((ts) => ts.toolEntry.monthlySpend > 0)
    .map((ts, i) => ({
      name:   ts.toolEntry.tool,
      value:  ts.toolEntry.monthlySpend,
      pct:    totalMonthlySpend > 0 ? (ts.toolEntry.monthlySpend / totalMonthlySpend) * 100 : 0,
      saving: ts.potentialSavingsUsd,
      color:  COLORS[i % COLORS.length],
    }));

  return (
    <ChartCard
      title="Tool Spend Distribution"
      subtitle="Monthly budget share across your AI tool stack"
      badge={`${data.length} tools`}
      badgeColor="#8b5cf6"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Donut */}
        <div style={{ width: 200, height: 200, flexShrink: 0 }} role="img" aria-label="Tool spend distribution donut chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, i) => setActive(i)}
                onMouseLeave={() => setActive(null)}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={active === null || active === i ? 1 : 0.35}
                    style={{ outline: "none", cursor: "pointer", transition: "opacity 0.2s" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="flex-1 flex flex-col gap-2 w-full">
          {data.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-2.5 group cursor-default"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                style={{ background: d.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-medium text-foreground truncate">{d.name}</span>
                  <span className="text-xs font-bold tabular-nums text-foreground shrink-0">
                    {fmtK(d.value)}
                  </span>
                </div>
                {/* Mini bar */}
                <div
                  className="mt-1 h-1 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.pct}%`,
                      background: d.color,
                      opacity: active === null || active === i ? 1 : 0.3,
                    }}
                  />
                </div>
              </div>
              <span
                className="text-[10px] tabular-nums shrink-0"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {d.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// ─── 3. Annual savings area chart ─────────────────────────────────────────────

export interface AnnualSavingsChartProps {
  projection: SavingsProjection;
}

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function AreaTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const cum = payload.find((p) => p.name === "Cumulative");
  const mar = payload.find((p) => p.name === "Monthly");
  return (
    <TooltipShell>
      <p className="font-bold mb-1.5 text-foreground">{label}</p>
      {cum && (
        <p className="flex justify-between gap-4">
          <span style={{ color: cum.color }}>Cumulative saved</span>
          <span className="font-semibold tabular-nums">{fmtFull(cum.value)}</span>
        </p>
      )}
      {mar && mar.value > 0 && (
        <p className="flex justify-between gap-4">
          <span style={{ color: mar.color }}>New this month</span>
          <span className="font-semibold tabular-nums">{fmtFull(mar.value)}</span>
        </p>
      )}
    </TooltipShell>
  );
}

export function AnnualSavingsChart({ projection }: AnnualSavingsChartProps) {
  const { monthlyChart, totalAnnualUsd, immediateMonthlyUsd, shortTermMonthlyUsd } = projection;

  const data = monthlyChart.map((p, i) => ({
    month:      MONTH_SHORT[i],
    Cumulative: p.cumulativeSavingsUsd,
    Monthly:    p.marginalSavingsUsd,
  }));

  // Reference line values
  const immediateAnnual  = immediateMonthlyUsd * 12;
  const shortTermAnnual  = shortTermMonthlyUsd * 12;

  return (
    <ChartCard
      title="12-Month Annual Savings Projection"
      subtitle="Cumulative savings as recommendations are implemented phase by phase"
      badge={`${fmtK(totalAnnualUsd)} total`}
      badgeColor="#10b981"
    >
      {/* Phase legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { color: "#10b981", label: "Immediate (Month 1)" },
          { color: "#eab308", label: "Short-term (Month 2)" },
          { color: "#3b82f6", label: "Strategic (Month 4)" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      <div style={{ height: 260 }} role="img" aria-label="12-month cumulative annual savings area chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10b981" stopOpacity={0.30} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="areaMonthly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: TICK_COLOR, fontSize: TICK_SIZE }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: TICK_COLOR, fontSize: TICK_SIZE }}
              axisLine={false} tickLine={false}
              tickFormatter={fmtK}
              width={46}
            />
            <Tooltip content={<AreaTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }} />

            {/* Phase reference lines */}
            {immediateAnnual > 0 && (
              <ReferenceLine
                y={immediateAnnual}
                stroke="#10b981"
                strokeDasharray="4 3"
                strokeOpacity={0.5}
                label={{ value: "Imm.", fill: "#10b981", fontSize: 9, position: "insideTopLeft" }}
              />
            )}
            {shortTermAnnual > immediateAnnual && (
              <ReferenceLine
                y={shortTermAnnual}
                stroke="#eab308"
                strokeDasharray="4 3"
                strokeOpacity={0.5}
                label={{ value: "ST", fill: "#eab308", fontSize: 9, position: "insideTopLeft" }}
              />
            )}

            <Area
              type="monotone"
              dataKey="Monthly"
              name="Monthly"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              fill="url(#areaMonthly)"
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="Cumulative"
              name="Cumulative"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#areaCumulative)"
              dot={false}
              activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
            />

            <Legend
              wrapperStyle={{ fontSize: 11, color: TICK_COLOR, paddingTop: 8 }}
              iconType="circle" iconSize={8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ─── Combined panel ───────────────────────────────────────────────────────────

export interface SpendChartsProps {
  toolSummaries: ToolAuditSummary[];
  totalMonthlySpend: number;
  projection: SavingsProjection;
}

export function SpendCharts({ toolSummaries, totalMonthlySpend, projection }: SpendChartsProps) {
  // Build savingsByTool from projection prioritised actions
  const savingsByTool: Record<string, number> = {};
  for (const pa of projection.prioritisedActions) {
    const key = pa.finding.toolName ?? pa.finding.toolId ?? "";
    if (key) {
      savingsByTool[key] = (savingsByTool[key] ?? 0) + pa.finding.estimatedMonthlySavingsUsd;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Row 1: Current vs optimized (full width) */}
      <CurrentVsOptimizedChart
        toolSummaries={toolSummaries}
        savingsByTool={savingsByTool}
      />

      {/* Row 2: Distribution + Annual savings side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ToolDistributionChart
          toolSummaries={toolSummaries}
          totalMonthlySpend={totalMonthlySpend}
        />
        <AnnualSavingsChart projection={projection} />
      </div>
    </div>
  );
}
