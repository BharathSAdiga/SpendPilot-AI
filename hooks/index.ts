/**
 * hooks/index.ts — barrel export for all custom hooks.
 *
 * Usage:
 *   import { useLocalStorage, useFormPersistence } from "@/hooks";
 */

export { useLocalStorage } from "./useLocalStorage";
export type {
  StorageSerializer,
  UseLocalStorageOptions,
  UseLocalStorageReturn,
  StoredValue,
  SetStoredValue,
} from "./useLocalStorage";

export { useFormPersistence } from "./useFormPersistence";
export type {
  UseFormPersistenceOptions,
  UseFormPersistenceReturn,
} from "./useFormPersistence";
