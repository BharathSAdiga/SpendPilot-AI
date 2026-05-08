"use client";

import React from "react";
import {
  useFormContext,
  useFieldArray,
  Controller,
  type FieldError,
} from "react-hook-form";
import type { AuditFormSchema } from "@/lib/auditSchema";
import {
  AI_TOOLS,
  PLAN_TIERS,
  PLAN_TIER_LABELS,
} from "@/types/audit";

// ─── Sub-component: labelled field wrapper ────────────────────────────────────

interface FieldWrapProps {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

function FieldWrap({ label, error, children, required, className = "" }: FieldWrapProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide select-none">
        {label}
        {required && <span className="ml-1 text-[var(--destructive)]" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-[var(--destructive)] font-medium">
          <span aria-hidden="true">⚠</span> {error.message}
        </p>
      )}
    </div>
  );
}

// ─── Shared input/select class builders ───────────────────────────────────────

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

// ─── Single tool row ──────────────────────────────────────────────────────────

interface ToolRowProps {
  index: number;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function ToolRow({ index, onRemove, canRemove }: ToolRowProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<AuditFormSchema>();

  const rowErrors = errors.tools?.[index];

  return (
    <div
      className="glass-card p-4 sm:p-5 flex flex-col gap-4 relative group animate-in fade-in slide-in-from-top-2 duration-200"
      aria-label={`Tool entry ${index + 1}`}
    >
      {/* Row number badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
          Tool #{index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove tool ${index + 1}`}
            className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--destructive)]/10"
          >
            <RemoveIcon />
            Remove
          </button>
        )}
      </div>

      {/* Tool + Plan — 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tool selector */}
        <FieldWrap label="AI Tool" error={rowErrors?.tool} required>
          <div className="relative">
            <select
              {...register(`tools.${index}.tool`)}
              aria-invalid={!!rowErrors?.tool}
              className={selectCls(!!rowErrors?.tool)}
            >
              <option value="">Select tool…</option>
              {AI_TOOLS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </FieldWrap>

        {/* Plan selector */}
        <FieldWrap label="Billing Plan" error={rowErrors?.plan} required>
          <div className="relative">
            <select
              {...register(`tools.${index}.plan`)}
              aria-invalid={!!rowErrors?.plan}
              className={selectCls(!!rowErrors?.plan)}
            >
              <option value="">Select plan…</option>
              {PLAN_TIERS.map((p) => (
                <option key={p} value={p}>{PLAN_TIER_LABELS[p]}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </FieldWrap>
      </div>

      {/* Spend + Seats — 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly spend */}
        <FieldWrap label="Monthly Spend (USD)" error={rowErrors?.monthlySpend} required>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm select-none" aria-hidden="true">
              $
            </span>
            <Controller
              name={`tools.${index}.monthlySpend`}
              control={control}
              render={({ field }) => (
                <input
                  id={`tools.${index}.monthlySpend`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  aria-invalid={!!rowErrors?.monthlySpend}
                  className={inputCls(!!rowErrors?.monthlySpend) + " pl-7"}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : parseFloat(e.target.value)
                    )
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </FieldWrap>

        {/* Seats */}
        <FieldWrap label="Seats / Licenses" error={rowErrors?.seats} required>
          <div className="relative">
            <Controller
              name={`tools.${index}.seats`}
              control={control}
              render={({ field }) => (
                <input
                  id={`tools.${index}.seats`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="1"
                  aria-invalid={!!rowErrors?.seats}
                  className={inputCls(!!rowErrors?.seats) + " pr-14"}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : parseInt(e.target.value, 10)
                    )
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs select-none" aria-hidden="true">
              seats
            </span>
          </div>
        </FieldWrap>
      </div>
    </div>
  );
}

// ─── Tool field array (the list + add button) ─────────────────────────────────

interface ToolFieldArrayProps {
  /** Max tools allowed — defaults to 20 */
  maxTools?: number;
}

export function ToolFieldArray({ maxTools = 20 }: ToolFieldArrayProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuditFormSchema>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tools",
  });

  const canAdd = fields.length < maxTools;
  const canRemove = fields.length > 1;

  return (
    <section aria-label="AI tools list" className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            AI Tools
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {fields.length} of {maxTools} tools added
          </p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={() =>
              append({ tool: "" as any, plan: "" as any, monthlySpend: undefined as any, seats: undefined as any })
            }
            className="premium-btn-secondary text-xs h-8 px-3 flex items-center gap-1.5"
            aria-label="Add another AI tool"
          >
            <PlusIcon />
            Add Tool
          </button>
        )}
      </div>

      {/* Root-level tools error (e.g. "Add at least one tool") */}
      {errors.tools?.root?.message && (
        <p role="alert" className="text-xs text-[var(--destructive)] font-medium flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {errors.tools.root.message}
        </p>
      )}
      {typeof errors.tools?.message === "string" && (
        <p role="alert" className="text-xs text-[var(--destructive)] font-medium flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {errors.tools.message}
        </p>
      )}

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <ToolRow
            key={field.id}
            index={index}
            onRemove={remove}
            canRemove={canRemove}
          />
        ))}
      </div>

      {/* Bottom add button when many tools */}
      {canAdd && fields.length >= 3 && (
        <button
          type="button"
          onClick={() =>
            append({ tool: "" as any, plan: "" as any, monthlySpend: undefined as any, seats: undefined as any })
          }
          className="premium-btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 self-start"
          aria-label="Add another AI tool"
        >
          <PlusIcon />
          Add Tool
        </button>
      )}
    </section>
  );
}

// ─── Micro SVG icons ──────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
