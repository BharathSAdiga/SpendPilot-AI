# Tests — SpendPilot AI

> Testing strategy, coverage goals, and test inventory for the SpendPilot AI platform.

---

## Testing Philosophy

- **Test behavior, not implementation.** Tests should describe what a user or system _does_, not internal code structure.
- **Pyramid structure:** Unit → Integration → E2E (most at the bottom, fewest at the top).
- **Critical paths first.** Auth, CSV parsing, report generation, and billing are highest priority.

---

## Tech Stack

| Layer         | Tool                  | Status   |
|---------------|-----------------------|----------|
| Unit Tests    | Vitest                | Planned  |
| Component     | React Testing Library | Planned  |
| E2E           | Playwright            | Planned  |
| Coverage      | v8 (via Vitest)       | Planned  |

---

## Coverage Targets

| Area                  | Target Coverage |
|-----------------------|-----------------|
| Utility functions     | 95%             |
| API route handlers    | 90%             |
| React components      | 80%             |
| E2E critical flows    | 100% of flows   |

---

## Test Inventory

### Unit Tests (`tests/unit/`)

| Test File                    | Description                              | Status  |
|------------------------------|------------------------------------------|---------|
| `lib/csv-parser.test.ts`     | CSV parsing with edge cases              | Planned |
| `lib/spend-classifier.test.ts` | AI spend classification output validation | Planned |
| `lib/report-generator.test.ts` | Report slug generation & metadata      | Planned |
| `lib/formatters.test.ts`     | Currency, date, percentage formatters    | Planned |

### Component Tests (`tests/components/`)

| Test File                    | Description                              | Status  |
|------------------------------|------------------------------------------|---------|
| `Navbar.test.tsx`            | Renders links, active states             | Planned |
| `Footer.test.tsx`            | Renders and contains required links      | Planned |
| `ReportCard.test.tsx`        | Renders metric values correctly          | Planned |
| `AuditWizard.test.tsx`       | Form validation, step transitions        | Planned |

### Integration Tests (`tests/integration/`)

| Test File                    | Description                              | Status  |
|------------------------------|------------------------------------------|---------|
| `api/audit.test.ts`          | POST /api/audit — valid CSV upload       | Planned |
| `api/report.test.ts`         | GET /api/report/[id] — auth + data shape | Planned |

### E2E Tests (`tests/e2e/`)

| Test File                    | Flow Covered                             | Status  |
|------------------------------|------------------------------------------|---------|
| `landing.spec.ts`            | Visit home → click CTA → reach /audit   | Planned |
| `audit-upload.spec.ts`       | Upload CSV → view generated report       | Planned |
| `report-view.spec.ts`        | Visit /report/demo → verify all sections | Planned |
| `auth.spec.ts`               | Sign up → log in → access dashboard     | Planned |

---

## Running Tests

```bash
# Unit + component tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E (requires dev server running)
npm run test:e2e
```

---

## CI Integration

Tests run automatically on every pull request via GitHub Actions.

```yaml
# .github/workflows/test.yml (planned)
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```
