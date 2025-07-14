# Project Design: A Modern Personal Finance Platform

## Part 1: Project Overview & Vision

### 1.1. Project Statement

This document outlines the complete architectural and feature blueprint for a modern finance management platform. The project's primary goal is to empower users with a comprehensive, unified view of their financial life, providing them with the tools and insights necessary to manage their spending, track their net worth, and achieve their financial goals.

### 1.2. Guiding Philosophy

The project will be guided by two core principles:

- **User-Centric Design**: The application will feature a user-friendly, goal-oriented interface that motivates users and makes complex financial data easy to understand and act upon.

### 1.3. Core Value Proposition

The platform will provide a holistic financial management experience by integrating features that are often spread across multiple applications. Users will be able to connect their bank accounts, track assets and liabilities, manage budgets using various methodologies, and plan for future goals, all within a single, secure environment.

## Part 2: Core Technology Stack

The project will be built using a modern, scalable, and type-safe technology stack, chosen to optimize developer experience and application performance.

- **Framework**: Next.js 15 (with App Router)
- **Database**: PostgreSQL
- **Object-Relational Mapper (ORM)**: Prisma
- **Authentication**: NextAuth.js (Auth.js)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI

## Part 3: Comprehensive Feature Specification

The project will be developed in a phased approach, starting with a Minimum Viable Product (MVP) and expanding to include a full suite of advanced features.

### 3.1. Minimum Viable Product (MVP) Features

The MVP will deliver a complete and usable product that addresses the core needs of the user.

**Module: Authentication & User Management**

- Secure user registration and login with email/password.
- OAuth 2.0 login support (initially with Google).
- User preference management (default currency, theme).

**Module: Data Import & Account Management**

- **Direct API Sync**: Secure, read-only integration with the Up Bank API to automatically import accounts and transactions.
- **CSV Importer**: A robust tool to parse and import transaction history from CSV files exported from Commonwealth Bank.
- **Manual Account & Asset Management**: Full CRUD (Create, Read, Update, Delete) for all financial accounts and assets, including:
  - Bank Accounts (Checking, Savings)
  - Credit Cards
  - Cash Accounts
  - Liabilities (e.g., Personal Loans)
  - Manually-tracked Assets (e.g., Real Estate, Vehicles)
  - Manually-tracked Investment & Superannuation accounts to contribute to net worth calculations.

**Module: Transaction Engine**

- Full CRUD for all transactions (income, expenses, transfers), linked to specific accounts.
- **Split Transactions**: Ability to divide a single transaction into multiple categories.
- **Recurring Transactions**: A system to schedule and manage recurring payments for subscriptions and bills.
- **Attachments**: Ability to upload and attach receipt images or PDFs to transactions.

**Module: Budgeting & Goals**

- **Category Budgeting**: Users can create custom spending categories and set monthly spending limits for each.
- **50/30/20 Rule Analysis**: A report in the analytics section that classifies categorized spending into "Needs," "Wants," and "Savings/Debt" to help users understand their alignment with this popular budgeting framework.
- **Goal Management**: A "Piggy Bank" feature allowing users to set, track, and manage progress toward specific financial goals.

**Module: Analytics & Debt Management**

- **Dashboard**: A primary dashboard displaying key metrics:
  - A list of all financial accounts and assets
  - A prominent Net Worth calculation (Total Assets - Total Liabilities)
  - A feed of the most Recent Transactions
  - A Cash Flow summary (monthly income vs. expenses)
- **Debt Management Hub**: A dedicated section to add, edit, and track all debts, with detailed information stored for future planning features.

### 3.2. Full Vision Features (Stretch Goals)

- **Advanced Automation Engine**: A rule engine for automatic transaction categorization and tagging.
- **Expanded Integrations**:
  - Direct API integration with CoinSpot for automated cryptocurrency portfolio tracking
  - CSV importers for other major Australian banks (e.g., Westpac, NAB)
- **Advanced Budgeting Methodologies**:
  - Implementation of the Envelope Budgeting system
  - Implementation of the Zero-Based Budgeting system
