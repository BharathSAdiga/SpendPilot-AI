"use client";

import React, { useCallback, useState } from "react";
import { FormField } from "./FormField";
import type {
  SubscriptionEntry,
  SubscriptionFormProps,
  SubscriptionPlan,
  SubscriptionValidationErrors,
} from "@/types/subscription";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_OPTIONS: { value: SubscriptionPlan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
  { value: "custom", label: "Custom / Negotiated" },
];

const POPULAR_TOOLS = [
  "ChatGPT",
  "GitHub Copilot",
  "Cursor",
  "Midjourney",
  "Notion AI",
  "Grammarly",
  "Jasper",
  "Runway",
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values: Partial<SubscriptionEntry>): SubscriptionValidationErrors {
  const errors: SubscriptionValidationErrors = {};

  const toolName = values.toolName?.trim() ?? "";
  if (!toolName) {
    errors.toolName = "Tool name is required.";
  } else if (toolName.length < 2) {
    errors.toolName = "Tool name must be at least 2 characters.";
  } else if (toolName.length > 60) {
    errors.toolName = "Tool name must be 60 characters or fewer.";
  }

  if (!values.plan) {
    errors.plan = "Select a billing plan.";
  }

  const spend = Number(values.monthlySpend);
  if (values.monthlySpend === undefined || values.monthlySpend === null || isNaN(spend)) {
    errors.monthlySpend = "Monthly spend is required.";
  } else if (spend < 0) {
    errors.monthlySpend = "Monthly spend cannot be negative.";
  } else if (spend > 1_000_000) {
    errors.monthlySpend = "Monthly spend seems too high — max $1,000,000.";
  }

  const seats = Number(values.seats);
  if (values.seats === undefined || values.seats === null || isNaN(seats)) {
    errors.seats = "Number of seats is required.";
  } else if (!Number.isInteger(seats) || seats < 1) {
    errors.seats = "Seats must be a whole number of at least 1.";
  } else if (seats > 9999) {
    errors.seats = "Maximum 9,999 seats supported.";
  }

  return errors;
}

