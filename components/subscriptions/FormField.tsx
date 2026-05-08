"use client";

import React, { useId } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Prepend a symbol/icon inside the input (e.g. "$") */
  prefix?: React.ReactNode;
  /** Append a symbol/icon inside the input (e.g. "seats") */
  suffix?: React.ReactNode;
  className?: string;
}

export type InputFieldProps = BaseFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
    as?: "input";
  };

export type SelectFieldProps = BaseFieldProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "prefix"> & {
    as: "select";
    children: React.ReactNode;
  };

export type FormFieldProps = InputFieldProps | SelectFieldProps;

// ─── Component ────────────────────────────────────────────────────────────────

export function FormField(props: FormFieldProps) {
  const generatedId = useId();
  const {
    label,
    error,
    hint,
    required,
    prefix,
    suffix,
    className = "",
    as,
    ...rest
  } = props;

  const id = (rest as React.InputHTMLAttributes<HTMLInputElement>).id ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [hint ? hintId : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ") || undefined;

  const hasSidebar = prefix || suffix;

  const sharedInputClasses = [
    "w-full bg-[var(--input)] text-[var(--foreground)] text-sm",
    "border border-[var(--border)] rounded-lg",
    "transition-all duration-150 outline-none",
    "placeholder:text-[var(--muted-foreground)]",
    // Focus ring using the project's --ring token
    "focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent",
    // Error state
    error
      ? "border-[var(--destructive)] focus:ring-[var(--destructive)]"
      : "hover:border-[var(--muted-foreground)]/40",
    // Padding — adjust when there's a prefix/suffix
    hasSidebar ? (prefix ? "pl-9 pr-3 py-2.5" : "pl-3 pr-9 py-2.5") : "px-3 py-2.5",
    // Disabled styles
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--foreground)] select-none"
      >
        {label}
        {required && (
          <span
            className="ml-1 text-[var(--destructive)]"
            aria-hidden="true"
            title="Required"
          >
            *
          </span>
        )}
      </label>

      {/* Input wrapper (handles prefix/suffix positioning) */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm select-none"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}

        {/* Actual control */}
        {as === "select" ? (
          <select
            id={id}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`${sharedInputClasses} appearance-none cursor-pointer`}
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {(props as SelectFieldProps).children}
          </select>
        ) : (
          <input
            id={id}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={sharedInputClasses}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {/* Suffix or select chevron */}
        {as === "select" ? (
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            aria-hidden="true"
          >
            <ChevronDown />
          </span>
        ) : (
          suffix && (
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-xs select-none"
              aria-hidden="true"
            >
              {suffix}
            </span>
          )
        )}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[var(--muted-foreground)]">
          {hint}
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs text-[var(--destructive)] font-medium"
        >
          <ErrorIcon />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Micro SVG icons (self-contained, no extra deps) ─────────────────────────

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 4v2.5M6 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
