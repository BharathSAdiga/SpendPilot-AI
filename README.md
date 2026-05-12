# SpendPilot AI

> AI-powered SaaS spend audit and optimization platform for modern engineering teams.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## What is SpendPilot AI?

SpendPilot AI helps startups and scale-ups automatically discover, track, and optimize their SaaS subscriptions. SpendPilot generates actionable audit reports reveal wasted spend, unused licenses, and consolidation opportunities.

### **Core MVP Features**
- **Deterministic Audit Engine**: 90+ rules for rightsizing and plan optimization.
- **AI Executive Summaries**: Powered by Claude for high-level management insights.
- **Interactive Dashboards**: Premium glassmorphism UI with real-time savings counters.
- **Accessibility Hardened**: Lighthouse score > 90 with full keyboard navigation support.
- **CI/CD Pipeline**: Automated linting and testing via GitHub Actions.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Framework    | Next.js 16 (App Router)       |
| Language     | TypeScript 5                  |
| Styling      | Tailwind CSS v4               |
| Backend      | Supabase (Auth, DB)           |
| AI Engine    | Anthropic (Claude 3.5 Sonnet) |
| Emails       | Resend                        |
| Deployment   | Vercel                        |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Installation

```bash
git clone https://github.com/BharathSAdiga/SpendPilot-AI.git
cd SpendPilot-AI
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure

```
spendpilot-ai/
├── app/                   # Next.js App Router pages & layouts
│   ├── layout.tsx         # Root layout (Navbar + Footer)
│   ├── page.tsx           # Landing page
│   ├── audit/             # Audit input page
│   └── report/[slug]/     # Dynamic report pages
├── components/
│   └── layout/            # Navbar, Footer
├── lib/                   # Utilities, API clients, helpers
├── types/                 # Shared TypeScript interfaces
├── data/                  # Static data, mock fixtures
└── tests/                 # Unit and integration tests
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint check
npm run test      # Run test suite
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a pull request

---

## License

MIT © SpendPilot AI
