# Phase 1: Foundation & Data Model — Research

**Researched:** 2026-03-27
**Phase:** 01-foundation-data-model
**Requirements:** FOUND-01, FOUND-02, FOUND-03

---

## 1. Monorepo Scaffold

### Structure

```
honey-nest-dashboard/
├── client/                    # Vite + React frontend
│   ├── src/
│   │   ├── features/          # Domain modules
│   │   │   ├── daily-entry/
│   │   │   ├── dashboard/
│   │   │   ├── parties/
│   │   │   ├── stock/
│   │   │   └── suppliers/
│   │   ├── components/ui/     # shadcn/ui shared components
│   │   ├── lib/               # API client, utilities, shared types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/                    # Hono API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── db/
│   │   │   ├── schema.ts      # Drizzle schema definitions
│   │   │   ├── migrations/    # Drizzle Kit migration files
│   │   │   ├── seed.ts        # Initial category/config seed data
│   │   │   └── index.ts       # DB connection
│   │   ├── lib/               # Shared server utilities
│   │   └── index.ts           # Hono app entry
│   ├── drizzle.config.ts
│   ├── tsconfig.json
│   └── package.json
├── shared/                    # Shared types between client/server
│   ├── types.ts
│   └── package.json
├── package.json               # Root workspace config
└── .planning/
```

### Key Setup Decisions

- **Workspace manager:** npm workspaces (no need for Turborepo at this scale)
- **Root `npm run dev`:** Uses `concurrently` to start both Vite dev server and Hono server with `tsx --watch`
- **Shared types:** `shared/` workspace package imported by both client and server — Zod schemas defined here, TypeScript types derived from them
- **Vite proxy:** `vite.config.ts` proxies `/api` requests to `http://localhost:3001` (Hono server port)

### Package Versions (verified)

| Package | Version | Notes |
|---------|---------|-------|
| react | ^19.0.0 | Latest stable |
| vite | ^6.0.0 | Vite 6 is current stable (Vite 8 from research was aspirational) |
| hono | ^4.0.0 | Latest stable, Node.js adapter |
| @hono/node-server | ^1.0.0 | Node.js HTTP adapter |
| better-sqlite3 | ^11.0.0 | SQLite driver |
| drizzle-orm | ^0.38.0 | ORM |
| drizzle-kit | ^0.30.0 | Migration tooling |
| tailwindcss | ^4.0.0 | v4 (CSS-first config) |
| @tanstack/react-query | ^5.0.0 | Server state |
| react-hook-form | ^7.0.0 | Forms |
| zod | ^3.0.0 | Validation |
| recharts | ^2.0.0 | Charts (for Phase 3) |
| tsx | ^4.0.0 | TypeScript execution for server |
| concurrently | ^9.0.0 | Run client+server together |

---

## 2. Database Schema Design

### Core Tables

**categories**
```
id              INTEGER PRIMARY KEY
name            TEXT NOT NULL UNIQUE     -- immutable slug (append-only)
display_name    TEXT NOT NULL            -- mutable, shown in UI
business_area   TEXT NOT NULL            -- 'retail' | 'playroom_cafe' | 'parties'
cost_margin_pct REAL                    -- fallback margin % (e.g., 0.60 = 60% cost)
active          INTEGER NOT NULL DEFAULT 1  -- soft delete
sort_order      INTEGER NOT NULL DEFAULT 0
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

**daily_entries**
```
id              INTEGER PRIMARY KEY
entry_date      TEXT NOT NULL            -- ISO date 'YYYY-MM-DD'
category_id     INTEGER NOT NULL REFERENCES categories(id)
revenue         REAL NOT NULL DEFAULT 0
cost_amount     REAL                    -- explicit cost if known
cost_basis      TEXT NOT NULL DEFAULT 'estimated'  -- 'exact' | 'estimated'
notes           TEXT
data_source     TEXT NOT NULL DEFAULT 'manual'
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
UNIQUE(entry_date, category_id)         -- one entry per date per category
```

**kids_entries**
```
id              INTEGER PRIMARY KEY
entry_date      TEXT NOT NULL UNIQUE     -- one per day
count           INTEGER NOT NULL DEFAULT 0
notes           TEXT
data_source     TEXT NOT NULL DEFAULT 'manual'
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

**parties**
```
id              INTEGER PRIMARY KEY
party_date      TEXT NOT NULL            -- ISO date
package_name    TEXT NOT NULL
package_price   REAL NOT NULL
notes           TEXT
data_source     TEXT NOT NULL DEFAULT 'manual'
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

**party_addons**
```
id              INTEGER PRIMARY KEY
party_id        INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE
addon_name      TEXT NOT NULL
addon_price     REAL NOT NULL
category        TEXT                    -- 'food' | 'decoration' | 'entertainment' | 'other'
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

