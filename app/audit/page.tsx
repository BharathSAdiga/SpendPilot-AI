import React from "react";

export default function AuditPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-[1000px]">
      <div className="flex flex-col gap-4 text-center md:text-left mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Run Spend Audit</h1>
        <p className="text-muted-foreground text-lg max-w-[600px]">
          Connect your SSO provider or upload CSV exports to instantly analyze your entire software stack and uncover wasted spend.
        </p>
      </div>
        
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[240px] text-center gap-5 group hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="M17.78 5.672A10.02 10.02 0 0 0 12 4c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10a9.962 9.962 0 0 0-2.22-6.328"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Google Workspace</h3>
            <p className="text-sm text-muted-foreground mt-2">Sync users and app access automatically.</p>
          </div>
          <button className="premium-btn-primary w-full mt-2">
            Connect
          </button>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[240px] text-center gap-5 group hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Okta</h3>
            <p className="text-sm text-muted-foreground mt-2">Sync enterprise directory and applications.</p>
          </div>
          <button className="premium-btn-primary w-full mt-2">
            Connect
          </button>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[240px] text-center gap-5 group hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Upload CSV</h3>
            <p className="text-sm text-muted-foreground mt-2">Manually upload accounting software exports.</p>
          </div>
          <button className="premium-btn-secondary w-full mt-2">
            Select File
          </button>
        </div>
      </div>
    </div>
  );
}
