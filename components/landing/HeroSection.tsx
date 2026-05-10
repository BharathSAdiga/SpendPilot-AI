"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      setValue(Math.round(easeOutExpo(t) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, start]);
  return value;
}

// ─── Intersection observer ────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
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

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
const SPARK = [18, 22, 19, 30, 28, 42, 38, 55, 52, 67, 71, 89];
function Sparkline({ color, started }: { color: string; started: boolean }) {
  const W = 120, H = 40;
  const min = Math.min(...SPARK), max = Math.max(...SPARK);
  const pts = SPARK.map((v, i) => {
    const x = (i / (SPARK.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H * 0.8 - H * 0.1;
    return `${x},${y}`;
  }).join(" ");
  const filled = `${pts} ${W},${H} 0,${H}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`sc-${color.replace("#", "")}`}>
          <rect x="0" y="0" width={started ? W : 0} height={H}
            style={{ transition: "width 1.6s cubic-bezier(0.16,1,0.3,1)" }} />
        </clipPath>
      </defs>
      <g clipPath={`url(#sc-${color.replace("#", "")})`}>
        <polyline points={filled} fill={`url(#sg-${color.replace("#", "")})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ─── ROI breakdown row ────────────────────────────────────────────────────────
function RoiRow({ tool, saving, pct, color }: { tool: string; saving: string; pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 400);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium text-muted-foreground w-20 shrink-0 truncate">{tool}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: color,
            transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
      <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color }}>{saving}</span>
    </div>
  );
}

// ─── Savings card ─────────────────────────────────────────────────────────────
interface CardProps {
  label: string;
  sublabel: string;
  amount: number;
  period: string;
  accent: "emerald" | "violet";
  started: boolean;
  delay?: number;
  roiRows: { tool: string; saving: string; pct: number }[];
}

function SavingsCard({ label, sublabel, amount, period, accent, started, delay = 0, roiRows }: CardProps) {
  const counted = useCountUp(amount, 1800 + delay, started);
  const isEm = accent === "emerald";

  const grad = isEm
    ? "linear-gradient(135deg,#34d399 0%,#10b981 50%,#059669 100%)"
    : "linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 50%,#6d28d9 100%)";

  const glow = isEm ? "rgba(16,185,129,0.14)" : "rgba(139,92,246,0.14)";
  const border = isEm ? "rgba(16,185,129,0.22)" : "rgba(139,92,246,0.22)";
  const dotClr = isEm ? "#10b981" : "#8b5cf6";
  const spark = isEm ? "#34d399" : "#a78bfa";
  const badgeStyle = isEm
    ? { background: "rgba(16,185,129,0.10)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }
    : { background: "rgba(139,92,246,0.10)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" };

  const rowColors = isEm
    ? ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]
    : ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

  return (
    <div
      className="relative flex flex-col gap-5 rounded-2xl p-6 overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: `1px solid ${border}`,
        boxShadow: `0 0 0 1px ${border}, 0 16px 48px -12px ${glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Animated glow orb */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[60px] pointer-events-none
          group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: glow, opacity: 0.7 }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full" style={badgeStyle}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <Sparkline color={spark} started={started} />
          <span className="flex items-center gap-1.5 text-[11px] font-semibold ml-2" style={{ color: dotClr }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: dotClr }} />
            Live
          </span>
        </div>
      </div>

      {/* Counter */}
      <div className="relative z-10">
        <div
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tabular-nums leading-none tracking-tight"
          style={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          {fmt(counted)}
        </div>
        <span
          className="text-sm font-semibold mt-1 block"
          style={{ color: dotClr, opacity: 0.7 }}
        >
          per {period} · avg across all audits
        </span>
      </div>

      {/* Sub-label */}
      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{sublabel}</p>

      {/* ROI breakdown */}
      <div className="relative z-10 flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">Top savings sources</p>
        {roiRows.map((r, i) => (
          <RoiRow key={r.tool} tool={r.tool} saving={r.saving} pct={r.pct} color={rowColors[i % rowColors.length]} />
        ))}
      </div>

      {/* Bottom progress bar */}
      <div className="relative z-10 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: started ? "100%" : "0%",
            background: grad,
            transition: "width 2s cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Floating tool badge ──────────────────────────────────────────────────────
function ToolBadge({
  name, saving, x, y, delay,
}: { name: string; saving: string; x: string; y: string; delay: string }) {
  return (
    <div
      className="absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
        pointer-events-none select-none"
      style={{
        left: x, top: y,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        animation: `float 6s ease-in-out ${delay} infinite`,
        color: "#a1a1aa",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>{name}</span>
      <span className="text-emerald-400 font-bold">{saving}</span>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[130px] group
        hover:scale-[1.03] transition-transform duration-200 cursor-default"
      style={{
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span className="shrink-0" style={{ color: accent }}>{icon}</span>
      <div>
        <p className="text-sm font-bold text-foreground leading-none tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Gradient headline word ───────────────────────────────────────────────────
function GW({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: "linear-gradient(135deg,#34d399 0%,#10b981 45%,#8b5cf6 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}>
      {children}
    </span>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function HeroSection() {
  const { ref, inView } = useInView(0.08);

  return (
    <>
      {/* Float keyframe */}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes hero-fade-up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .hero-appear { animation: hero-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <section
        ref={ref}
        className="relative w-full overflow-hidden"
        aria-label="SpendPilot AI — hero section"
      >
        {/* ── Ambient mesh ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Primary emerald glow */}
          <div className="absolute -top-40 -left-20 w-[700px] h-[700px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(circle,rgba(16,185,129,0.10) 0%,transparent 70%)" }} />
          {/* Violet glow */}
          <div className="absolute -top-20 right-[-15%] w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 70%)" }} />
          {/* Blue center */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%)" }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }} />
        </div>

        {/* Floating tool cost badges */}
        <ToolBadge name="ChatGPT Team" saving="-$1,200/yr" x="3%" y="22%" delay="0s" />
        <ToolBadge name="GitHub Copilot" saving="-$960/yr" x="80%" y="18%" delay="1.2s" />
        <ToolBadge name="Notion AI" saving="-$480/yr" x="85%" y="55%" delay="2.4s" />
        <ToolBadge name="Midjourney" saving="-$720/yr" x="2%" y="62%" delay="0.8s" />

        <div className="relative z-10 container mx-auto px-4 pt-20 pb-14 md:pt-28 md:pb-20 max-w-[1100px]">

          {/* ── Top pill ── */}
          <div className="flex justify-center mb-8 hero-appear" style={{ animationDelay: "0ms" }}>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold
                transition-all duration-200 hover:scale-105 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(139,92,246,0.08))",
                border: "1px solid rgba(16,185,129,0.28)",
                color: "#34d399",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#10b981" }} />
              New — AI Spend Intelligence v2 is live
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* ── Headline ── */}
          <div className="text-center mb-6 hero-appear" style={{ animationDelay: "80ms" }}>
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.07] text-foreground">
              Stop burning cash on<br className="hidden md:block" />
              <GW> AI tools you don&apos;t use.</GW>
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
              SpendPilot audits your entire AI subscription stack in{" "}
              <span className="text-foreground font-semibold">under 5 minutes</span>.
              Eliminate waste. Keep what works. Keep your CFO happy.
            </p>
          </div>

          {/* ── CTA row ── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 mb-12 hero-appear"
            style={{ animationDelay: "160ms" }}
          >
            <Link
              href="/audit"
              id="hero-cta-primary"
              className="group inline-flex items-center gap-2 h-12 px-8 rounded-xl text-sm font-bold
                transition-all duration-200 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                color: "#ffffff",
                boxShadow: "0 4px 24px -4px rgba(16,185,129,0.5), 0 0 0 1px rgba(16,185,129,0.3)",
              }}
            >
              Run Free Audit
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
                className="group-hover:translate-x-0.5 transition-transform duration-150">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/report/demo"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-sm font-semibold
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--foreground)",
                backdropFilter: "blur(8px)",
              }}
            >
              View Sample Report
            </Link>
          </div>

          {/* ── Savings cards ── */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 hero-appear"
            style={{ animationDelay: "240ms" }}
          >
            <SavingsCard
              label="Monthly Savings"
              sublabel="Average hard-dollar savings identified per audit — recoverable within 30 days"
              amount={8900}
              period="month"
              accent="emerald"
              started={inView}
              roiRows={[
                { tool: "ChatGPT", saving: "$1.8K", pct: 82 },
                { tool: "GitHub Copilot", saving: "$1.2K", pct: 68 },
                { tool: "Notion AI", saving: "$940", pct: 55 },
                { tool: "Midjourney", saving: "$620", pct: 38 },
              ]}
            />
            <SavingsCard
              label="Annual Savings"
              sublabel="Compounded 12-month value from redundant licenses, unused seats & right-sizing"
              amount={106800}
              period="year"
              accent="violet"
              started={inView}
              delay={200}
              roiRows={[
                { tool: "Seat Rightsizing", saving: "$42K", pct: 90 },
                { tool: "Overlap Removal", saving: "$28K", pct: 72 },
                { tool: "Plan Downgrades", saving: "$21K", pct: 60 },
                { tool: "Shadow IT", saving: "$15K", pct: 45 },
              ]}
            />
          </div>

          {/* ── Mini stats row ── */}
          <div
            className="flex flex-wrap gap-3 justify-center md:justify-stretch hero-appear"
            style={{ animationDelay: "320ms" }}
          >
            <StatChip
              accent="#10b981"
              value="2,400+"
              label="Teams audited"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <StatChip
              accent="#8b5cf6"
              value="$24M+"
              label="Total savings found"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
              }
            />
            <StatChip
              accent="#3b82f6"
              value="< 5 min"
              label="Avg audit time"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <StatChip
              accent="#f59e0b"
              value="98.7%"
              label="Accuracy rate"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            />
          </div>

          {/* ── Trust strip ── */}
          <div className="mt-10 flex flex-col items-center gap-4 hero-appear" style={{ animationDelay: "400ms" }}>
            {/* Divider */}
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold whitespace-nowrap">
                Trusted by teams at
              </p>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {["Notion", "Linear", "Vercel", "Supabase", "PlanetScale"].map((name) => (
                <span
                  key={name}
                  className="text-sm font-bold tracking-tight"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Social proof line */}
            <div className="flex items-center gap-2 mt-1">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {["#10b981", "#8b5cf6", "#3b82f6", "#f59e0b"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: c, borderColor: "var(--background)", zIndex: 4 - i }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">140+ teams</span> ran an audit this week
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
