# 💰 Ledger v2 — Personal Finance Tracker

A full-stack Next.js 16 app with JWT auth, Prisma ORM, Supabase PostgreSQL, and a rich dashboard with charts.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Auth**: JWT (jose) + bcryptjs, stored in httpOnly cookies
- **UI**: Tailwind CSS v4, Recharts, Lucide icons
- **Language**: TypeScript

## Features
- 🔐 Register / Login / Logout (JWT, 7-day sessions)
- 📊 Dashboard: income, expense & balance stats for current month
- 📈 6-month income vs expense bar chart
- 🥧 Expenses by category pie chart
- 📝 Full transaction list with filters (type, category, date range, search)
- ✏️ Add, edit, delete transactions
- 💸 15 categories (income & expense) with emoji icons
- ₹ Indian Rupee formatting

## Quick Start

### 1. Clone / extract the project
```bash
cd ledger-v2
```

### 2. Environment variables
The `.env` file is already configured with your Supabase and JWT credentials.

### 3. One-command setup
```bash
bash setup.sh
```
This will: install deps → generate Prisma client → push schema to Supabase.

### 4. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Manual Steps (if setup.sh fails)

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Prisma Commands

| Command | Description |
|---|---|
| `npx prisma generate` | Regenerate client after schema changes |
| `npx prisma db push` | Push schema to DB (no migration files) |
| `npx prisma migrate dev` | Create migration files (for production) |
| `npx prisma studio` | Open visual DB browser at localhost:5555 |
| `npx prisma db pull` | Pull current DB schema into schema.prisma |

## Project Structure

```
ledger-v2/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # POST /api/auth/login
│   │   │   ├── register/route.ts    # POST /api/auth/register
│   │   │   ├── logout/route.ts      # POST /api/auth/logout
│   │   │   └── me/route.ts          # GET  /api/auth/me
│   │   └── transactions/
│   │       ├── route.ts             # GET, POST /api/transactions
│   │       └── [id]/route.ts        # PUT, DELETE /api/transactions/:id
│   ├── globals.css                  # Tailwind theme + custom utilities
│   ├── layout.tsx
│   └── page.tsx                     # Entry point (auth gate)
├── components/
│   ├── AuthPage.tsx                 # Login/Register UI
│   ├── Dashboard.tsx                # Stats + charts
│   ├── Layout.tsx                   # Sidebar/nav shell
│   ├── TransactionList.tsx          # Filtered transaction table
│   └── TransactionModal.tsx         # Add/Edit modal
├── contexts/
│   ├── AuthContext.tsx              # User state + auth methods
│   └── TransactionContext.tsx       # Transaction CRUD state
├── lib/
│   ├── auth.ts                      # JWT sign/verify/session
│   ├── constants.ts                 # Categories, colors
│   ├── prisma.ts                    # Prisma client singleton
│   └── types.ts                     # TypeScript interfaces
├── prisma/
│   └── schema.prisma                # DB schema (User, Transaction)
├── .env                             # ✅ Configured with your keys
└── setup.sh                        # One-command setup
```

## Database Schema

```prisma
model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  password     String        // bcrypt hashed
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String
  type        String   // "income" | "expense"
  amount      Float
  category    String   // see lib/constants.ts
  description String
  date        String   // "YYYY-MM-DD"
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