- **Advanced Debt Payoff Planner**: A dedicated module to compare the Debt Snowball vs. Debt Avalanche methods with interactive visualizations and a projected "debt-free date."
- **Advanced Analytics & Reporting**:
  - Historical net worth tracking charts powered by periodic snapshots
  - Detailed spending trend reports with advanced filtering

## Part 4: Database Architecture (PostgreSQL)

The database is designed to be scalable, normalized, and secure, with a structure that supports all planned features.

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a dedicated schema to organize application tables
CREATE SCHEMA "app";

-- ENUM types for data consistency
CREATE TYPE "app"."account_type" AS ENUM ('checking', 'savings', 'credit_card', 'cash', 'investment', 'superannuation', 'loan');
CREATE TYPE "app"."asset_type" AS ENUM ('liquid', 'investment', 'property', 'vehicle', 'other');
CREATE TYPE "app"."transaction_type" AS ENUM ('expense', 'income', 'transfer');
CREATE TYPE "app"."budget_category_type" AS ENUM ('needs', 'wants', 'savings_debt');
CREATE TYPE "app"."recurring_frequency" AS ENUM ('daily', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE "app"."security_type" AS ENUM ('stock', 'etf', 'crypto');
CREATE TYPE "app"."audit_action" AS ENUM ('INSERT', 'UPDATE', 'DELETE');


-- USER & AUTHENTICATION --

-- Users table (core identity, works with NextAuth.js)
CREATE TABLE "app"."users" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"name" TEXT,
"email" TEXT UNIQUE NOT NULL,
"email_verified" TIMESTAMPTZ,
"image" TEXT,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NextAuth.js required tables
CREATE TABLE "app"."accounts" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"type" TEXT NOT NULL,
"provider" TEXT NOT NULL,
"provider_account_id" TEXT NOT NULL,
"refresh_token" TEXT,
"access_token" TEXT,
"expires_at" INTEGER,
"token_type" TEXT,
"scope" TEXT,
"id_token" TEXT,
"session_state" TEXT,
UNIQUE ("provider", "provider_account_id")
);

CREATE TABLE "app"."sessions" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"session_token" TEXT UNIQUE NOT NULL,
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"expires" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "app"."verification_tokens" (
"identifier" TEXT NOT NULL,
"token" TEXT UNIQUE NOT NULL,
"expires" TIMESTAMPTZ NOT NULL,
UNIQUE ("identifier", "token")
);

-- Stores user-specific settings and preferences
CREATE TABLE "app"."user_preferences" (
"user_id" UUID PRIMARY KEY REFERENCES "app"."users"("id") ON DELETE CASCADE,
"default_currency" CHAR(3) NOT NULL DEFAULT 'AUD',
"theme" TEXT NOT NULL DEFAULT 'system',
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- CORE FINANCIALS & ASSETS --

-- Stores all user-managed financial accounts and physical assets
CREATE TABLE "app"."financial_accounts" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"name" TEXT NOT NULL,
"type" "app"."account_type" NOT NULL,
"balance" DECIMAL(19, 4) NOT NULL DEFAULT 0.00,
"is_asset" BOOLEAN NOT NULL DEFAULT FALSE,
"asset_type" "app"."asset_type" NULL,
"api_source" TEXT,
"api_identifier" TEXT,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."financial_accounts" ("user_id");

-- Stores detailed information specific to debt accounts
CREATE TABLE "app"."debt_details" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"financial_account_id" UUID UNIQUE NOT NULL REFERENCES "app"."financial_accounts"("id") ON DELETE CASCADE,
"original_balance" DECIMAL(19, 4) NOT NULL,
"interest_rate_apr" DECIMAL(5, 2) NOT NULL,
"minimum_payment" DECIMAL(19, 4) NOT NULL,
"due_date_day_of_month" INTEGER,
"loan_term_months" INTEGER,
"opened_at" DATE,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."debt_details" ("financial_account_id");

-- The central table for all financial events
CREATE TABLE "app"."transactions" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"description" TEXT NOT NULL,
"date" TIMESTAMPTZ NOT NULL,
"type" "app"."transaction_type" NOT NULL,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."transactions" ("user_id", "date" DESC);

-- Supports splitting a single transaction into multiple categories/parts
CREATE TABLE "app"."transaction_splits" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"transaction_id" UUID NOT NULL REFERENCES "app"."transactions"("id") ON DELETE CASCADE,
"category_id" UUID REFERENCES "app"."categories"("id") ON DELETE SET NULL,
"amount" DECIMAL(19, 4) NOT NULL,
"notes" TEXT
);
CREATE INDEX ON "app"."transaction_splits" ("transaction_id");
CREATE INDEX ON "app"."transaction_splits" ("category_id");

