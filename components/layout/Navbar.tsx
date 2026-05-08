"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/audit", label: "Audit" },
  { href: "/report/sample-report", label: "Reports" },
] as const;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 md:px-6">

        {/* ── Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-foreground text-sm sm:text-base
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                     focus-visible:ring-offset-2 rounded-md"
          aria-label="SpendPilot AI — home"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black"
            aria-hidden="true"
          >
            S
          </span>
          <span className="hidden xs:inline">SpendPilot AI</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  active
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop actions ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
          >
            Log in
          </Link>
          <Link href="/audit" className="premium-btn-primary !min-h-[36px] !py-1.5 !px-4 text-xs sm:text-sm">
            Start Audit
          </Link>
        </div>

        {/* ── Mobile: CTA + hamburger ── */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/audit" className="premium-btn-primary !min-h-[36px] !py-1.5 !px-3 text-xs">
            Audit
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-ghost-sm rounded-md"
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md"
        >
          <ul className="container mx-auto px-4 py-3 flex flex-col gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "flex items-center gap-2 w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "text-foreground bg-accent font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    ].join(" ")}
                  >
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2 border-t border-border/40 mt-1">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center px-3 py-3 rounded-lg text-sm font-medium
                           text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
