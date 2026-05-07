import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4">
          <Link
            className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
            href="/audit"
          >
            🎉 <span className="sm:hidden">New Features</span>
            <span className="hidden sm:inline">Introducing AI-Powered Audit Workflows</span>
          </Link>
          <h1 className="font-sans text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Optimize your SaaS spend with AI.
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Automatically track, audit, and optimize your company's software expenses.
            Get actionable insights and save money in minutes.
          </p>
          <div className="space-x-4 mt-6">
            <Link href="/audit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8">
              Start Free Trial
            </Link>
            <Link href="/report/demo" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground h-11 px-8">
              View Demo
            </Link>
          </div>
        </div>
      </section>

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
    </div>
  );
}
