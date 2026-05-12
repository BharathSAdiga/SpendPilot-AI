"use client";

import React, { useState } from "react";
import type { AuditFinding, RecommendationAction, FindingSeverity, SavingsTimeline } from "@/types/auditEngine";
import { ACTION_TIMELINE } from "@/types/auditEngine";

// ─── Display maps ─────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  RecommendationAction,
  { label: string; icon: React.ReactNode; accent: string; glow: string; border: string }
> = {
  downgrade_plan: {
    label: "Downgrade Plan",
    accent: "#f59e0b", glow: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/>
      </svg>
    ),
  },
  switch_billing_cycle: {
    label: "Switch to Annual",
    accent: "#06b6d4", glow: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
      </svg>
    ),
  },
  reduce_seats: {
    label: "Reduce Seats",
    accent: "#10b981", glow: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <line x1="23" y1="11" x2="17" y2="11"/>
      </svg>
    ),
  },
  consolidate_tools: {
    label: "Consolidate Tools",
    accent: "#8b5cf6", glow: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/>
      </svg>
    ),
  },
  switch_tool: {
    label: "Switch Tool",
    accent: "#3b82f6", glow: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 0-2 2h-3"/>
      </svg>
    ),
  },
  monitor_usage: {
    label: "Monitor Usage",
    accent: "#a78bfa", glow: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  remove_tool: {
    label: "Remove Tool",
    accent: "#ef4444", glow: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
      </svg>
    ),
  },
  upgrade_plan: {
    label: "Upgrade Plan",
    accent: "#f97316", glow: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/>
      </svg>
    ),
  },
  no_action: {
    label: "No Action",
    accent: "#71717a", glow: "rgba(113,113,122,0.08)", border: "rgba(113,113,122,0.20)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
};

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; color: string; bg: string; border: string; ring: string }
> = {
  critical: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)", ring: "#ef4444" },
  warning:  { label: "Warning",  color: "#eab308", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.25)",  ring: "#eab308" },
  info:     { label: "Info",     color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", ring: "#60a5fa" },
};

const TIMELINE_CONFIG: Record<SavingsTimeline, { label: string; color: string }> = {
  immediate:  { label: "This Week",  color: "#10b981" },
  short_term: { label: "This Month", color: "#eab308" },
  strategic:  { label: "Long-term",  color: "#3b82f6" },
};

// ─── Prop types ───────────────────────────────────────────────────────────────

export interface RecommendationCardProps {
  finding: AuditFinding;
  /** Current plan/tool being flagged, e.g. "ChatGPT Business" */
  currentPlan?: string;
  /** Rank within this report (1 = highest priority) */
  rank?: number;
  /** Show expanded reasoning by default */
  defaultExpanded?: boolean;
  /** Callback when user marks the card as done */
  onDismiss?: (id: string) => void;
}

// ─── Savings pill ─────────────────────────────────────────────────────────────

function SavingsPill({ monthly }: { monthly: number }) {
  const annual = monthly * 12;
  const label =
    annual >= 10_000
      ? `$${(annual / 1000).toFixed(0)}K/yr`
      : `$${annual.toLocaleString()}/yr`;

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0">
      <span
        className="text-lg font-extrabold tabular-nums leading-none"
        style={{ color: "#10b981" }}
      >
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        ${monthly.toLocaleString()}/mo
      </span>
    </div>
  );
}

// ─── Before/After plan comparison ────────────────────────────────────────────

function PlanComparison({
  current,
  suggested,
  accentColor,
}: {
  current: string;
  suggested: string;
  accentColor: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      <span
        className="px-2.5 py-1 rounded-lg font-semibold"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--muted-foreground)" }}
      >
        {current}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      <span
        className="px-2.5 py-1 rounded-lg font-bold"
        style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
      >
        {suggested}
      </span>
    </div>
  );
}

// ─── Severity indicator bar ───────────────────────────────────────────────────

