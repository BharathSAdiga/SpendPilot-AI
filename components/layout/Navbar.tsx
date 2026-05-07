import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              SpendPilot AI
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/">
              Home
            </Link>
            <Link className="transition-colors hover:text-foreground/80 text-foreground" href="/audit">
              Audit
            </Link>
            <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/report/sample-report">
              Reports
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search Placeholder */}
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/audit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Start Audit
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
