import React, { use } from "react";

export default function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15 requires awaiting params
  const { slug } = use(params);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Report: {slug}</h1>
            <p className="text-muted-foreground mt-1">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground h-9 px-4 py-2">
            Export PDF
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Summary Cards */}
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Spend</h3>
            <div className="text-2xl font-bold mt-2">$45,231.00</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
          </div>
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
            <div className="text-2xl font-bold mt-2">124</div>
            <p className="text-xs text-muted-foreground mt-1">+4 new this month</p>
          </div>
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Wasted Spend</h3>
            <div className="text-2xl font-bold mt-2 text-destructive text-red-500">$3,420.50</div>
            <p className="text-xs text-muted-foreground mt-1">Unused licenses detected</p>
          </div>
          <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Optimization Potential</h3>
            <div className="text-2xl font-bold mt-2 text-green-600">$8,900.00</div>
            <p className="text-xs text-muted-foreground mt-1">Via downgrades & consolidation</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm mt-4">
          <div className="p-6">
            <h3 className="font-semibold text-lg">Top Applications by Spend</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold text-xs">SF</div>
                  <div>
                    <p className="font-medium">Salesforce</p>
                    <p className="text-xs text-muted-foreground">CRM • 85 seats</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$12,750.00/mo</p>
                  <p className="text-xs text-red-500">5 unused seats</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold text-xs">AWS</div>
                  <div>
                    <p className="font-medium">Amazon Web Services</p>
                    <p className="text-xs text-muted-foreground">Infrastructure</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$8,430.25/mo</p>
                  <p className="text-xs text-green-500">Optimized</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center font-bold text-xs">ZM</div>
                  <div>
                    <p className="font-medium">Zoom</p>
                    <p className="text-xs text-muted-foreground">Video Conferencing • 120 seats</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2,400.00/mo</p>
                  <p className="text-xs text-red-500">22 unused seats</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
