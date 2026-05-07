import React, { use } from "react";

export default function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1200px]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Audit Report: <span className="text-muted-foreground font-normal">{slug}</span></h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <button className="premium-btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export PDF
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Summary Cards */}
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Spend</h3>
            <div className="text-3xl font-bold mt-3 text-foreground">$45,231.00</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              +20.1% from last month
            </p>
          </div>
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
            <div className="text-3xl font-bold mt-3 text-foreground">124</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              +4 new this month
            </p>
          </div>
          <div className="glass-card p-6 relative overflow-hidden group border-red-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Wasted Spend</h3>
            <div className="text-3xl font-bold mt-3 text-red-500">$3,420.50</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              Unused licenses detected
            </p>
          </div>
          <div className="glass-card p-6 relative overflow-hidden group border-green-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Optimization Potential</h3>
            <div className="text-3xl font-bold mt-3 text-green-500">$8,900.00</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
              Via downgrades & consolidation
            </p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border/40 bg-white/5">
            <h3 className="font-semibold text-lg text-foreground">Top Applications by Spend</h3>
          </div>
          <div className="p-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between p-4 rounded-md hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-500">SF</div>
                  <div>
                    <p className="font-medium text-foreground">Salesforce</p>
                    <p className="text-xs text-muted-foreground mt-1">CRM • 85 seats</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">$12,750.00/mo</p>
                  <p className="text-xs text-red-500 mt-1 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 5 unused seats</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-sm text-orange-500">AWS</div>
                  <div>
                    <p className="font-medium text-foreground">Amazon Web Services</p>
                    <p className="text-xs text-muted-foreground mt-1">Infrastructure</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">$8,430.25/mo</p>
                  <p className="text-xs text-green-500 mt-1 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Optimized</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-md hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-sm text-indigo-500">ZM</div>
                  <div>
                    <p className="font-medium text-foreground">Zoom</p>
                    <p className="text-xs text-muted-foreground mt-1">Video Conferencing • 120 seats</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">$2,400.00/mo</p>
                  <p className="text-xs text-red-500 mt-1 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 22 unused seats</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
