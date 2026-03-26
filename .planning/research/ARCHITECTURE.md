# Architecture Research

**Domain:** Single-user internal business operations dashboard (retail + playroom/café/parties)
**Researched:** 2026-03-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Dashboard   │  │  Data Entry  │  │  Analytics / Reports │   │
│  │  (KPI view)  │  │  (forms)     │  │  (charts, trends)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┴──────────────────────┘               │
│                           │                                      │
│              ┌────────────▼──────────────┐                       │
│              │    App State Layer        │                       │
│              │  (TanStack Query cache    │                       │
│              │   + Zustand UI state)     │                       │
│              └────────────┬──────────────┘                       │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                    API / Server Layer                            │
│              ┌────────────▼──────────────┐                       │
│              │  Next.js Route Handlers   │                       │
│              │  (or Server Actions)      │                       │
│              └────────────┬──────────────┘                       │
│                           │                                      │
├───────────────────────────┼──────────────────────────────────────┤
│                       Data Layer                                 │
│   ┌────────────┐  ┌───────▼────────┐  ┌──────────────────────┐  │
│   │  Entities  │  │  DB (SQLite or │  │  Aggregation         │  │
│   │  (models,  │  │  Postgres via  │  │  (computed views,    │  │
│   │  schemas)  │  │  Prisma/Drizzle)│  │  monthly totals)     │  │
│   └────────────┘  └────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Dashboard (KPI view) | Renders monthly trend, top-line revenue, gross profit summary | Reads from App State / TanStack Query cache |
| Data Entry Forms | Collects daily entries: sales by category, costs, party details, kids count | Submits via Server Actions or POST to Route Handlers → DB |
| Analytics / Reports | Shows breakdowns by category, period-over-period trends, party summaries, stock alerts | Reads aggregated data via TanStack Query |
| App State Layer | Holds server cache (TanStack Query) and transient UI state (Zustand) — form open/closed, selected date, filter state | UI components read from here; mutations invalidate cache |
| Route Handlers / Server Actions | Validates input, orchestrates DB writes, returns structured data | Forms write to this; queries read from this |
| DB + Prisma/Drizzle | Persists all transactional records (sales, costs, entries, parties, stock) | Route Handlers / Server Actions only — never accessed directly from client |
| Aggregation layer | Pre-computes or computes-on-read monthly totals, category breakdowns, profit estimates | Invoked by Route Handlers on reads; can be DB views or service functions |
| Supplier / Stock module | Manages stock levels and supplier directory; fires low-stock alerts | Reads/writes via same Route Handlers pattern |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router root
│   ├── (dashboard)/            # Route group — dashboard shell
│   │   ├── layout.tsx          # Shared sidebar/nav shell
│   │   ├── page.tsx            # Landing: monthly KPI overview
│   │   ├── entry/
│   │   │   └── page.tsx        # Daily data entry
│   │   ├── analytics/
│   │   │   └── page.tsx        # Category breakdowns, trends
│   │   ├── parties/
│   │   │   └── page.tsx        # Party revenue summaries
│   │   ├── stock/
│   │   │   └── page.tsx        # Stock levels, low-stock alerts
│   │   └── suppliers/
│   │       └── page.tsx        # Supplier directory
│   └── api/                    # Route Handlers (REST endpoints)
│       ├── entries/route.ts    # GET /api/entries, POST /api/entries
│       ├── costs/route.ts
│       ├── parties/route.ts
│       ├── stock/route.ts
│       └── analytics/route.ts  # Aggregated reads (monthly, by category)
│
├── features/                   # Feature modules (business logic lives here)
│   ├── daily-entry/
│   │   ├── components/         # DailyEntryForm, CategoryInput
│   │   ├── hooks/              # useCreateEntry, useEntryDefaults
│   │   └── schema.ts           # Zod validation schema
│   ├── analytics/
│   │   ├── components/         # RevenueChart, CategoryBreakdown, TrendCard
│   │   ├── hooks/              # useMonthlyTotals, useCategoryBreakdown
│   │   └── types.ts
│   ├── parties/
│   │   ├── components/         # PartyForm, PartyAddonList, PartySummary
│   │   ├── hooks/              # useParties, useCreateParty
│   │   └── schema.ts
│   ├── stock/
│   │   ├── components/         # StockTable, LowStockAlert, StockEditForm
│   │   ├── hooks/              # useStock, useLowStockAlerts
│   │   └── schema.ts
│   └── suppliers/
│       ├── components/         # SupplierCard, SupplierForm
│       └── hooks/              # useSuppliers
│
├── lib/                        # Infrastructure — no business logic
│   ├── db/
│   │   ├── schema.ts           # Drizzle or Prisma schema (source of truth)
│   │   ├── client.ts           # DB connection singleton
│   │   └── aggregations.ts     # Monthly totals, category rollups
│   ├── validations/            # Shared Zod schemas (reused by features)
│   └── utils/                  # Currency formatting, date helpers
│
├── components/                 # Shared UI primitives (no business logic)
│   ├── ui/                     # shadcn/ui components live here
│   ├── charts/                 # Chart wrappers (Recharts or Tremor)
│   ├── forms/                  # Generic FormField, CurrencyInput
│   └── layout/                 # Sidebar, TopNav, PageHeader
│
└── store/                      # Zustand stores (UI-only state)
    ├── ui-store.ts             # Sidebar open, modal state, active date
    └── entry-store.ts          # Transient form state between steps