function isEmpty(errors: SubscriptionValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SubscriptionForm({
  defaultValues,
  onSubmit,
  onCancel,
  externalErrors,
  submitLabel = "Add Subscription",
  isLoading = false,
  className = "",
}: SubscriptionFormProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [values, setValues] = useState<Partial<SubscriptionEntry>>({
    toolName: "",
    plan: undefined,
    monthlySpend: undefined,
    seats: undefined,
    ...defaultValues,
  });

  const [touched, setTouched] = useState<
    Partial<Record<keyof SubscriptionEntry, boolean>>
  >({});

  const [submitted, setSubmitted] = useState(false);

  // Merge internal validation + external server errors
  const internalErrors = validate(values);
  const activeErrors: SubscriptionValidationErrors = {
    ...internalErrors,
    ...externalErrors,
  };

  // Only surface errors for fields that have been touched OR after submit
  const visibleErrors: SubscriptionValidationErrors = {};
  (Object.keys(activeErrors) as (keyof SubscriptionEntry)[]).forEach((key) => {
    if (submitted || touched[key]) {
      visibleErrors[key] = activeErrors[key];
    }
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof SubscriptionEntry>(field: K, value: SubscriptionEntry[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBlur = useCallback((field: keyof SubscriptionEntry) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ toolName: true, plan: true, monthlySpend: true, seats: true });

    if (!isEmpty(internalErrors)) return;

    onSubmit({
      toolName: values.toolName!.trim(),
      plan: values.plan!,
      monthlySpend: Number(values.monthlySpend),
      seats: Number(values.seats),
    });
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const costPerSeat =
    values.monthlySpend && values.seats && Number(values.seats) > 0
      ? (Number(values.monthlySpend) / Number(values.seats)).toFixed(2)
      : null;

  const isDisabled = isLoading;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={[
        // Glass card using the project's existing design tokens
        "glass-card",
        "w-full max-w-lg",
        "p-6 sm:p-8",
        className,
      ]
        .join(" ")
        .trim()}
      aria-label="AI tool subscription form"
    >
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] shrink-0"
              aria-hidden="true"
            >
              <SparkleIcon />
            </span>
            <h2 className="text-base font-semibold text-[var(--foreground)] leading-tight">
              AI Tool Subscription
            </h2>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] ml-10">
            Track spend and seat usage for your AI tools.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
            aria-label="Cancel and close form"
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors disabled:opacity-40"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* ── Form ── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Subscription entry form"
        className="flex flex-col gap-5"
      >
        {/* Tool Name */}
        <FormField
          as="input"
          id="sub-tool-name"
          label="Tool Name"
          required
          placeholder="e.g. ChatGPT, GitHub Copilot"
          value={values.toolName ?? ""}
          disabled={isDisabled}
          autoComplete="off"
          list="popular-tools"
          error={visibleErrors.toolName}
          hint="Enter the name of the AI tool or service."
          onChange={(e) => setField("toolName", e.target.value)}
          onBlur={() => handleBlur("toolName")}
        />

        {/* Datalist for tool name suggestions */}
        <datalist id="popular-tools">
          {POPULAR_TOOLS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        {/* Plan */}
        <FormField
          as="select"
          id="sub-plan"
          label="Billing Plan"
          required
          value={values.plan ?? ""}
          disabled={isDisabled}
          error={visibleErrors.plan}
          onChange={(e) =>
            setField("plan", e.target.value as SubscriptionPlan)
          }
          onBlur={() => handleBlur("plan")}
        >
          <option value="" disabled>
            Select a plan…
          </option>
          {PLAN_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FormField>

        {/* Monthly Spend + Seats — side by side on ≥sm */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Monthly Spend */}
          <FormField
            as="input"
            id="sub-monthly-spend"
            label="Monthly Spend"
            required
            type="number"
            inputMode="decimal"
            min={0}
            max={1000000}
            step={0.01}
            placeholder="0.00"
            prefix="$"
            value={values.monthlySpend ?? ""}
            disabled={isDisabled}
            error={visibleErrors.monthlySpend}
            hint="USD per month, e.g. 20.00"
            onChange={(e) =>
              setField(
                "monthlySpend",
                e.target.value === "" ? (undefined as unknown as number) : Number(e.target.value)
              )
            }
            onBlur={() => handleBlur("monthlySpend")}
          />

          {/* Seats */}
          <FormField
            as="input"
            id="sub-seats"
            label="Seats / Licenses"
            required
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            step={1}
            placeholder="1"
            suffix="seats"
            value={values.seats ?? ""}
            disabled={isDisabled}
            error={visibleErrors.seats}
            hint="Number of licensed users"
            onChange={(e) =>
              setField(
                "seats",
                e.target.value === "" ? (undefined as unknown as number) : Number(e.target.value)
              )
            }
            onBlur={() => handleBlur("seats")}
          />
        </div>

        {/* ── Cost-per-seat insight badge ── */}
        {costPerSeat !== null && (
          <div
            className="flex items-center gap-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] px-3 py-2.5"
            role="status"
            aria-live="polite"
            aria-label={`Calculated cost per seat: ${costPerSeat} USD per month`}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shrink-0"
              aria-hidden="true"
            >
              <CalcIcon />
            </span>
            <p className="text-xs text-[var(--muted-foreground)]">
              Cost per seat:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                ${costPerSeat}
              </span>{" "}
              / month
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-[var(--border)]" aria-hidden="true" />

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isDisabled}
              className="premium-btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isDisabled}
            aria-busy={isLoading}
            className="premium-btn-primary w-full sm:w-auto relative"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Saving…
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Micro SVG icons ──────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1l1.5 4H13l-3.5 2.5L11 12 7 9.5 3 12l1.5-4.5L1 5h4.5L7 1z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M1 5h8M5 1v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="7"
        cy="7"
        r="5"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M12 7a5 5 0 00-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