-- Stores file attachments for transactions (e.g., receipts)
CREATE TABLE "app"."attachments" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"transaction_id" UUID NOT NULL REFERENCES "app"."transactions"("id") ON DELETE CASCADE,
"file_name" TEXT NOT NULL,
"file_url" TEXT NOT NULL,
"file_type" TEXT,
"uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."attachments" ("transaction_id");


-- INVESTMENTS --

-- Master list of all securities (stocks, ETFs, crypto)
CREATE TABLE "app"."securities" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"ticker_symbol" TEXT NOT NULL,
"name" TEXT NOT NULL,
"type" "app"."security_type" NOT NULL,
"currency" CHAR(3) NOT NULL,
UNIQUE("ticker_symbol", "type")
);

-- Tracks user's holdings of each security in each investment account
CREATE TABLE "app"."holdings" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"account_id" UUID NOT NULL REFERENCES "app"."financial_accounts"("id") ON DELETE CASCADE,
"security_id" UUID NOT NULL REFERENCES "app"."securities"("id") ON DELETE CASCADE,
"quantity" DECIMAL(18, 8) NOT NULL,
"cost_basis" DECIMAL(19, 4) NOT NULL,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
UNIQUE("account_id", "security_id")
);
CREATE INDEX ON "app"."holdings" ("account_id");


-- ORGANIZATION & PLANNING --

-- User-defined categories for transactions
CREATE TABLE "app"."categories" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"name" TEXT NOT NULL,
"parent_category_id" UUID REFERENCES "app"."categories"("id") ON DELETE SET NULL,
"budget_classification" "app"."budget_category_type",
"is_default" BOOLEAN NOT NULL DEFAULT FALSE,
UNIQUE("user_id", "name")
);
CREATE INDEX ON "app"."categories" ("user_id");

-- User-defined tags for granular transaction organization
CREATE TABLE "app"."tags" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"name" TEXT NOT NULL,
UNIQUE("user_id", "name")
);

-- Many-to-many relationship between transactions and tags
CREATE TABLE "app"."transaction_tags" (
"transaction_id" UUID NOT NULL REFERENCES "app"."transactions"("id") ON DELETE CASCADE,
"tag_id" UUID NOT NULL REFERENCES "app"."tags"("id") ON DELETE CASCADE,
PRIMARY KEY ("transaction_id", "tag_id")
);

-- Stores user-defined budgets for categories
CREATE TABLE "app"."budgets" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"category_id" UUID NOT NULL REFERENCES "app"."categories"("id") ON DELETE CASCADE,
"amount" DECIMAL(19, 4) NOT NULL,
"period_start" DATE NOT NULL,
"period_end" DATE NOT NULL,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
UNIQUE("user_id", "category_id", "period_start")
);
CREATE INDEX ON "app"."budgets" ("user_id", "period_start", "period_end");

-- Stores templates for recurring transactions (subscriptions, bills)
CREATE TABLE "app"."recurring_transactions" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"account_id" UUID NOT NULL REFERENCES "app"."financial_accounts"("id") ON DELETE CASCADE,
"category_id" UUID REFERENCES "app"."categories"("id") ON DELETE SET NULL,
"description" TEXT NOT NULL,
"amount" DECIMAL(19, 4) NOT NULL,
"frequency" "app"."recurring_frequency" NOT NULL,
"start_date" DATE NOT NULL,
"end_date" DATE,
"next_due_date" DATE NOT NULL,
"is_active" BOOLEAN NOT NULL DEFAULT TRUE,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."recurring_transactions" ("user_id", "next_due_date");

