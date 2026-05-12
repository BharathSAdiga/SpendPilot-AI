# Automated Tests

SpendPilot AI uses **Vitest** for blazing-fast unit and integration testing, ensuring the deterministic audit engine is mathematically sound.

## Test Inventory

### 1. `tests/auditRules.test.ts`
**Covers:** The isolated execution of individual rules.
- **Test:** "small-team-overplan flags enterprise plans for teams < 20"
- **Test:** "annual-billing-savings correctly calculates a 20% discount gap"
- **Test:** "underutilized-plan triggers when actual spend is >$15 below expected capacity"

### 2. `tests/auditEngine.test.ts`
**Covers:** The orchestration of multiple rules and the final scoring algorithm.
- **Test:** "runAudit correctly deduplicates identical findings from overlapping rules"
- **Test:** "runAudit clamps the final score between 0 and 100 regardless of massive negative penalties"
- **Test:** "runAudit calculates totalPotentialSavingsUsd accurately across 5 distinct tools"

### 3. `tests/pricingRegistry.test.ts`
**Covers:** The integrity of the static pricing data.
- **Test:** "Every tool in PRICING_REGISTRY contains at least one free or baseline plan"
- **Test:** "Plan IDs are strictly lowercase alphanumeric with no spaces"

### 4. `tests/schema.test.ts`
**Covers:** Zod validation for the incoming `/api/audit` payload.
- **Test:** "auditFormSchema rejects negative team sizes"
- **Test:** "auditFormSchema strips HTML from companyName inputs"

### 5. `tests/csvParser.test.ts` (Planned for Week 2)
**Covers:** The robustness of the upcoming bulk CSV importer.
- **Test:** "Parser successfully ignores malformed CSV rows while extracting valid merchant data"

## How to Run Tests

Ensure you have run `npm install`, then execute:

```bash
# Run all tests once
npm run test

# Run tests in interactive watch mode (great for TDD)
npm run test:watch

# Generate a v8 coverage report
npm run test:coverage
```

Our GitHub Actions pipeline (`.github/workflows/ci.yml`) enforces that all tests must pass before a PR can be merged into `main`.
