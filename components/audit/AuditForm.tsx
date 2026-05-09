"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auditFormSchema, type AuditFormSchema } from "@/lib/auditSchema";
import { partialAuditFormSchema } from "@/lib/validation";
import {
  USE_CASES,
  USE_CASE_LABELS,
  totalMonthlySpend,
  totalSeats,
  spendPerHead,
  type AuditFormValues,
} from "@/types/audit";
import { useFormPersistence } from "@/hooks";
import { ToolFieldArray } from "./ToolFieldArray";
import type { AuditResult } from "@/types/auditEngine";

// ─── Shared styling helpers ───────────────────────────────────────────────────

function inputCls(hasError?: boolean) {
  return [
    "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-all",
    "bg-[var(--input)] text-[var(--foreground)]",
    "placeholder:text-[var(--muted-foreground)]",
    "focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent",
    hasError
      ? "border-[var(--destructive)]"
      : "border-[var(--border)] hover:border-[var(--muted-foreground)]/50",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");
}

function selectCls(hasError?: boolean) {
  return inputCls(hasError) + " appearance-none cursor-pointer pr-8";
}

// ─── Live summary pill ────────────────────────────────────────────────────────

function SummaryPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-5 py-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)] min-w-[100px] text-center">
      <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
        {label}
      </span>
      <span className="text-lg font-bold text-[var(--foreground)] leading-tight tabular-nums">
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-[var(--muted-foreground)]">{sub}</span>
      )}
    </div>
  );
}

