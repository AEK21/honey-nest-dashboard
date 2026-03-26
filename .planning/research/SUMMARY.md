# Research Summary

**Project:** Honey Nest Dashboard
**Synthesized:** 2026-03-27
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## Recommended Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 + Vite 8 + TypeScript | SPA (no SSR needed), fast HMR, type safety for data models |
| UI | shadcn/ui + Tailwind CSS v4 | Owned components, data entry forms, tables, date pickers |
| Charts | Recharts 3.x | Composable, handles mixed category/trend layouts |
| Forms | React Hook Form + Zod | Fast uncontrolled inputs for manual entry, shared validation |
| State | TanStack Query + Zustand | Server data caching + minimal UI state |
| Backend | Hono 4.x (Node.js) | Lightweight, TypeScript RPC, type-shared with client |
| Database | SQLite (better-sqlite3) + Drizzle ORM | Zero-config, single file, close-to-SQL analytics queries |

## Table Stakes Features

- Daily sales entry form (fast, under 90 seconds)
- Monthly revenue trend (primary KPI / landing page)
- Category-based income breakdown (by product type)
- Kids entry tracking
- Party entry with base package + itemized add-ons
- Cost input (per-item where available, category % as fallback)
- Estimated gross profit with basis indicator (exact vs. estimated)
- Retail product performance summaries
- Basic stock levels + low-stock alerts
- Supplier directory (name, contact, products supplied)
- Edit/correct past entries

## Key Architecture Decisions

- **Three-layer SPA:** UI components → App state (TanStack Query + Zustand) → API (Hono) → SQLite
- **Feature-based folders:** `features/daily-entry/`, `features/parties/`, `features/analytics/` etc.
- **Aggregation in SQL:** All analytics computed via `GROUP BY` queries, not client-side reduction
- **Zod as shared contract:** Same schema validates forms and API handlers
- **Categories are append-only:** Never rename/delete — preserves historical reporting integrity

## Critical Pitfalls to Prevent

| Pitfall | Prevention | Phase |
|---------|-----------|-------|
| Flat data model can't support two business lines | Design schema from aggregation queries upward | Phase 1 |
| Data entry too slow → tool abandoned | Target 90-second daily entry; test with real workflow | Phase 2 |
| Profit figures silently inaccurate | Display exact vs. estimated indicator on every figure | Phase 3 |
| Category rename breaks historical reports | Append-only categories from day one | Phase 1 |
| No `data_source` field blocks Viber import later | Add field to all entry records in v1 schema | Phase 1 |
| No auth on financial data | Add single passphrase even for solo user | Phase 1 |

## Suggested Build Order

1. **Foundation + Data Model** — Scaffold stack, design normalized schema (revenue sources, party model with add-ons, categories, cost basis). This gates everything.
2. **Data Entry Forms** — Daily entry, party entry, cost input. Validate entry speed with real workflow.
3. **Dashboard & Analytics** — Monthly trends, category breakdowns, profit summaries, KPI cards.
4. **Parties Module** — Package management, add-on tracking, party revenue/profitability views.
5. **Stock & Suppliers** — Product catalog, stock levels, low-stock alerts, supplier directory.
6. **Polish & Extensibility** — Empty states, error handling, data_source field validation, Viber parsing groundwork.

## What NOT to Build in v1

- Multi-user auth / roles
- POS integration
- Recipe costing / ingredient management
- Viber message parsing (plan the data model, defer the parser)
- Exportable reports (PDF/CSV)
- Mobile native app
- Accounting / tax features

## Open Questions

1. **Deployment target:** Local machine, VPS, or cloud? Affects Hono server adapter choice.
2. **Party package tiers:** What are the specific packages and add-on categories? Shapes schema.
3. **Primary entry device:** Phone, tablet, or laptop? Affects form layout priorities.
4. **Supplier directory scope:** Read-only reference or full CRUD in v1?
