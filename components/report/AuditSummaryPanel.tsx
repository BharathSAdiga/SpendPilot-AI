"use client";

/**
 * components/report/AuditSummaryPanel.tsx
 *
 * Renders the AI-generated executive summary panel in the audit report.
 * Surfaces a "Generate AI Summary" button that calls the hook once, then
 * displays the three-section structured output from Claude.
 */

import React from "react";
import type { AuditResult } from "@/types/auditEngine";
import type { AuditSummaryResult } from "@/types/aiSummary";
import { useAuditSummary } from "@/hooks/useAuditSummary";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden>
      <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.7.7M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-label="Generating summary…" role="status">
      <div className="h-4 rounded-lg w-3/4" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div className="h-4 rounded-lg w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="h-4 rounded-lg w-5/6" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="flex flex-col gap-2 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full shrink-0" style={{ background: "rgba(16,185,129,0.15)" }} />
            <div className="h-3 rounded w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
        ))}
      </div>
      <div className="h-3 rounded-lg w-2/3 mt-1" style={{ background: "rgba(255,255,255,0.04)" }} />
    </div>
  );
}

// ─── Generated summary display ────────────────────────────────────────────────

function SummaryDisplay({ summary }: { summary: AuditSummaryResult }) {
  const date = new Date(summary.generatedAt).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Executive overview */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
          Executive Overview
        </h4>
        <p className="text-sm text-foreground leading-relaxed font-medium">
          {summary.executive}
        </p>
      </div>

      {/* Top actions */}
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Priority Actions
        </h4>
        <ul className="flex flex-col gap-2.5" role="list">
          {summary.topActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
              >
                <CheckIcon />
              </span>
              <span className="text-sm text-foreground leading-snug">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 90-day outlook */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{
          background: "rgba(139,92,246,0.07)",
          border: "1px solid rgba(139,92,246,0.18)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 mt-0.5" aria-hidden>
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: "#a78bfa" }}>
            90-Day Outlook
          </h4>
          <p className="text-sm text-foreground leading-snug">{summary.outlook}</p>
        </div>
      </div>

      {/* Meta footer */}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 border-t text-[10px] text-muted-foreground"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span>Generated {date}</span>
        <span>·</span>
        <span>{summary.model}</span>
        {!summary.isFallback && (
          <>
            <span>·</span>
            <span>{summary.inputTokens + summary.outputTokens} tokens used</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface AuditSummaryPanelProps {
  result: AuditResult;
}

export function AuditSummaryPanel({ result }: AuditSummaryPanelProps) {
  const { state, summary, loading, error, generate, reset } = useAuditSummary();

  return (
    <section
      className="relative flex flex-col gap-5 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
      }}
      aria-labelledby="ai-summary-heading"
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
        style={{ background: "rgba(139,92,246,0.08)" }}
        aria-hidden
      />

      {/* Header */}
      <div
        className="relative flex items-center justify-between gap-3 px-6 pt-6 pb-0"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.14)", color: "#a78bfa" }}
          >
            <SparkleIcon />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="ai-summary-heading" className="text-sm font-bold text-foreground">AI Audit Summary</h3>
              {summary?.isFallback && (
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded text-yellow-500 bg-yellow-500/10 border border-yellow-500/20">
                  Fallback Mode
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {summary?.isFallback 
                ? "Generated locally due to API failure" 
                : "Powered by Claude · Server-generated"}
            </p>
          </div>
        </div>

        {state.status === "success" && (
          <button
            onClick={reset}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:brightness-110"
            style={{
              color: "var(--muted-foreground)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Body */}
      <div className="relative px-6 pb-6">
        {/* Idle: generate button */}
        {state.status === "idle" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-muted-foreground max-w-xs">
              Generate a personalised executive summary with actionable insights
              from your audit findings.
            </p>
            <button
              id="generate-ai-summary-btn"
              onClick={() => generate(result)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold
                transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                color: "#fff",
                boxShadow: "0 4px 20px -4px rgba(139,92,246,0.5)",
              }}
            >
              <SparkleIcon />
              Generate AI Summary
            </button>
          </div>
        )}

        {/* Loading: skeleton */}
        {loading && <SummarySkeleton />}

        {/* Error state */}
        {state.status === "error" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Summary generation failed</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <button
              onClick={() => generate(result)}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all hover:brightness-110"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "var(--foreground)",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Success: display summary */}
        {summary && <SummaryDisplay summary={summary} />}
      </div>
    </section>
  );
}
