/**
 * data/pricingConfig.ts
 *
 * Centralized pricing configuration for all 8 supported AI tools.
 * Prices verified: 2026-05-08.
 *
 * MAINTENANCE: When updating prices, also bump `lastVerified` on the entry.
 * Do NOT import from components here — this is pure data, no React deps.
 */

import type {
  AiToolPricingEntry,
  PricingRegistry,
} from "@/types/pricing";

// ─── 1. Cursor ─────────────────────────────────────────────────────────────────

const cursor: AiToolPricingEntry = {
  id: "Cursor",
  name: "Cursor",
  vendor: "Anysphere",
  description:
    "AI-first code editor (VS Code fork) with inline edits, chat, and multi-file agentic changes.",
  category: "coding_assistant",
  pricingUrl: "https://cursor.com/pricing",
  typicalTeamSpend: { min: 0, max: 200 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "free",
      label: "Hobby",
      tagline: "Try Cursor with limited AI usage.",
      features: [
        "2,000 completions / month",
        "50 slow premium model requests",
        "Basic code completion",
        "Community support",
      ],
      pricing: { model: "flat_rate", pricePerSeatMonthly: 0, billingCadence: "monthly" },
      intendedRoles: ["developer"],
      seatSuitability: "individual",
    },
    {
      id: "pro",
      label: "Pro",
      tagline: "Unlimited AI for individual developers.",
      isPopular: true,
      features: [
        "Unlimited completions",
        "500 fast premium requests / month",
        "Unlimited slow premium requests",
        "10 Claude claude-3-7-sonnet / GPT-4 uses / day",
        "Priority support",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 20,
        pricePerSeatAnnual: 192,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer"],
      seatSuitability: "small_team",
    },
    {
      id: "business",
      label: "Business",
      tagline: "Centralised billing and admin for engineering teams.",
      features: [
        "Everything in Pro",
        "Centralised team billing",
        "Admin usage dashboard",
        "Enforce privacy mode org-wide",
        "SAML/SSO (coming soon)",
        "Priority support",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 40,
        pricePerSeatAnnual: 384,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer", "devops"],
      seatSuitability: "mid_market",
    },
  ],
};

// ─── 2. Claude (Anthropic Consumer) ───────────────────────────────────────────

const claude: AiToolPricingEntry = {
  id: "Claude",
  name: "Claude",
  vendor: "Anthropic",
  description:
    "Anthropic's conversational AI assistant — strong at long-context reasoning, analysis, and coding.",
  category: "chat_assistant",
  pricingUrl: "https://claude.ai/upgrade",
  typicalTeamSpend: { min: 0, max: 200 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "free",
      label: "Free",
      tagline: "Limited access to Claude.",
      features: [
        "Access to Claude claude-3-haiku",
        "Limited Claude claude-3-7-sonnet messages",
        "Web & mobile apps",
      ],
      pricing: { model: "flat_rate", pricePerSeatMonthly: 0, billingCadence: "monthly" },
      intendedRoles: ["any"],
      seatSuitability: "individual",
    },
    {
      id: "pro",
      label: "Pro",
      tagline: "5× more usage, priority access.",
      isPopular: true,
      features: [
        "5× more usage than Free",
        "Priority access during high traffic",
        "Early access to new features",
        "Projects & extended context",
        "Access to Claude claude-3-7-sonnet & claude-3-opus",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 20,
        pricePerSeatAnnual: 216,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer", "writer", "researcher", "any"],
      seatSuitability: "individual",
    },
    {
      id: "team",
      label: "Team",
      tagline: "Collaborative workspace with higher limits.",
      features: [
        "Everything in Pro",
        "Higher usage limits than Pro",
        "Shared projects & conversation history",
        "Central billing & seat management",
        "Minimum 5 seats",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 25,
        pricePerSeatAnnual: 270,
        billingCadence: "monthly",
      },
      intendedRoles: ["any"],
      seatSuitability: "small_team",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      tagline: "Custom limits, SSO, and compliance controls.",
      features: [
        "Unlimited usage (subject to rate limits)",
        "SAML SSO & SCIM provisioning",
        "Role-based access control",
        "Audit logs & data retention controls",
        "Dedicated account manager",
        "Custom invoicing",
      ],
      pricing: { model: "custom", contactUrl: "https://claude.ai/enterprise" },
      intendedRoles: ["any"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── 3. ChatGPT (OpenAI Consumer) ─────────────────────────────────────────────

const chatgpt: AiToolPricingEntry = {
  id: "ChatGPT",
  name: "ChatGPT",
  vendor: "OpenAI",
  description:
    "OpenAI's flagship chat product — broad general intelligence, image generation, data analysis, and plugins.",
  category: "chat_assistant",
  pricingUrl: "https://openai.com/chatgpt/pricing",
  typicalTeamSpend: { min: 0, max: 300 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "free",
      label: "Free",
      tagline: "GPT-4o with limited messages.",
      features: [
        "Access to GPT-4o (rate limited)",
        "DALL·E image generation (limited)",
        "Web browsing",
        "Basic data analysis",
      ],
      pricing: { model: "flat_rate", pricePerSeatMonthly: 0, billingCadence: "monthly" },
      intendedRoles: ["any"],
      seatSuitability: "individual",
    },
    {
      id: "plus",
      label: "Plus",
      tagline: "5× more GPT-4o messages, access to o1.",
      isPopular: true,
      features: [
        "Higher GPT-4o message limits",
        "Access to o1 and o3-mini reasoning models",
        "Advanced data analysis",
        "DALL·E HD generation",
        "Custom GPTs",
        "Priority access",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 20,
        billingCadence: "monthly",
      },
      intendedRoles: ["any"],
      seatSuitability: "individual",
    },
    {
      id: "pro",
      label: "Pro",
      tagline: "Unlimited access including o1 pro mode.",
      features: [
        "Unlimited GPT-4o & o1",
        "o1 pro mode (most powerful reasoning)",
        "Extended thinking time",
        "Highest rate limits",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 200,
        billingCadence: "monthly",
      },
      intendedRoles: ["researcher", "developer", "data_scientist"],
      seatSuitability: "individual",
    },
    {
      id: "team",
      label: "Team",
      tagline: "Shared workspace with admin controls.",
      features: [
        "Everything in Plus",
        "Higher message limits than Plus",
        "Workspace admin console",
        "Team data excluded from training by default",
        "Shared custom GPTs",
        "Minimum 2 seats",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 30,
        pricePerSeatAnnual: 300,
        billingCadence: "monthly",
      },
      intendedRoles: ["any"],
      seatSuitability: "small_team",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      tagline: "Security, compliance, and unlimited scale.",
      features: [
        "Unlimited GPT-4o & tools",
        "SSO & SCIM",
        "Advanced admin controls & audit logs",
        "Data not used for training",
        "Custom data retention",
        "Dedicated account support",
      ],
      pricing: { model: "custom", contactUrl: "https://openai.com/contact-sales" },
      intendedRoles: ["any"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── 4. Gemini (Google Consumer) ──────────────────────────────────────────────

const gemini: AiToolPricingEntry = {
  id: "Gemini",
  name: "Gemini",
  vendor: "Google",
  description:
    "Google's multimodal AI assistant — deeply integrated with Google Workspace, strong at long-context and image tasks.",
  category: "multimodal",
  pricingUrl: "https://one.google.com/about/ai-premium",
  typicalTeamSpend: { min: 0, max: 220 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "free",
      label: "Free",
      tagline: "Gemini 1.5 Flash with standard limits.",
      features: [
        "Access to Gemini 1.5 Flash",
        "Gemini in Google Workspace (limited)",
        "Basic image understanding",
      ],
      pricing: { model: "flat_rate", pricePerSeatMonthly: 0, billingCadence: "monthly" },
      intendedRoles: ["any"],
      seatSuitability: "individual",
    },
    {
      id: "advanced",
      label: "Gemini Advanced (Google One AI Premium)",
      tagline: "Gemini Ultra with 1TB storage.",
      isPopular: true,
      features: [
        "Access to Gemini 2.0 Ultra",
        "Deep integration across all Google apps",
        "1TB Google One storage",
        "Gemini in Docs, Sheets, Slides, Gmail",
        "NotebookLM Plus included",
        "Priority access to new features",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 19.99,
        pricePerSeatAnnual: 199.99,
        billingCadence: "monthly",
      },
      intendedRoles: ["any"],
      seatSuitability: "individual",
    },
    {
      id: "workspace_business",
      label: "Gemini for Workspace Business",
      tagline: "AI assistant across the full Workspace suite.",
      features: [
        "Gemini in Gmail, Docs, Sheets, Slides, Meet",
        "AI-powered Smart Compose & Summarise",
        "Workspace admin controls",
        "Data protection & compliance",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 20,
        billingCadence: "monthly",
      },
      intendedRoles: ["any"],
      seatSuitability: "mid_market",
    },
    {
      id: "workspace_enterprise",
      label: "Gemini for Workspace Enterprise",
      tagline: "Advanced AI + enterprise security.",
      features: [
        "Everything in Business",
        "Advanced data loss prevention",
        "Enterprise-grade audit logs",
        "Customer-managed encryption keys",
        "Dedicated support",
      ],
      pricing: { model: "custom", contactUrl: "https://workspace.google.com/contact/" },
      intendedRoles: ["any"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── 5. GitHub Copilot ────────────────────────────────────────────────────────

const githubCopilot: AiToolPricingEntry = {
  id: "GitHub Copilot",
  name: "GitHub Copilot",
  vendor: "GitHub (Microsoft)",
  description:
    "AI pair programmer embedded in editors — completions, chat, pull-request summaries, and CLI assistance.",
  category: "coding_assistant",
  pricingUrl: "https://github.com/features/copilot#pricing",
  typicalTeamSpend: { min: 0, max: 190 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "free",
      label: "Free",
      tagline: "Limited completions for individual developers.",
      features: [
        "2,000 code completions / month",
        "50 chat messages / month",
        "VS Code, JetBrains, Vim support",
      ],
      pricing: { model: "flat_rate", pricePerSeatMonthly: 0, billingCadence: "monthly" },
      intendedRoles: ["developer"],
      seatSuitability: "individual",
    },
    {
      id: "pro",
      label: "Pro",
      tagline: "Unlimited completions for individual developers.",
      isPopular: true,
      features: [
        "Unlimited code completions",
        "Unlimited chat messages",
        "Multi-model access (GPT-4o, Claude claude-3-7-sonnet, Gemini)",
        "GitHub.com chat integration",
        "CLI assistance",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 10,
        pricePerSeatAnnual: 100,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer"],
      seatSuitability: "individual",
    },
    {
      id: "business",
      label: "Business",
      tagline: "Team management, policy controls, and audit logs.",
      features: [
        "Everything in Pro",
        "Organisation-wide policy management",
        "Audit logs",
        "IP indemnity",
        "Exclude specified files from AI",
        "SAML SSO",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 19,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer", "devops"],
      seatSuitability: "mid_market",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      tagline: "Custom models fine-tuned on your codebase.",
      features: [
        "Everything in Business",
        "Fine-tuned models on private repos",
        "GitHub.com PR summarisation",
        "Copilot Workspace (agentic tasks)",
        "Dedicated support",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 39,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer", "devops"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── 6. Anthropic API ─────────────────────────────────────────────────────────

const anthropicApi: AiToolPricingEntry = {
  id: "Anthropic API",
  name: "Anthropic API",
  vendor: "Anthropic",
  description:
    "Direct API access to Claude models — pay per token, no seat limits. For teams building AI-powered products.",
  category: "api_platform",
  pricingUrl: "https://www.anthropic.com/pricing",
  typicalTeamSpend: { min: 20, max: 2000 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "pay_as_you_go",
      label: "Pay-as-you-go",
      tagline: "Flexible token-based billing, no commitment.",
      isPopular: true,
      features: [
        "Claude claude-3-haiku, claude-3-7-sonnet, claude-3-opus models",
        "No minimum spend",
        "Prompt caching available",
        "200K context window (claude-3-7-sonnet/opus)",
        "Batch API (50% discount)",
        "Standard rate limits",
      ],
      pricing: {
        model: "usage_based",
        unit: "1M tokens (input / output varies by model)",
        pricePerUnit: 3.0, // claude-3-7-sonnet input as representative
        typicalMonthlySpend: { min: 20, max: 1000 },
      },
      intendedRoles: ["developer", "data_scientist", "devops"],
      seatSuitability: "any",
    },
    {
      id: "build",
      label: "Build",
      tagline: "Higher rate limits for growing products.",
      features: [
        "Everything in Pay-as-you-go",
        "4× higher rate limits",
        "Priority queue access",
      ],
      pricing: {
        model: "usage_based",
        unit: "1M tokens",
        pricePerUnit: 3.0,
        typicalMonthlySpend: { min: 200, max: 5000 },
      },
      intendedRoles: ["developer", "devops"],
      seatSuitability: "mid_market",
    },
    {
      id: "scale",
      label: "Scale",
      tagline: "Volume discounts and dedicated capacity.",
      features: [
        "Committed usage discounts",
        "Dedicated inference capacity",
        "Custom rate limits",
        "Technical account management",
      ],
      pricing: {
        model: "custom",
        contactUrl: "https://www.anthropic.com/contact-sales",
        startingAtMonthly: 5000,
      },
      intendedRoles: ["developer", "executive"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── 7. OpenAI API ────────────────────────────────────────────────────────────

const openaiApi: AiToolPricingEntry = {
  id: "OpenAI API",
  name: "OpenAI API",
  vendor: "OpenAI",
  description:
    "API access to GPT-4o, o1, DALL·E, Whisper, and Embeddings — for developers building AI-powered products.",
  category: "api_platform",
  pricingUrl: "https://openai.com/api/pricing",
  typicalTeamSpend: { min: 20, max: 3000 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "pay_as_you_go",
      label: "Pay-as-you-go",
      tagline: "No commitment — pay per token or request.",
      isPopular: true,
      features: [
        "Access to GPT-4o, GPT-4o mini, o1, o3-mini",
        "DALL·E 3, Whisper, TTS, Embeddings",
        "Prompt caching (50% discount on cached tokens)",
        "Batch API (50% discount)",
        "Fine-tuning available",
        "Function calling & structured outputs",
      ],
      pricing: {
        model: "usage_based",
        unit: "1M tokens (model-dependent)",
        pricePerUnit: 2.5, // GPT-4o input as representative
        typicalMonthlySpend: { min: 20, max: 1500 },
      },
      intendedRoles: ["developer", "data_scientist", "devops"],
      seatSuitability: "any",
    },
    {
      id: "commitments",
      label: "Committed Usage",
      tagline: "Volume discounts with prepaid credits.",
      features: [
        "Discounted token pricing",
        "Prepaid credit bundles",
        "Higher rate limits",
        "Dedicated support",
      ],
      pricing: {
        model: "custom",
        contactUrl: "https://openai.com/contact-sales",
        startingAtMonthly: 2000,
      },
      intendedRoles: ["developer", "executive"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── 8. Windsurf ──────────────────────────────────────────────────────────────

const windsurf: AiToolPricingEntry = {
  id: "Windsurf",
  name: "Windsurf",
  vendor: "Codeium",
  description:
    "Agentic AI IDE by Codeium — Cascade agent mode enables multi-step autonomous coding across your entire codebase.",
  category: "agentic",
  pricingUrl: "https://codeium.com/windsurf/pricing",
  typicalTeamSpend: { min: 0, max: 150 },
  lastVerified: "2026-05-08",
  plans: [
    {
      id: "free",
      label: "Free",
      tagline: "Generous free tier with agentic capabilities.",
      features: [
        "5 Cascade agentic flows / month",
        "Unlimited autocomplete",
        "Access to Claude claude-3-5-haiku & GPT-4o mini",
        "In-editor chat",
      ],
      pricing: { model: "flat_rate", pricePerSeatMonthly: 0, billingCadence: "monthly" },
      intendedRoles: ["developer"],
      seatSuitability: "individual",
    },
    {
      id: "pro",
      label: "Pro",
      tagline: "Unlimited agentic flows and premium models.",
      isPopular: true,
      features: [
        "Unlimited Cascade flows",
        "Access to Claude claude-3-7-sonnet, GPT-4o, Gemini 1.5 Pro",
        "Priority queue",
        "Remote indexing of large repos",
        "Extensions support",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 15,
        pricePerSeatAnnual: 144,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer"],
      seatSuitability: "small_team",
    },
    {
      id: "teams",
      label: "Teams",
      tagline: "Admin controls and centralised billing.",
      features: [
        "Everything in Pro",
        "Team admin dashboard",
        "Centralised billing",
        "Usage analytics",
        "Priority support",
        "Minimum 5 seats",
      ],
      pricing: {
        model: "flat_rate",
        pricePerSeatMonthly: 35,
        billingCadence: "monthly",
      },
      intendedRoles: ["developer", "devops"],
      seatSuitability: "mid_market",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      tagline: "On-prem / VPC deployment with custom models.",
      features: [
        "Everything in Teams",
        "On-prem or VPC deployment option",
        "Fine-tuned models on private codebases",
        "SSO & audit logging",
        "SLA guarantee",
        "Dedicated customer success",
      ],
      pricing: {
        model: "custom",
        contactUrl: "https://codeium.com/contact-us",
        startingAtMonthly: 500,
      },
      intendedRoles: ["developer", "devops", "executive"],
      seatSuitability: "enterprise",
    },
  ],
};

// ─── Registry ──────────────────────────────────────────────────────────────────

/**
 * The canonical pricing registry.
 * Keys must match the `id` field of each AiToolPricingEntry.
 * Use `getPricingEntry()` or `getPlanConfig()` helpers for safe access.
 */
export const PRICING_REGISTRY: PricingRegistry = {
  Cursor: cursor,
  Claude: claude,
  ChatGPT: chatgpt,
  Gemini: gemini,
  "GitHub Copilot": githubCopilot,
  "Anthropic API": anthropicApi,
  "OpenAI API": openaiApi,
  Windsurf: windsurf,
} as const;
