import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <section className="relative z-10 space-y-6 pb-8 pt-16 md:pb-12 md:pt-24 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center mx-auto px-4">
          <Link
            className="inline-flex items-center rounded-full border border-border bg-background/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            href="/audit"
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
            <span className="sm:hidden">New Features</span>
            <span className="hidden sm:inline">Introducing AI-Powered Audit Workflows</span>
          </Link>
          <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gradient">
            Optimize your SaaS spend with AI.
          </h1>
          <p className="max-w-[42rem] leading-relaxed text-muted-foreground sm:text-xl sm:leading-8">
            Automatically track, audit, and optimize your company's software expenses.
            Get actionable insights and save money in minutes.
          </p>
          <div className="space-x-4 mt-8 flex items-center">
            <Link href="/audit" className="premium-btn-primary h-12 px-8 text-base">
              Start Free Trial
            </Link>
            <Link href="/report/demo" className="premium-btn-secondary h-12 px-8 text-base">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24 lg:py-32 border-t border-border/50 mt-8">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-sans text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl text-foreground">
            Powerful Analytics
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Gain deep visibility into your software stack. Find redundant tools, unused licenses, and negotiation opportunities.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-12">
          <div className="glass-card p-6 h-[200px] flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 className="font-bold text-foreground">Automated Discovery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Find all shadow IT and unmanaged expenses instantly with intelligent scanning.</p>
            </div>
          </div>
          <div className="glass-card p-6 h-[200px] flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <h3 className="font-bold text-foreground">Usage Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Connect with your SSO to track actual seat utilization and active engagement.</p>
            </div>
          </div>
          <div className="glass-card p-6 h-[200px] flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              <h3 className="font-bold text-foreground">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Get notified before renewals and when usage drops below expected thresholds.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
