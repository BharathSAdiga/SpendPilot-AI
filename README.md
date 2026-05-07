# SpendPilot AI

> AI-powered SaaS spend audit and optimization platform for modern engineering teams.

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## What is SpendPilot AI?

SpendPilot AI helps startups and scale-ups automatically discover, track, and optimize their SaaS subscriptions. By connecting your SSO provider or importing CSV exports, SpendPilot generates actionable audit reports — revealing wasted spend, unused licenses, and consolidation opportunities.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Framework    | Next.js 15 (App Router)       |
| Language     | TypeScript 5                  |
| Styling      | Tailwind CSS v4               |
| Auth         | _Planned: Clerk / NextAuth_   |
| Database     | _Planned: Postgres + Prisma_  |
| AI           | _Planned: OpenAI / Vercel AI_ |
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