-- Stores user-defined financial goals
CREATE TABLE "app"."goals" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"name" TEXT NOT NULL,
"target_amount" DECIMAL(19, 4) NOT NULL,
"current_amount" DECIMAL(19, 4) NOT NULL DEFAULT 0.00,
"target_date" DATE,
"linked_account_id" UUID REFERENCES "app"."financial_accounts"("id") ON DELETE SET NULL,
"created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."goals" ("user_id");


-- ANALYTICS & AUDITING --

-- Stores periodic snapshots of net worth for fast reporting
CREATE TABLE "app"."net_worth_snapshots" (
"id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
"user_id" UUID NOT NULL REFERENCES "app"."users"("id") ON DELETE CASCADE,
"snapshot_date" DATE NOT NULL,
"net_worth" DECIMAL(19, 4) NOT NULL,
UNIQUE("user_id", "snapshot_date")
);

-- Generic audit log table to track all changes
CREATE TABLE "app"."audit_log" (
"id" BIGSERIAL PRIMARY KEY,
"schema_name" TEXT NOT NULL,
"table_name" TEXT NOT NULL,
"record_id" UUID,
"action" "app"."audit_action" NOT NULL,
"old_data" JSONB,
"new_data" JSONB,
"user_id" UUID,
"changed_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON "app"."audit_log" ("table_name", "record_id");

-- Trigger function to populate the audit log
CREATE OR REPLACE FUNCTION app.log_changes()
RETURNS TRIGGER AS $$
DECLARE
v_old_data JSONB;
v_new_data JSONB;
BEGIN
IF (TG_OP = 'UPDATE') THEN
v_old_data := to_jsonb(OLD);
v_new_data := to_jsonb(NEW);
INSERT INTO app.audit_log (schema_name, table_name, record_id, action, old_data, new_data, user_id)
VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.id, 'UPDATE'::app.audit_action, v_old_data, v_new_data, NEW.user_id);
RETURN NEW;
ELSIF (TG_OP = 'DELETE') THEN
v_old_data := to_jsonb(OLD);
INSERT INTO app.audit_log (schema_name, table_name, record_id, action, old_data, user_id)
VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.id, 'DELETE'::app.audit_action, v_old_data, OLD.user_id);
RETURN OLD;
ELSIF (TG_OP = 'INSERT') THEN
v_new_data := to_jsonb(NEW);
INSERT INTO app.audit_log (schema_name, table_name, record_id, action, new_data, user_id)
VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id, 'INSERT'::app.audit_action, v_new_data, NEW.user_id);
RETURN NEW;
END IF;
RETURN NULL;
END;

$$
LANGUAGE plpgsql;

