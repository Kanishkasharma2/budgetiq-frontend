# BudgetIQ - Frontend

Frontend for BudgetIQ, a personal finance tracker I built as a placement portfolio project.

Live site: https://budgetiq-frontend.vercel.app
Backend repo: https://github.com/Kanishkasharma2/budgetiq-backend

## Features

- Login/signup with JWT authentication
- Dashboard with balance, income, expense summary
- Category-wise spending breakdown (pie chart)
- 6-month spending trend chart with a rule-based spending projection
- Add, edit, delete, and filter transactions
- Set monthly budget limits per category with progress bars
- Export transactions as CSV
- Recurring transactions (auto-logged monthly, e.g. rent)
- Dark mode

## Tech Stack

React, Vite, Tailwind CSS, React Router, Axios, Recharts
Deployed on Vercel

## Setup

```bash
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

## Design

Custom "ledger/passbook" theme — ink navy, ivory paper background, gold accents, with serif headers and monospace numbers to give it a printed-passbook feel.