**products**
```
id              INTEGER PRIMARY KEY
name            TEXT NOT NULL
category_id     INTEGER REFERENCES categories(id)
cost_price      REAL                    -- per-item cost if known
stock_quantity  INTEGER NOT NULL DEFAULT 0
stock_threshold INTEGER NOT NULL DEFAULT 5  -- low-stock alert level
active          INTEGER NOT NULL DEFAULT 1
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

**suppliers**
```
id              INTEGER PRIMARY KEY
name            TEXT NOT NULL
contact_info    TEXT
notes           TEXT
active          INTEGER NOT NULL DEFAULT 1
created_at      TEXT NOT NULL DEFAULT (datetime('now'))
updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

### Schema Design Rationale

1. **UNIQUE(entry_date, category_id) on daily_entries** — enforces one total per category per day, matches the "daily totals per category" decision from CONTEXT.md
2. **cost_basis field** — tracks whether cost is exact (from product cost_price) or estimated (from category cost_margin_pct). Critical for profit indicator transparency.
3. **categories.business_area** — derives business area from category, no extra field on daily_entries. Supported values: `retail`, `playroom_cafe`, `parties`.
4. **categories.active + categories.name immutable** — append-only: name never changes, display_name can be updated, active flag hides from entry forms without deleting.
5. **Party → daily_entries rollup** — when a party is saved, its total (package_price + sum of addon_prices) is also written as a daily_entry under the party packages category. Party detail table stores the breakdown.
6. **data_source on all entry tables** — `manual` for v1, `viber` for v2.

### Seed Categories

```typescript
const SEED_CATEGORIES = [
  // Retail
  { name: 'toys', display_name: 'Toys', business_area: 'retail', cost_margin_pct: 0.55 },
  { name: 'gifts', display_name: 'Gifts & Accessories', business_area: 'retail', cost_margin_pct: 0.50 },
  { name: 'lifestyle', display_name: 'Lifestyle Products', business_area: 'retail', cost_margin_pct: 0.50 },
  // Playroom / Café
  { name: 'entry_fees', display_name: 'Entry Fees', business_area: 'playroom_cafe', cost_margin_pct: 0.10 },
  { name: 'food', display_name: 'Food', business_area: 'playroom_cafe', cost_margin_pct: 0.60 },
  { name: 'drinks', display_name: 'Drinks', business_area: 'playroom_cafe', cost_margin_pct: 0.40 },
  // Parties
  { name: 'party_packages', display_name: 'Party Packages', business_area: 'parties', cost_margin_pct: 0.45 },
  { name: 'party_addons', display_name: 'Party Add-ons', business_area: 'parties', cost_margin_pct: 0.50 },
];
```

These are starting values — owner can add more categories through the app later (append-only).

---

## 3. API Skeleton

### Routes for Phase 1

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/health | Stack verification — returns DB connection status + category count |
| GET | /api/categories | List all active categories |

Phase 2+ will add full CRUD for entries, parties, products, suppliers.

### Hono RPC Pattern

```typescript
// server/src/index.ts
const app = new Hono()
  .route('/api/health', healthRoute)
  .route('/api/categories', categoriesRoute)

export type AppType = typeof app
```

```typescript
// client/src/lib/api.ts
import { hc } from 'hono/client'
import type { AppType } from '../../../server/src/index'

export const api = hc<AppType>('/')
```

This gives the client typed API calls — `api.api.categories.$get()` with full TypeScript inference.

---

## 4. Critical Warnings from Pitfalls Research

1. **Design schema from aggregation queries up** — the monthly trend query (`SELECT category_id, SUM(revenue), strftime('%Y-%m', entry_date) ... GROUP BY ...`) must work cleanly before writing any form code.
2. **Party rollup must be transactional** — when saving a party, the daily_entry insert and party insert should happen in a single SQLite transaction. If one fails, both fail.
3. **Category names as slugs, never displayed** — `categories.name` is the internal slug (`toys`, `food`). Only `display_name` appears in the UI. This prevents the "rename breaks history" pitfall.

---

## Validation Architecture

### Requirement Verification Map

| Requirement | What to verify | How to verify |
|-------------|---------------|---------------|
| FOUND-01 | Normalized data model with tables for both business areas | `sqlite3 db.sqlite ".tables"` shows all expected tables; foreign keys resolve |
| FOUND-02 | Categories are append-only | Schema has no UPDATE on `name` column; API has no rename endpoint; `active` flag exists for soft-delete |
| FOUND-03 | data_source field on all entry tables | `grep -c "data_source" server/src/db/schema.ts` returns ≥ 3 (daily_entries, kids_entries, parties) |

### Integration Test

A single end-to-end test proves the stack works:
1. Start server
2. GET /api/health → returns `{ status: "ok", categories: N }`
3. GET /api/categories → returns seed categories array with correct business_area values
