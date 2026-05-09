"use client";

import React from "react";
import {
  useFormContext,
  useFieldArray,
  Controller,
  useWatch,
  type FieldError,
} from "react-hook-form";
import type { AuditFormSchema } from "@/lib/auditSchema";
import { AI_TOOLS } from "@/types/audit";
import { PRICING_REGISTRY } from "@/data/pricingConfig";

// ─── Sub-component: labelled field wrapper ────────────────────────────────────

interface FieldWrapProps {
  label: string;
  htmlFor?: string;
  error?: FieldError;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

function FieldWrap({ label, htmlFor, error, children, required, className = "" }: FieldWrapProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && (
          <span className="ml-1 text-[var(--destructive)]" aria-hidden="true" title="Required">*</span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-[var(--destructive)] font-medium leading-snug">
          <span aria-hidden="true">⚠</span> {error.message}
        </p>
      )}
    </div>
  );
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
    setValue,
    formState: { errors },
  } = useFormContext<AuditFormSchema>();

  const rowErrors = errors.tools?.[index];

  // Watch the selected tool to dynamically update plan options
  const selectedTool = useWatch({ control, name: `tools.${index}.tool` });
  const registryEntry = selectedTool
    ? PRICING_REGISTRY[selectedTool as keyof typeof PRICING_REGISTRY]
    : null;
  const availablePlans = registryEntry?.plans ?? [];

  return (
    <div
      className="glass-card p-4 sm:p-5 flex flex-col gap-4 relative group"
      aria-label={`Tool entry ${index + 1}`}
    >
      {/* Row header: number badge + remove */}
      <div className="flex items-center justify-between gap-2">
        <span className="field-label">Tool #{index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove tool ${index + 1}`}
            className="btn-ghost-destructive rounded-md text-xs"
          >
            <RemoveIcon />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Tool + Plan — 2 columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tool selector */}
        <FieldWrap label="AI Tool" htmlFor={`tools.${index}.tool`} error={rowErrors?.tool} required>
          <div className="relative">
            <select
              id={`tools.${index}.tool`}
              {...register(`tools.${index}.tool`, {
                onChange: () => {
                  // Reset plan when tool changes — stale plan IDs from previous tool
                  // won't match the new tool's registry entry and would silently fail
                  setValue(`tools.${index}.plan`, "" as any, { shouldValidate: false });
                },
              })}
              aria-invalid={!!rowErrors?.tool}
              className={rowErrors?.tool ? "form-select-error" : "form-select"}
            >
              <option value="">Select tool…</option>
              {AI_TOOLS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </FieldWrap>

        {/* Plan selector — driven by PRICING_REGISTRY for the selected tool */}
        <FieldWrap label="Billing Plan" htmlFor={`tools.${index}.plan`} error={rowErrors?.plan} required>
          <div className="relative">
            <select
              id={`tools.${index}.plan`}
              {...register(`tools.${index}.plan`)}
              aria-invalid={!!rowErrors?.plan}
              className={rowErrors?.plan ? "form-select-error" : "form-select"}
              disabled={!selectedTool}
            >
              <option value="">
                {selectedTool ? "Select plan…" : "Select a tool first…"}
              </option>
              {availablePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.pricing.model === "flat_rate"
                    ? ` — $${p.pricing.pricePerSeatMonthly}/seat/mo`
                    : p.pricing.model === "custom"
                    ? " — Custom pricing"
                    : " — Usage-based"}
                </option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </FieldWrap>
      </div>

      {/* Spend + Seats — 2 columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly spend */}
        <FieldWrap
          label="Monthly Spend (USD)"
          htmlFor={`tools.${index}.monthlySpend`}
          error={rowErrors?.monthlySpend}
          required
        >
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm select-none"
              aria-hidden="true"
            >
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
                  className={`${rowErrors?.monthlySpend ? "form-input-error" : "form-input"} pl-8`}
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
        <FieldWrap
          label="Seats / Licenses"
          htmlFor={`tools.${index}.seats`}
          error={rowErrors?.seats}
          required
        >
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
                  className={`${rowErrors?.seats ? "form-input-error" : "form-input"} pr-14`}
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
            <span
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs select-none"
              aria-hidden="true"
            >
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

  function addEmptyTool() {
    append({
      tool: "" as any,
      plan: "" as any,
      monthlySpend: undefined as any,
      seats: undefined as any,
    });
  }

  return (
    <section aria-label="AI tools list" className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">AI Tools</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {fields.length} of {maxTools} added
          </p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={addEmptyTool}
            className="premium-btn-secondary !min-h-[40px] !py-1.5 !px-4 text-xs shrink-0"
            aria-label="Add another AI tool"
          >
            <PlusIcon />
            Add Tool
          </button>
        )}
      </div>

      {/* Root-level tools array error */}
      {(errors.tools?.root?.message || typeof errors.tools?.message === "string") && (
        <p role="alert" className="text-xs text-[var(--destructive)] font-medium flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {errors.tools?.root?.message ?? errors.tools?.message}
        </p>
      )}

      {/* Tool rows */}
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <ToolRow key={field.id} index={index} onRemove={remove} canRemove={canRemove} />
        ))}
      </div>

      {/* Repeat add button when list is long (≥3 tools) */}
      {canAdd && fields.length >= 3 && (
        <button
          type="button"
          onClick={addEmptyTool}
          className="premium-btn-secondary !min-h-[40px] !py-1.5 !px-4 text-xs self-start"
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
    <span
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 5l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
