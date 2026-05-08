/**
 * lib/auditSchema.ts — backward-compatible re-export shim.
 *
 * The canonical validation schemas have moved to lib/validation/.
 * This file keeps existing "@/lib/auditSchema" imports working
 * without any changes to consumers.
 *
 * @deprecated Import from "@/lib/validation" instead.
 */

export {
  auditFormSchema,
  toolEntrySchema as auditToolSchema,
  parseAuditForm,
  parseToolEntry,
} from "./validation";

export type {
  AuditForm as AuditFormSchema,
  ToolEntry as AuditToolSchema,
} from "./validation";
