import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block text-foreground">
              SpendPilot AI
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link className="transition-colors hover:text-foreground text-muted-foreground" href="/">
              Home
            </Link>
            <Link className="transition-colors hover:text-foreground text-foreground" href="/audit">
              Audit
            </Link>
            <Link className="transition-colors hover:text-foreground text-muted-foreground" href="/report/sample-report">
              Reports
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search Placeholder */}
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/audit" className="premium-btn-primary">
              Start Audit
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
