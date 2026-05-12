/* eslint-disable */
"use client";

/**
 * hooks/useLocalStorage.ts
 *
 * Low-level, SSR-safe localStorage hook.
 *
 * Design decisions:
 * - Returns `undefined` on the first render (before mount) so the server
 *   render and the initial client render produce identical output — this
 *   prevents Next.js hydration mismatches.
 * - Uses a custom StorageSerializer so callers can plug in Zod .parse() or
 *   any other transformation as the deserialiser.
 * - Corrupted / schema-invalid data is caught and removed; the hook falls
 *   back to `defaultValue` rather than throwing.
 * - Storage events from other tabs are forwarded via window "storage" so
 *   multiple open tabs stay in sync.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StorageSerializer<T> {
  /**
   * Convert the raw stored string to T.
   * Throw or return `undefined` to signal that the stored value is invalid
   * (the hook will then clear storage and use `defaultValue`).
   */
  deserialize: (raw: string) => T | undefined;
  /** Convert T to the string that will be written to localStorage. */
  serialize: (value: T) => string;
}

export interface UseLocalStorageOptions<T> {
  /**
   * Custom serializer/deserializer.
   * Defaults to JSON.stringify / JSON.parse.
   */
  serializer?: StorageSerializer<T>;
  /**
   * Called when reading or writing storage throws an unexpected error
   * (e.g. private browsing quota exceeded, SecurityError).
   */
  onError?: (error: unknown) => void;
}

/**
 * The value is `undefined` during SSR and on the very first client render
 * (before the `useEffect` that reads localStorage runs).  After mount it
 * becomes `T`.
 */
export type StoredValue<T> = T | undefined;

export type SetStoredValue<T> = (
  value: T | ((prev: T | undefined) => T)
) => void;

export interface UseLocalStorageReturn<T> {
  /** Current value; `undefined` before mount to prevent hydration mismatch. */
  value: StoredValue<T>;
  /** Update the value and immediately persist it. */
  setValue: SetStoredValue<T>;
  /** Remove the key from localStorage and reset to `defaultValue`. */
  remove: () => void;
  /** True after the first client-side read completes. */
  isHydrated: boolean;
}

// ─── Default serializer (JSON) ────────────────────────────────────────────────

function jsonSerializer<T>(): StorageSerializer<T> {
  return {
    serialize: (v) => JSON.stringify(v),
    deserialize: (raw) => JSON.parse(raw) as T,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const { serializer = jsonSerializer<T>(), onError } = options;

  const serializerRef = useRef(serializer);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    serializerRef.current = serializer;
    onErrorRef.current = onError;
  }, [serializer, onError]);

  // ── State ──────────────────────────────────────────────────────────────────
  // Start undefined — identical to what the server renders — to avoid
  // hydration mismatches.
  const [value, setValueState] = useState<StoredValue<T>>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Read from localStorage, returning defaultValue on any failure. */
  const readStorage = useCallback((): T => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;

      const parsed = serializerRef.current.deserialize(raw);
      if (parsed === undefined) {
        // Deserialiser signalled invalid data — clear it
        window.localStorage.removeItem(key);
        return defaultValue;
      }
      return parsed;
    } catch (err) {
      // Corrupted JSON, Zod parse failure, SecurityError, etc.
      onErrorRef.current?.(err);
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Silently ignore if we can't even remove it
      }
      return defaultValue;
    }
  }, [key, defaultValue]);

  /** Write to localStorage, reporting but not throwing on failure. */
  const writeStorage = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, serializerRef.current.serialize(next));
      } catch (err) {
        onErrorRef.current?.(err);
      }
    },
    [key]
  );

  // ── Mount: read initial value from storage ────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setValueState(readStorage());
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // re-read when key changes

  // ── Cross-tab sync via storage event ──────────────────────────────────────
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      if (e.key !== key) return;
      if (e.storageArea !== window.localStorage) return;
      setValueState(readStorage());
    }

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, readStorage]);

  // ── Public setter ──────────────────────────────────────────────────────────
  const setValue: SetStoredValue<T> = useCallback(
    (valueOrUpdater) => {
      setValueState((prev) => {
        const next =
          typeof valueOrUpdater === "function"
            ? (valueOrUpdater as (prev: T | undefined) => T)(prev)
            : valueOrUpdater;
        writeStorage(next);
        return next;
      });
    },
    [writeStorage]
  );

  // ── Remove ────────────────────────────────────────────────────────────────
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      onErrorRef.current?.(err);
    }
    setValueState(defaultValue);
  }, [key, defaultValue]);

  return { value, setValue, remove, isHydrated };
}
