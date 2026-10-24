# TradeFlow — Enterprise-Grade B2B Wholesale Marketplace

[![TradeFlow CI](https://github.com/tradeflow/tradeflow/actions/workflows/ci.yml/badge.svg)](https://github.com/tradeflow/tradeflow/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Sandbox-635BFF?logo=stripe)](https://stripe.com/)

**TradeFlow** is an enterprise-grade, full-stack B2B wholesale marketplace platform inspired by international commerce giants like Alibaba.com, built with an original brand identity and tailored user experience. The platform seamlessly bridges vetted manufacturers, commercial suppliers, and wholesale buyers across 140+ countries.

---

##  System Architecture & Technology Stack

```
                          ┌────────────────────────────┐
                          │   Client Web App (React)   │
                          │   Next.js 14 App Router    │
                          └──────────────┬─────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
         ┌─────────▼─────────┐                       ┌─────────▼─────────┐
         │ Public Marketplace│                       │ Auth & Sessions   │
         │ - Catalog & Search│                       │ - Firebase SDK    │
         │ - Tiered Pricing  │                       │ - Firebase Admin  │
         │ - RFQ Wizard      │                       │ - Role RBAC Guard │
         └─────────┬─────────┘                       └─────────┬─────────┘
                   │                                           │
         ┌─────────▼───────────────────────────────────────────▼─────────┐
         │                Next.js Route Handlers & Services              │
         │   (Products, RFQs, Quotations, Orders, Payments, Messaging)   │
         └─────────┬─────────────────────────┬─────────────────────────┬─┘
                   │                         │                         │
         ┌─────────▼─────────┐     ┌─────────▼─────────┐     ┌─────────▼─────────┐
         │  Prisma ORM (v5)  │     │ Object Storage    │     │ Stripe Gateway    │
         │  PostgreSQL 16+   │     │ (Uploads / Bucket)│     │ (Sandbox Ready)   │
         └───────────────────┘     └───────────────────┘     └───────────────────┘
```

- **Frontend & App Framework:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, class-variance-authority.
- **Identity & Authentication:** Firebase Authentication + Firebase Admin SDK token verification, persistent HTTP-only cookies, and an instant 1-click Demo Persona Switcher.
- **Database & Modeling:** PostgreSQL with Prisma ORM (34 relational models with decimal currency precision, cascades, indexes, and immutable order snapshots).
- **Commerce & Pricing:** Real-time quantity-based tiered pricing calculator, strict Minimum Order Quantity (MOQ) validation, and transactional inventory locking.
- **RFQ Lifecycle:** Dynamic key-value specifications, RFQ broadcasting, formal quotation generation, and quotation-to-order acceptance.
- **Payments:** Stripe integration layer with an explicit Sandbox Test Mode.
- **Testing:** Vitest, React Testing Library, and Playwright for E2E workflows.

---

##  Supported Roles & Demo Personas

TradeFlow provides pre-seeded accounts and an **Instant Demo Role Switcher** available on every page:

| Role | Demo Email | Persona Details | Capabilities |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@globalmerch.com` | Marcus Vance (Global Merchandising Partners Inc.) | RFQs, quotation comparison, tiered cart, order tracking, messaging, reviews |
| **Supplier** | `supplier@apex.com` | David Zhang (Apex Global Electronics Ltd.) | Catalog management, quotation proposals, inventory, fulfillment tracking |
| **Admin** | `admin@tradeflow.com` | Sarah Jenkins (Head of Compliance) | Supplier verification audits, product moderation, user suspensions, audit logs |

---

##  Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18.x, v20.x, or v22+)
- PostgreSQL 14+ (or Docker)
- Git

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/tradeflow.git
cd tradeflow
npm install
```

### 3. Configure Database
Start a local PostgreSQL database using Docker:
```bash
docker compose up -d
```
*(Or point `DATABASE_URL` in `.env` to your existing PostgreSQL instance).*

### 4. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default connection string:
```ini
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/tradeflow?schema=public"
AUTH_DEV_MODE="true"
```

### 5. Migrate Database & Seed Demo Data
```bash
npx prisma db push
npm run prisma:seed
```

### 6. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

##  Testing

### Run Unit & Integration Tests (Vitest)
```bash
npm test
```
Tests tiered volume pricing calculation, MOQ rejection boundaries, order snapshot preservation, and token authorization.

### Run End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

### Production Build Verification
```bash
npm run build
```

---

##  Directory Structure

```
src/
├── app/
│   ├── (auth)/                # Sign in, registration with persona selection
│   ├── (marketplace)/         # Homepage, catalog search, product detail, RFQ, cart, checkout
│   ├── buyer/                 # Buyer dashboard, orders timeline, RFQs, supplier messages
│   ├── supplier/              # Manufacturer portal, product authoring, quote proposals, dispatch
│   ├── admin/                 # Governance console, supplier audits, user moderation, audit logs
│   ├── api/                   # REST Route Handlers (Auth, Products, RFQs, Cart, Orders, Admin)
│   ├── globals.css            # Tailwind theme variables & custom B2B styling
│   └── layout.tsx             # Root layout with Navbar and Footer
├── components/
│   ├── layout/                # Responsive Navbar, Footer, Buyer/Supplier/Admin sidebars
│   ├── marketplace/           # ProductCard, TierPriceTable, QuickInquiryModal
│   └── ui/                    # Button, Input, Badge, Card, Modal, Skeleton primitives
├── lib/
│   ├── auth/                  # Firebase Client SDK, Admin token verification & session guards
│   ├── payments/              # Tiered pricing calculator with MOQ rules & Stripe sandbox
│   ├── storage/               # Object storage abstraction with local disk fallback
│   ├── prisma.ts              # Singleton Prisma client instance
│   └── utils.ts               # Currency formatting, order numbering, slug generator
└── prisma/
    ├── schema.prisma          # PostgreSQL relational schema (34 models)
    └── seed.ts                # Rich seed script with realistic demo wholesale catalog
```

---

##  Security Best Practices Implemented

- **No Client Price Trust:** All line item prices and totals are computed strictly on the server against current database price tiers.
- **Atomic Stock Reservation:** Orders decrement available inventory and increment reserved inventory in a single ACID database transaction.
- **Snapshot Preservation:** Historical orders store immutable copies of unit prices, SKUs, and specifications so supplier catalog updates never alter historical invoices.
- **RBAC Authorization Guards:** All sensitive API routes verify session credentials using `requireRole([Role.SUPPLIER, Role.ADMIN])`.
- **Private Supplier Verification Documents:** Verification licenses and tax audits are never displayed publicly.

---

##  License
This project is open-source and available under the MIT License.
