"use client";

import React, { useEffect, useState } from "react";
import type { AuditResult } from "@/types/auditEngine";
import { LiveReport, NotFoundState } from "./components";

export function ClientFallback({ slug }: { slug: string }) {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(`spendpilot:report:${slug}`);
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to parse local report", err);
      }
    }
    setLoading(false);
  }, [slug]);

  if (loading) return null; // Or a skeleton
  if (!result) return <NotFoundState slug={slug} />;
  
  return (
    <>
      {(result as any).fallbackMode && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-yellow-500 text-sm font-medium">
          Local preview only — sharing disabled. (Backend persistence failed)
        </div>
      )}
      <LiveReport result={result} isPublic={false} />
    </>
  );
}
