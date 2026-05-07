import React from "react";

export default function AuditPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Run Spend Audit</h1>
        <p className="text-muted-foreground">
          Connect your SSO provider or upload CSV exports to analyze your software stack.
        </p>
        
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* File Upload / Connection Cards Placeholder */}
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center min-h-[200px] text-center gap-4">
            <h3 className="font-semibold text-lg">Connect Google Workspace</h3>
            <p className="text-sm text-muted-foreground">Sync users and app access automatically.</p>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-2">
              Connect
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center min-h-[200px] text-center gap-4">
            <h3 className="font-semibold text-lg">Connect Okta</h3>
            <p className="text-sm text-muted-foreground">Sync enterprise directory and applications.</p>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mt-2">
              Connect
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center min-h-[200px] text-center gap-4">
            <h3 className="font-semibold text-lg">Upload CSV</h3>
            <p className="text-sm text-muted-foreground">Manually upload accounting software exports.</p>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground h-9 px-4 py-2 mt-2">
              Select File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