-- Example of how to apply the trigger to a table
CREATE TRIGGER financial_accounts_audit
AFTER INSERT OR UPDATE OR DELETE ON app.financial_accounts
FOR EACH ROW EXECUTE FUNCTION app.log_changes();
```

## Part 5: Application Architecture (Next.js 15)

The application will be built using a modular, scalable folder structure that leverages the best practices of the Next.js 15 App Router.

```
/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx         // Landing page
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx     // Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx     // Registration page
│   │   │   └── layout.tsx
│   │   ├── (app)/               // Main protected application routes
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     // Main dashboard
│   │   │   ├── accounts/
│   │   │   │   └── page.tsx     // Accounts overview
│   │   │   ├── budgets/
│   │   │   │   └── page.tsx     // Budgeting module
│   │   │   ├── debts/
│   │   │   │   └── page.tsx     // Debt management hub
│   │   │   ├── goals/
│   │   │   │   └── page.tsx     // Goals module
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx     // Analytics page
│   │   │   └── layout.tsx       // Main app layout with sidebar, header, etc.
│   │   ├── api/                 // API routes
│   │   │   └──...
│   │   ├── layout.tsx           // Root layout
│   │   └── global.css           // Global styles
│   │
│   ├── components/
│   │   ├── ui/                  // Reusable UI primitives (from Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └──...
│   │   ├── layout/              // Major layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── page-wrapper.tsx
│   │   └── features/            // Components specific to a feature
│   │       ├── transactions/
│   │       │   └── transaction-table.tsx
│   │       └── budgeting/
│   │           └── budget-creator.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts            // Prisma client instance (singleton)
│   │   ├── auth.ts              // NextAuth.js configuration
│   │   ├── actions.ts           // Server Actions
│   │   └── utils.ts             // Utility functions (date/currency formatting)
│   │
│   ├── store/
│   │   └── ui-store.ts          // Zustand store for global UI state
│   │
│   └── types/
│       └── index.ts             // Shared TypeScript types and interfaces
│
├── prisma/
│   ├── schema.prisma            // Your Prisma schema file
│   └── migrations/
│
├── public/
│   ├── icons/
│   └── images/
│
├──.env                         // Environment variables (DB_URL, NEXTAUTH_SECRET)
├── next.config.mjs              // Next.js configuration
├── postcss.config.mjs           // PostCSS configuration for Tailwind
├── tailwind.config.ts           // Tailwind CSS configuration
└── tsconfig.json                // TypeScript configuration
```

## Part 6: Development & Operational Strategy

This section outlines the workflow, best practices, and processes that will guide the development and deployment of the application, ensuring a high-quality, maintainable, and secure final product.

### 6.1. Development Workflow & Branching Strategy

To ensure a structured and collaborative development process, the project will adopt a GitFlow-style branching strategy.

- **main Branch**: This branch represents the official, production-ready release history. It should always be stable and deployable.
- **develop Branch**: This is the primary development branch where all completed features are integrated.
- **feature/<feature-name> Branches**: All new features and non-trivial bug fixes are developed in their own dedicated feature branches. These are branched off of develop and merged back into develop via a Pull Request (PR).

### 6.2. Code Quality & Review Best Practices

**Automated Code Quality:**

- **Linting (ESLint)**: Enforce consistent coding styles and catch common errors.
- **Formatting (Prettier)**: Automatically format all code for consistency.
- **Pre-Commit Hooks (Husky)**: Run linters and formatters before any code is committed.

**Peer Code Reviews:**

- All new code must be reviewed and approved via a Pull Request before being merged into develop.
- PRs should be small, focused, and include descriptive comments.

### 6.3. Testing Strategy

- **Static Analysis**: TypeScript and ESLint will be used to catch type errors and code issues.
- **Unit Tests (Jest & React Testing Library)**: Individual functions and components will be tested in isolation.
- **Integration Tests**: Verify that multiple components and systems work together as expected.
- **End-to-End (E2E) Tests (Playwright/Cypress)**: Simulate real user workflows from start to finish.

### 6.4. Security Best Practices

- **Authentication & Authorization**: All protected routes and API endpoints will be secured using NextAuth.js middleware and server-side session checks.
- **Data Sanitization**: All user-generated content will be sanitized to prevent Cross-Site Scripting (XSS) attacks.
- **SQL Injection Prevention**: The use of Prisma ORM inherently protects against SQL injection attacks.
- **Environment Variable Protection**: All sensitive credentials will be stored in .env.local and never committed to version control.
- **HTTP Security Headers**: The application will be configured to send security headers (Content-Security-Policy, etc.).
- **Audit Trail**: The audit_log table will provide a comprehensive record of all data modifications.

### 6.5. Deployment & CI/CD

- **Containerization**: The application will be containerized using Docker for consistency.
- **Deployment Platform**: The application will be deployed to Vercel for seamless integration with Next.js.
- **Continuous Integration/Continuous Deployment (CI/CD)**: A CI/CD pipeline will be established using GitHub Actions to automate testing, building, and deploying the application.
