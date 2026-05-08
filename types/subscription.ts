// ─── Subscription Domain Types ────────────────────────────────────────────────

/** Billing plan tiers available for an AI tool */
export type SubscriptionPlan =
  | "free"
  | "starter"
  | "pro"
  | "business"
  | "enterprise"
  | "custom";

/** The raw shape of a subscription entry */
export interface SubscriptionEntry {
  toolName: string;
  plan: SubscriptionPlan;
  monthlySpend: number; // USD, always stored as a positive number
  seats: number; // 1–9999
}

/** Per-field validation errors — all fields optional so partial errors work */
export type SubscriptionValidationErrors = Partial<
  Record<keyof SubscriptionEntry, string>
>;

// ─── Form Props ────────────────────────────────────────────────────────────────

export interface SubscriptionFormProps {
  /** Controlled: current field values */
  defaultValues?: Partial<SubscriptionEntry>;

  /** Called with the validated entry when the user submits */
  onSubmit: (entry: SubscriptionEntry) => void;

  /** Called when the user explicitly cancels / closes the form */
  onCancel?: () => void;

  /** Pass in pre-computed errors (e.g. from a server response) */
  externalErrors?: SubscriptionValidationErrors;

  /** Label for the primary CTA button — defaults to "Add Subscription" */
  submitLabel?: string;

  /** Put the form into a loading state (disables inputs + shows spinner) */
  isLoading?: boolean;

  /** Optional extra className applied to the outermost wrapper */
  className?: string;
}