```

### Structure Rationale

- **features/:** Each feature (daily-entry, parties, stock) owns its own components, hooks, and validation schema. When you work on parties, you only touch `features/parties/`. Nothing bleeds across.
- **lib/db/:** All database access is isolated here — never imported directly in feature components. Route Handlers call `lib/db/` functions. This makes swapping databases trivial.
- **app/api/:** Route Handlers are the server/client boundary. They own input validation and DB orchestration. Server Actions (form submissions) are an acceptable alternative — pick one convention and be consistent.
- **components/ui/:** Generic, stateless UI primitives. No TanStack Query hooks here. If a component needs data, it gets it passed as props from a feature component.
- **store/:** Zustand only holds UI state (which month is selected, whether a modal is open). All persisted data lives in the DB, not in Zustand.

## Architectural Patterns

### Pattern 1: Server State via TanStack Query

**What:** TanStack Query owns all data fetched from the API. Components declare what data they need via `useQuery`; mutations use `useMutation` and invalidate the relevant query keys on success.

**When to use:** Every data read that comes from the database. This covers all analytics, summaries, stock levels, party lists.

**Trade-offs:** Adds a library dependency, but eliminates manual loading/error/cache state. For a dashboard with multiple views reading overlapping data (monthly totals appear on both the landing and analytics page), the shared cache means both pages stay in sync automatically.

**Example:**
```typescript
// features/analytics/hooks/useMonthlyTotals.ts
export function useMonthlyTotals(year: number, month: number) {
  return useQuery({
    queryKey: ['analytics', 'monthly', year, month],
    queryFn: () => fetch(`/api/analytics?year=${year}&month=${month}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // re-fetch after 5 min — fine for manual-entry data
  });
}

// After a new entry is saved:
queryClient.invalidateQueries({ queryKey: ['analytics'] });
```

### Pattern 2: Zod Schema as Single Source of Validation

**What:** Each feature defines a Zod schema that is used for both client-side form validation (via React Hook Form + zodResolver) and server-side input validation inside the Route Handler.

**When to use:** Every form submission and API input. The same schema file is imported by the form component and the API handler.

**Trade-offs:** Requires sharing code between client and server (fine with Next.js co-location). Prevents a whole class of "valid on client, rejected on server" bugs.

**Example:**
```typescript
// features/daily-entry/schema.ts
export const dailyEntrySchema = z.object({
  date: z.string().date(),
  retail: z.object({
    toys: z.number().nonnegative(),
    other: z.number().nonnegative(),
  }),
  playroom: z.object({
    kidsCount: z.number().int().nonnegative(),
    entryFees: z.number().nonnegative(),
    food: z.number().nonnegative(),
    drinks: z.number().nonnegative(),
  }),
  costs: z.object({
    amount: z.number().nonnegative(),
    note: z.string().optional(),
  }).array(),
});
```

### Pattern 3: Aggregation at Read Time (DB Layer)

**What:** Monthly totals, category breakdowns, and gross profit estimates are computed in `lib/db/aggregations.ts` as SQL queries (using GROUP BY, SUM), not in the frontend. The API returns already-aggregated numbers.

**When to use:** Any analytics endpoint. Never send raw transaction rows to the client and compute totals in JavaScript.

**Trade-offs:** Slightly more complex DB queries, but the frontend stays simple and charts render instantly. For this data scale (one business, manual entry), these queries will be sub-millisecond — no caching complexity needed.

**Example:**
```typescript
// lib/db/aggregations.ts
export async function getMonthlyCategoryTotals(year: number, month: number) {
  return db
    .select({
      category: entries.category,
      total: sql<number>`SUM(${entries.amount})`,
    })
    .from(entries)
    .where(
      and(
        eq(sql`YEAR(${entries.date})`, year),
        eq(sql`MONTH(${entries.date})`, month)
      )
    )
    .groupBy(entries.category);
}
```

## Data Flow

### Daily Entry Flow (most frequent user action)

```
Owner fills form (React Hook Form)
    |
    | submit
    v
Zod schema validation (client-side, same schema)
    |
    | on valid
    v
POST /api/entries  (or Server Action)
    |
    v
Route Handler: parse + validate with same Zod schema
    |
    v
lib/db — INSERT into entries table
    |
    v
200 OK
    |
    v
TanStack Query: invalidateQueries(['analytics'], ['entries'])
    |
    v
Dashboard KPIs and charts auto-refresh
```

### Analytics / Dashboard Read Flow

```
User navigates to Dashboard page
    |
    v
Server Component: direct DB read for initial data (SSR)
    OR
Client Component: useQuery hook fires GET /api/analytics
    |
    v
Route Handler → lib/db/aggregations → SQL GROUP BY query
    |
    v
JSON response: { monthlyTotals, categoryBreakdown, vsLastMonth }
    |
    v
TanStack Query caches result with key ['analytics', year, month]
    |
    v
Chart components receive data as props — render
```

### Party Revenue Flow

```
Owner opens Party form
    |
    v
Selects base package → add-ons calculated dynamically (client state)
    |
    v
POST /api/parties
    |
    v
DB: INSERT party record with package + extras breakdown
    |
    v
Invalidate ['parties'] and ['analytics'] query keys
    |
    v
Party summary view and KPIs update
```

### State Management Layers

```
UI State (Zustand)
  └── selected month/year (date picker state)
  └── sidebar collapsed
  └── modal open/closed

Server State (TanStack Query cache)
  └── ['analytics', year, month]  → monthly totals, category breakdown
  └── ['entries', date]           → entries for a specific day
  └── ['parties']                 → party list and summaries
  └── ['stock']                   → stock levels + low-stock flags
  └── ['suppliers']               → supplier directory

Persisted State (DB)
  └── entries table
  └── costs table
  └── parties table
  └── party_addons table
  └── stock_items table
  └── suppliers table
```

### Key Data Flows Summary

1. **Entry → Aggregation invalidation:** Every POST to any entry endpoint triggers TanStack Query invalidation of `['analytics']`. This is the single most important flow — it keeps KPIs live without polling.
2. **Date selection → filtered data:** The selected month/year in Zustand UI store becomes query parameters for analytics hooks. Changing the date picker re-fetches with the new keys automatically.
3. **Low-stock detection:** Computed at read time in the stock query — no background job needed. When stock level drops below threshold (set per-item), the `/api/stock` response includes a `lowStock: true` flag. No separate alert system required at MVP scale.

## Scaling Considerations

This is a single-user, manual-entry app. Scaling concerns are minimal. The table exists to document what to watch if needs grow.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user (current) | SQLite or small Postgres is fine. No connection pooling needed. Aggregation at read time is fast. |
| Add staff data entry (2-5 users) | Add basic auth (NextAuth.js with credentials). No structural change needed — the DB and API layer are already separated. |
| POS integration (v2) | Add an ingestion layer: webhook or Viber parser writes to the same `entries` table. Nothing else changes. |
| Heavy analytics (custom date ranges, exports) | Promote aggregation SQL queries to materialized views. Add an export endpoint. No component restructure needed. |

### Scaling Priorities

1. **First constraint:** The date picker + analytics query combination. If the owner wants arbitrary date ranges (not just month/year), the query key and aggregation function need updating — not a structural change.
2. **Second constraint:** If multiple users are added later, the "no auth" assumption needs revisiting. The architecture already has a clean server boundary (Route Handlers), so dropping in NextAuth.js requires no component restructure.

## Anti-Patterns

### Anti-Pattern 1: Computing Totals in the Frontend

**What people do:** Fetch all raw transaction rows from the DB and use `Array.reduce()` in the component to sum them up.

**Why it's wrong:** Sends unnecessary data over the wire. Chart components bloat with aggregation logic. The same calculation gets duplicated across multiple views. Breaks down when there are hundreds of entries.

**Do this instead:** Always aggregate in SQL. Return pre-computed totals from the API. Frontend components only render what they receive.

### Anti-Pattern 2: Putting Business Logic in Page Components

**What people do:** Write fetch calls, validation, and data transformation directly in `app/(dashboard)/page.tsx`.

**Why it's wrong:** Pages become 300-line files mixing concerns. The same data fetch logic gets duplicated across pages. Hard to test, hard to refactor.

**Do this instead:** Pages are thin — they compose feature components and pass route params. All logic lives in `features/[domain]/hooks/` and `lib/db/aggregations.ts`.

### Anti-Pattern 3: One Massive "Dashboard" State Store

**What people do:** Create a single Zustand store holding all the business data (revenue totals, entries, parties, stock) alongside UI state.

**Why it's wrong:** Creates a "god store." Business data belongs in the DB and TanStack Query cache — it has a server source of truth. Mixing it with UI state means stale data, complex invalidation, and unnecessary re-renders.

**Do this instead:** Zustand holds only UI state (which date is selected, which modal is open). TanStack Query owns all server-derived data. They are separate concerns.

### Anti-Pattern 4: A Single `categories` Table for Income Categories

**What people do:** Create a generic `categories` table and store all income types (food, drinks, toys, entry fees, parties) as arbitrary rows, adding a category field to entries.

**Why it's wrong:** The category set for Honey Nest is known and stable. Using a generic category table forces joins for every query, makes aggregation queries ugly, and requires an admin UI to manage categories that will never change.

**Do this instead:** Use an enum or string literal type for categories. Categories are part of the schema, not the data. If a category is ever added, it is a schema migration — intentional and safe.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Feature components → API | TanStack Query hooks (`useQuery`, `useMutation`) → fetch to Route Handlers | No direct DB access from client-side code |
| Route Handlers → DB | `lib/db/` functions only — never inline SQL in handlers | Keeps DB logic testable in isolation |
| Form validation → API validation | Shared Zod schema imported by both | Single source of validation truth |
| Analytics data → Charts | Aggregated JSON from API, passed as props to chart components | Chart components are presentational — no hooks inside |
| Zustand UI state → TanStack Query | Zustand `selectedMonth` / `selectedYear` fed as params into `useQuery` hooks | State change → new query key → automatic re-fetch |

### External Services (v1)

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None (v1) | — | No third-party APIs in v1. All data is local. |
| Viber parser (v2) | New ingestion endpoint writes to existing `entries` table | Architecture already supports this — no structural change needed |

## Build Order (Roadmap Implications)

The data model is the foundation. Nothing else builds correctly without it.

```
Phase 1: Data model + DB schema
  └── All tables, relationships, Zod schemas
  └── Unblocks: everything

Phase 2: Daily entry forms
  └── The primary write path — most-used feature
  └── Requires: Phase 1

Phase 3: Dashboard KPI view + analytics
  └── The primary read path — owner's daily landing page
  └── Requires: Phase 1 (needs data to aggregate)
  └── Ideally: some Phase 2 data to display

Phase 4: Party module
  └── More complex form (base package + add-ons)
  └── Requires: Phase 1, benefits from Phase 2 patterns

Phase 5: Stock tracking + low-stock alerts
  └── Independent of revenue data, but same architectural pattern
  └── Requires: Phase 1

Phase 6: Supplier directory
  └── Simple CRUD — lowest complexity
  └── Requires: Phase 1 only
```

**Ordering rationale:** Data model first because all features share it. Data entry second because it populates the analytics that make the dashboard useful. Analytics third because it delivers the core value (monthly KPIs). Parties, stock, and suppliers follow — they share the same patterns established in Phases 1-3, so they build faster.

## Sources

- [TanStack Query — Does this replace Redux?](https://tanstack.com/query/v4/docs/react/guides/does-this-replace-client-state) — HIGH confidence (official docs)
- [Next.js App Router — Fetching Data](https://nextjs.org/learn/dashboard-app/fetching-data) — HIGH confidence (official docs)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — HIGH confidence (official docs)
- [Zustand + TanStack Query state separation pattern](https://javascript.plainenglish.io/zustand-and-tanstack-query-the-dynamic-duo-that-simplified-my-react-state-management-e71b924efb90) — MEDIUM confidence (community article, corroborated by TanStack docs)
- [React admin dashboard project structure best practices](https://srobbin01.medium.com/react-admin-panel-dashboard-project-structure-best-practice-starter-kit-13fa5b3a71e7) — MEDIUM confidence (community article)
- [Feature-based folder structure for React](https://asrulkadir.medium.com/3-folder-structures-in-react-ive-used-and-why-feature-based-is-my-favorite-e1af7c8e91ec) — MEDIUM confidence (community article, widely adopted pattern)
- [Offline-first frontend apps 2025 — SQLite in browser](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) — MEDIUM confidence (LogRocket, current)

---
*Architecture research for: Honey Nest Dashboard — single-user internal business operations dashboard*
*Researched: 2026-03-27*