// ─── Field label wrapper ──────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide select-none"
    >
      {children}
      {required && (
        <span className="ml-1 text-[var(--destructive)]" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export interface AuditFormProps {
  /** Optional callback — if omitted the form POSTs to /api/audit directly */
  onSubmit?: (data: AuditFormValues) => void | Promise<void>;
  /** Put the form into loading/saving state */
  isLoading?: boolean;
}

export function AuditForm({ onSubmit, isLoading = false }: AuditFormProps) {
  const router = useRouter();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const methods = useForm<AuditFormSchema>({
    resolver: zodResolver(auditFormSchema),
    mode: "onTouched",
    defaultValues: {
      companyName: "",
      teamSize: undefined,
      primaryUseCase: undefined,
      tools: [
        // Pre-seed one empty row so the form isn't blank
        { tool: "" as any, plan: "" as any, monthlySpend: undefined as any, seats: undefined as any },
      ],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  // ── Draft persistence ────────────────────────────────────────────────────
  const { hasDraft, clearDraft, onSubmitSuccess: clearDraftOnSuccess } =
    useFormPersistence({
      storageKey: "spendpilot:audit-draft",
      form: methods,
      schema: partialAuditFormSchema,
      debounceMs: 600,
    });

  // Live-watch tool rows for the summary strip
  const watchedTools = watch("tools");
  const watchedTeamSize = watch("teamSize");

  const totalSpend = totalMonthlySpend(
    (watchedTools ?? []).map((t) => ({
      ...t,
      monthlySpend: Number(t.monthlySpend) || 0,
      seats: Number(t.seats) || 0,
    }))
  );
  const totalSeatCount = totalSeats(
    (watchedTools ?? []).map((t) => ({
      ...t,
      monthlySpend: Number(t.monthlySpend) || 0,
      seats: Number(t.seats) || 0,
    }))
  );
  const perHead = spendPerHead(
    (watchedTools ?? []).map((t) => ({
      ...t,
      monthlySpend: Number(t.monthlySpend) || 0,
      seats: Number(t.seats) || 0,
    })),
    Number(watchedTeamSize) || 0
  );

  const busy = isSubmitting || isLoading;

  const handleFormSubmit = async (data: AuditFormSchema) => {
    setApiError(null);
    try {
      if (onSubmit) {
        await onSubmit(data as AuditFormValues);
      } else {
        // Default: POST to backend audit API
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? `Server error ${res.status}`);
        }
        const result: AuditResult = await res.json();
        // Store in sessionStorage so the report page can read it
        const id = `${Date.now()}`;
        sessionStorage.setItem(`spendpilot:report:${id}`, JSON.stringify(result));
        setReportId(id);
        clearDraftOnSuccess();
        setSubmitSuccess(true);
        // Navigate to live report
        router.push(`/report/${id}`);
        return;
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return;
    }
    clearDraftOnSuccess();
    setSubmitSuccess(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">

        {/* ── Draft restored banner ── */}
        {hasDraft && !submitSuccess && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <span aria-hidden="true">💾</span>
              <span>Draft restored from your last session.</span>
            </div>
            <button
              type="button"
              onClick={clearDraft}
              aria-label="Discard saved draft"
              className="btn-ghost-destructive rounded-md shrink-0 text-xs !min-h-[36px] !min-w-fit !px-3"
            >
              Discard
            </button>
          </div>
        )}

        {/* ── Header ── */}
        <div className="glass-card px-6 py-5 flex items-start gap-4">
          <span
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]"
            aria-hidden="true"
          >
            <AuditIcon />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              AI Spend Audit
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Add all AI tools your team uses to generate a full spend breakdown
              and identify optimisation opportunities.
            </p>
          </div>
        </div>

        {/* ── Live summary strip ── */}
        {(totalSpend > 0 || totalSeatCount > 0) && (
          <div
            className="flex flex-wrap gap-3 justify-center"
            role="status"
            aria-live="polite"
            aria-label="Live spend summary"
          >
            <SummaryPill
              label="Total / Month"
              value={`$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub="across all tools"
            />
            <SummaryPill
              label="Total Seats"
              value={totalSeatCount.toLocaleString()}
              sub="licensed users"
            />
            {perHead !== null && (
              <SummaryPill
                label="Per Head"
                value={`$${perHead.toFixed(2)}`}
                sub="monthly / team member"
              />
            )}
          </div>
        )}

        {/* ── API error banner ── */}
        {apiError && (
          <div role="alert" className="flex items-center gap-3 rounded-xl border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
            <span aria-hidden="true">⚠</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* ── Success state ── */}
        {submitSuccess ? (
          <div
            className="glass-card px-6 py-8 flex flex-col items-center text-center gap-3"
            role="status"
          >
            <span className="text-3xl" aria-hidden="true">✅</span>
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              Audit complete!
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Redirecting you to your report…
            </p>
            {reportId && (
              <a
                href={`/report/${reportId}`}
                className="premium-btn-primary mt-2"
              >
                View Report →
              </a>
            )}
            <button
              type="button"
              onClick={() => { setSubmitSuccess(false); setReportId(null); }}
              className="premium-btn-secondary"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            aria-label="AI spend audit form"
            className="flex flex-col gap-6"
          >
            {/* ── Organisation details ── */}
            <section className="section-card" aria-label="Organisation details">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Organisation Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="companyName" className="field-label">
                    Company Name
                    <span className="ml-1 text-[var(--destructive)]" aria-hidden="true" title="Required">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="Acme Corp"
                    autoComplete="organization"
                    aria-required="true"
                    aria-invalid={!!errors.companyName}
                    disabled={busy}
                    className={errors.companyName ? "form-input-error" : "form-input"}
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <p role="alert" className="text-xs text-[var(--destructive)] flex items-center gap-1">
                      <span aria-hidden="true">⚠</span> {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Team size */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="teamSize" className="field-label">
                    Team Size
                    <span className="ml-1 text-[var(--destructive)]" aria-hidden="true" title="Required">*</span>
                  </label>
                  <div className="relative">
                    <Controller
                      name="teamSize"
                      control={control}
                      render={({ field }) => (
                        <input
                          id="teamSize"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          placeholder="50"
                          aria-required="true"
                          aria-invalid={!!errors.teamSize}
                          disabled={busy}
                          className={`${errors.teamSize ? "form-input-error" : "form-input"} pr-16`}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value, 10)
                            )
                          }
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <span
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] select-none"
                      aria-hidden="true"
                    >
                      people
                    </span>
                  </div>
                  {errors.teamSize && (
                    <p role="alert" className="text-xs text-[var(--destructive)] flex items-center gap-1">
                      <span aria-hidden="true">⚠</span> {errors.teamSize.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Primary use case */}
              <div className="flex flex-col gap-2">
                <label htmlFor="primaryUseCase" className="field-label">
                  Primary Use Case
                  <span className="ml-1 text-[var(--destructive)]" aria-hidden="true" title="Required">*</span>
                </label>
                <div className="relative">
                  <select
                    id="primaryUseCase"
                    aria-required="true"
                    aria-invalid={!!errors.primaryUseCase}
                    disabled={busy}
                    className={errors.primaryUseCase ? "form-select-error" : "form-select"}
                    {...register("primaryUseCase")}
                  >
                    <option value="">Select your team’s main use case…</option>
                    {USE_CASES.map((uc) => (
                      <option key={uc} value={uc}>
                        {USE_CASE_LABELS[uc]}
                      </option>
                    ))}
                  </select>
                  <span
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                {errors.primaryUseCase && (
                  <p role="alert" className="text-xs text-[var(--destructive)] flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.primaryUseCase.message}
                  </p>
                )}
              </div>
            </section>

            {/* ── Divider ── */}
            <div className="border-t border-[var(--border)]" aria-hidden="true" />

            {/* ── Dynamic tool rows ── */}
            <ToolFieldArray maxTools={20} />

            {/* ── Divider ── */}
            <div className="border-t border-[var(--border)]" aria-hidden="true" />

            {/* ── Submit ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="premium-btn-primary w-full sm:w-auto sm:min-w-[200px]"
              >
                {busy ? (
                  <>
                    <SpinnerIcon />
                    Analysing…
                  </>
                ) : (
                  <>
                    <AuditIcon size={14} />
                    Run Spend Audit
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </FormProvider>
  );
}

// ─── Micro icons ──────────────────────────────────────────────────────────────

function AuditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 3h12v10H2V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="animate-spin">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M12 7a5 5 0 00-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