function SeverityBar({ severity }: { severity: FindingSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  const widths: Record<FindingSeverity, string> = { critical: "100%", warning: "66%", info: "33%" };
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {(["critical", "warning", "info"] as FindingSeverity[]).map((s) => (
          <div
            key={s}
            className="w-1 rounded-full transition-all duration-300"
            style={{
              height: s === "critical" ? "14px" : s === "warning" ? "10px" : "6px",
              background: SEVERITY_CONFIG[s].color,
              opacity: SEVERITY_CONFIG[severity] === SEVERITY_CONFIG[s] ? 1 : 0.18,
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function RecommendationCard({
  finding,
  currentPlan,
  rank,
  defaultExpanded = false,
  onDismiss,
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [dismissed, setDismissed] = useState(false);

  const sev = SEVERITY_CONFIG[finding.severity];
  const act = ACTION_CONFIG[finding.action] ?? ACTION_CONFIG.no_action;
  const timeline = ACTION_TIMELINE[finding.action];
  const tl = TIMELINE_CONFIG[timeline];

  const hasSavings = finding.estimatedMonthlySavingsUsd > 0;
  const hasPlanChange = !!(currentPlan && finding.suggestedPlanLabel);
  const hasAlternative = !!finding.suggestedAlternativeTool;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.(finding.id);
  }

  if (dismissed) return null;

  return (
    <article
      id={`rec-card-${finding.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200
        hover:translate-y-[-2px]"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${sev.border}`,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: `0 4px 24px -8px ${sev.bg}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      aria-labelledby={`title-${finding.id}`}
    >
      {/* ── Severity accent line ── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: sev.color }}
        aria-hidden
      />

      {/* ── Ambient glow ── */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none opacity-0
          group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: act.glow }}
        aria-hidden
      />

      {/* ── Card body ── */}
      <div className="relative flex flex-col gap-4 p-5 pl-7">

        {/* ── Top row: rank · severity · action badge · savings ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Rank bubble */}
            {rank != null && (
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--muted-foreground)" }}
              >
                {rank}
              </span>
            )}

            {/* Severity */}
            <SeverityBar severity={finding.severity} />

            {/* Action badge */}
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase
                tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: act.glow, color: act.accent, border: `1px solid ${act.border}` }}
            >
              <span style={{ color: act.accent }}>{act.icon}</span>
              {act.label}
            </span>

            {/* Timeline */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium"
              style={{ color: tl.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: tl.color }} />
              {tl.label}
            </span>
          </div>

          {/* Savings */}
          {hasSavings && <SavingsPill monthly={finding.estimatedMonthlySavingsUsd} />}
        </div>

        {/* ── Title ── */}
        <div>
          <h3 id={`title-${finding.id}`} className="text-sm font-bold text-foreground leading-snug">{finding.title}</h3>
          {finding.toolName && (
            <span className="text-xs text-muted-foreground mt-0.5 block">
              Tool: <span className="font-semibold text-foreground">{finding.toolName}</span>
            </span>
          )}
        </div>

        {/* ── Plan comparison ── */}
        {hasPlanChange && (
          <div className="flex flex-col gap-1">
            <span className="sr-only">Recommended plan change: from {currentPlan} to {finding.suggestedPlanLabel}</span>
            <PlanComparison
              current={currentPlan!}
              suggested={finding.suggestedPlanLabel!}
              accentColor={act.accent}
            />
          </div>
        )}
        {!hasPlanChange && hasAlternative && (
          <div className="flex flex-col gap-1">
            <span className="sr-only">Recommended tool switch: from {currentPlan ?? finding.toolName} to {finding.suggestedAlternativeTool}</span>
            <PlanComparison
              current={currentPlan ?? finding.toolName ?? "Current tool"}
              suggested={finding.suggestedAlternativeTool!}
              accentColor={act.accent}
            />
          </div>
        )}

        {/* ── Savings context bar ── */}
        {hasSavings && (
          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: "100%",
                  background: `linear-gradient(90deg, ${act.accent}80, ${act.accent})`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
              ${finding.estimatedMonthlySavingsUsd.toLocaleString()}/mo recoverable
            </span>
          </div>
        )}

        {/* ── Expandable reasoning ── */}
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring rounded-sm outline-none"
            style={{ color: expanded ? act.accent : "var(--muted-foreground)" }}
            aria-expanded={expanded}
            aria-controls={`reasoning-${finding.id}`}
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              aria-hidden
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {expanded ? "Hide reasoning" : "Show reasoning"}
          </button>

          {expanded && (
            <div
              id={`reasoning-${finding.id}`}
              className="mt-3 flex flex-col gap-3 rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{finding.reasoning}</p>

              {finding.actionDescription && (
                <div className="flex items-start gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: act.glow, color: act.accent }}
                  >
                    {act.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Recommended Action
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">{finding.actionDescription}</p>
                  </div>
                </div>
              )}

              {/* Meta fields */}
              {finding.meta && Object.keys(finding.meta).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {Object.entries(finding.meta).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-col px-2.5 py-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{k.replace(/_/g, " ")}</span>
                      <span className="text-xs font-semibold text-foreground">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-mono opacity-50">#{finding.ruleId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-150
                hover:opacity-100 opacity-50"
              style={{ color: "var(--muted-foreground)", border: "1px solid rgba(255,255,255,0.08)" }}
              aria-label="Mark as reviewed"
            >
              Dismiss
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all duration-150 hover:brightness-110"
              style={{
                background: act.glow,
                color: act.accent,
                border: `1px solid ${act.border}`,
              }}
            >
              {expanded ? "Collapse" : "View Details"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── List container ───────────────────────────────────────────────────────────

export interface RecommendationListProps {
  findings: AuditFinding[];
  /** Map of toolId → "Tool Name (Plan)" for plan comparison display */
  toolPlanMap?: Record<string, string>;
  /** Show top N only; renders a "Show more" toggle */
  initialVisible?: number;
  onDismiss?: (id: string) => void;
}

export function RecommendationList({
  findings,
  toolPlanMap = {},
  initialVisible = 5,
  onDismiss,
}: RecommendationListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? findings : findings.slice(0, initialVisible);
  const hidden = findings.length - initialVisible;

  if (findings.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-12 rounded-2xl text-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-3xl">🎉</span>
        <p className="text-sm font-semibold text-foreground">No recommendations</p>
        <p className="text-xs text-muted-foreground">Your AI tool stack is well-optimised.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((f, i) => (
        <RecommendationCard
          key={f.id}
          finding={f}
          rank={i + 1}
          currentPlan={toolPlanMap[f.toolId ?? ""] ?? f.toolName}
          onDismiss={onDismiss}
        />
      ))}

      {!showAll && hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200
            hover:brightness-110 hover:scale-[1.01]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--muted-foreground)",
          }}
        >
          Show {hidden} more recommendation{hidden !== 1 ? "s" : ""} ↓
        </button>
      )}

      {showAll && findings.length > initialVisible && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200
            hover:brightness-110"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--muted-foreground)",
          }}
        >
          Show less ↑
        </button>
      )}
    </div>
  );
}
