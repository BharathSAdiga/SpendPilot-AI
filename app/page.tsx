import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                SpendPilot AI
              </span>
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a className="transition-colors hover:text-foreground/80 text-foreground" href="/dashboard">
                Dashboard
              </a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/reports">
                Reports
              </a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/settings">
                Settings
              </a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Search or command palette placeholder */}
            </div>
            <nav className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4">
            <a
              className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
              href="#"
            >
              🎉 <span className="sm:hidden">New Features</span>
              <span className="hidden sm:inline">Introducing AI-Powered Audit Workflows</span>
            </a>
            <h1 className="font-sans text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Optimize your SaaS spend with AI.
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Automatically track, audit, and optimize your company's software expenses.
              Get actionable insights and save money in minutes.
            </p>
            <div className="space-x-4 mt-6">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8">
                Start Free Trial
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground h-11 px-8">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="container mx-auto px-4 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-sans text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Powerful Analytics
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Gain deep visibility into your software stack. Find redundant tools, unused licenses, and negotiation opportunities.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-8">
            <div className="relative overflow-hidden rounded-lg border border-border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6 bg-muted/50">
                <div className="space-y-2">
                  <h3 className="font-bold">Automated Discovery</h3>
                  <p className="text-sm text-muted-foreground">Find all shadow IT and unmanaged expenses instantly.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6 bg-muted/50">
                <div className="space-y-2">
                  <h3 className="font-bold">Usage Tracking</h3>
                  <p className="text-sm text-muted-foreground">Connect with your SSO to track actual seat utilization.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6 bg-muted/50">
                <div className="space-y-2">
                  <h3 className="font-bold">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">Get notified before renewals and when usage drops.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 md:px-8 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <a href="#" className="font-medium underline underline-offset-4">SpendPilot</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
