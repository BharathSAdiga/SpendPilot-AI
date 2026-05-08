"use client";

/**
 * hooks/useFormPersistence.ts
 *
 * Form-layer persistence hook built on top of useLocalStorage.
 *
 * Integrates with React Hook Form's watch() / reset() API to:
 *   1. Auto-save form values to localStorage on every change (debounced).
 *   2. Restore saved values on mount and call reset() to populate the form.
 *   3. Clear the draft when the form is successfully submitted.
 *   4. Plug in a Zod schema as the deserialiser so stale/invalid drafts
 *      are silently discarded rather than polluting the form.
 */

import { useCallback, useEffect, useRef } from "react";
import type { UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import type { ZodType } from "zod";
import { useLocalStorage } from "./useLocalStorage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseFormPersistenceOptions<TFieldValues extends FieldValues> {
  /** localStorage key to store the draft under */
  storageKey: string;

  /** The RHF form instance returned by useForm() */
  form: UseFormReturn<TFieldValues>;

  /**
   * Optional Zod schema used to validate the stored draft before restoring.
   * If the draft fails validation it is silently discarded.
   * Using `partialAuditFormSchema` here allows partial saves to be valid.
   */
  schema?: ZodType<Partial<TFieldValues>>;

  /**
   * Debounce delay in ms before writing to localStorage after a change.
   * Defaults to 600ms — fast enough to feel instant, slow enough not to
   * thrash storage on every keystroke.
   */
  debounceMs?: number;

  /**
   * Called when a previously saved draft is found and restored.
   * Useful for showing a "Draft restored" toast.
   */
  onRestored?: (draft: Partial<TFieldValues>) => void;

  /**
   * Called when storage read/write fails (quota exceeded, private browsing).
   */
  onError?: (error: unknown) => void;
}

export interface UseFormPersistenceReturn {
  /** True once the hook has read (or found nothing in) localStorage */
  isHydrated: boolean;
  /** True if a draft exists in localStorage */
  hasDraft: boolean;
  /** Manually clear the stored draft without resetting the form */
  clearDraft: () => void;
  /**
   * Call this after a successful submit to clear the draft.
   * Equivalent to clearDraft() but semantically named for submit handlers.
   */
  onSubmitSuccess: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFormPersistence<TFieldValues extends FieldValues>({
  storageKey,
  form,
  schema,
  debounceMs = 600,
  onRestored,
  onError,
}: UseFormPersistenceOptions<TFieldValues>): UseFormPersistenceReturn {
  const { watch, reset } = form;

  // Build a Zod-backed serialiser if a schema is provided, otherwise plain JSON
  const serializer = schema
    ? {
        serialize: (v: Partial<TFieldValues>) => JSON.stringify(v),
        deserialize: (raw: string): Partial<TFieldValues> | undefined => {
          try {
            const parsed = JSON.parse(raw);
            const result = schema.safeParse(parsed);
            // If it passes validation, use it; otherwise discard
            return result.success ? (result.data as Partial<TFieldValues>) : undefined;
          } catch {
            return undefined;
          }
        },
      }
    : undefined;

  const { value: draft, setValue: saveDraft, remove: clearDraft, isHydrated } =
    useLocalStorage<Partial<TFieldValues>>(storageKey, {} as Partial<TFieldValues>, {
      serializer,
      onError,
    });

  // ── Restore draft on mount ────────────────────────────────────────────────
  const hasRestored = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasRestored.current) return;
    hasRestored.current = true;

    if (!draft || Object.keys(draft).length === 0) return;

    // Merge draft into current form values without wiping fields not in draft
    reset(draft as DefaultValues<TFieldValues>, {
      keepDefaultValues: true,
      keepDirtyValues: false,
    });

    onRestored?.(draft);
  }, [isHydrated, draft, reset, onRestored]);

  // ── Auto-save on change (debounced) ───────────────────────────────────────
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = watch((values) => {
      // Cancel any pending save
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        saveDraft(values as Partial<TFieldValues>);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [watch, saveDraft, debounceMs]);

  // ── Public API ────────────────────────────────────────────────────────────
  const onSubmitSuccess = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  const hasDraft = isHydrated && !!draft && Object.keys(draft).length > 0;

  return { isHydrated, hasDraft, clearDraft, onSubmitSuccess };
}
