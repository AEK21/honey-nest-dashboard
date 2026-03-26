# Stack Research

**Domain:** Internal business operations and analytics dashboard (manual data entry, revenue/profit tracking, charts)
**Researched:** 2026-03-27
**Confidence:** MEDIUM-HIGH (core choices verified via multiple sources; version numbers from npm/official releases)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.x | UI framework | Stable, dominant ecosystem for SPAs. v19 is now production-stable (released Dec 2024, v19.2 Oct 2025). shadcn/ui and all charting libraries target it. |
| Vite | 8.x | Build tool / dev server | The standard for non-SSR React apps in 2025. Sub-second HMR, zero-config TypeScript, tiny bundles. Internal dashboards don't need SSR/SEO — Vite's SPA model is ideal. No Next.js overhead needed. |
| TypeScript | 5.x | Language | Type safety pays off specifically for data models (sales entries, cost records, product categories) with many related shapes. Drizzle ORM and Zod derive types automatically, eliminating duplicate definitions. |
| Tailwind CSS | 4.x | Styling | shadcn/ui now requires Tailwind v4. Co-located utility classes are faster to iterate on than CSS modules for internal tools. No design handoff needed — owner doesn't care about pixel-perfect CSS. |
| shadcn/ui | latest (CLI-based) | UI component library | Components are copied into your project (not a npm dependency), giving full ownership. Tailwind v4 + React 19 support confirmed in Feb 2025 update. Includes Date Pickers, Dialogs, Tables, Selects — exactly what data entry forms need. Grows with the project without fighting a library's design system. |

### Backend & Data Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Hono | 4.x | API server (Node.js) | Lightweight, TypeScript-native, and has built-in RPC that shares types between server and React client. 3x faster than Express. For a solo-user internal tool, the full-featured NestJS or Fastify ecosystem is unnecessary overhead. Hono's RPC eliminates manual API type duplication. |
| SQLite (via better-sqlite3) | 9.x | Database | Single-file database — no server process, no connection pooling, zero config. Perfect for solo-user internal tools. The entire database is one `.db` file that can be backed up by copying it. Handles years of daily sales entries comfortably. |
| Drizzle ORM | 0.40.x | Database ORM / migrations | TypeScript-first, thin layer over SQL. Auto-generates TypeScript types from schema definitions. Has `drizzle-kit` for schema migrations. Better alternative to Prisma for SQLite (Prisma's query engine is heavier than needed here). Drizzle stays close to SQL, making complex analytics queries (monthly aggregations, category rollups) easy to write and reason about. |

### Forms & Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React Hook Form | 7.x | Form state management | Uncontrolled inputs — no re-render on every keystroke. Critical for fast, frictionless data entry (the owner's primary UX requirement). Zero dependencies, smaller bundle than Formik. Integrates cleanly with shadcn/ui form components. |
| Zod | 3.x | Schema validation | TypeScript-first runtime validation. Integrates with React Hook Form via `@hookform/resolvers/zod`. Schemas double as TypeScript type sources, so a `DailySalesEntry` Zod schema gives you both the form validation and the TS type for free. v4 is now available but v3 (3.25+) is widely supported and stable. |

### Charts & Analytics

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | 3.x | Charts and data visualization | SVG-based, React-native, composable API. Current stable is 3.8.x (released mid-2025). Handles the required chart types: line charts (monthly trends), bar charts (category breakdowns), area charts (revenue over time). Lighter and more React-idiomatic than Chart.js (which is canvas-based and harder to style). Tremor is built on Recharts but adds abstraction that would limit custom party/retail breakdown layouts. |

### Data Fetching

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TanStack Query | 5.x | Server state management / caching | Handles fetch/cache/refetch lifecycle automatically. Keeps the dashboard views in sync after a form submission without manual cache invalidation. Current version 5.95.x. For an internal tool with no real-time requirements, this is the lowest-friction way to wire up API calls to UI state. |

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@hookform/resolvers` | 3.x | Connects Zod schemas to React Hook Form | Every form — wire `zodResolver` for automatic type-safe validation |
| `date-fns` | 4.x | Date utilities | Monthly grouping, date range comparisons for analytics queries |
| `lucide-react` | 0.x (latest) | Icon set | shadcn/ui uses Lucide by default; keep consistent |
| `clsx` + `tailwind-merge` | latest | Conditional className utilities | Included with shadcn/ui setup; use `cn()` utility throughout |
| `better-sqlite3` | 11.x | SQLite Node.js driver | Synchronous, fast, works perfectly with Hono on Node.js |
| `drizzle-kit` | 0.30.x | Schema migrations CLI | Run alongside drizzle-orm; generates and applies SQL migrations |

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript 5.x | Type checking | Vite does NOT type-check by default — add `tsc --noEmit` to CI or pre-commit |
| ESLint + `@typescript-eslint` | Code quality | Scaffold with `npm create vite@latest -- --template react-ts` includes ESLint config |
| Vite dev server proxy | Route `/api` to Hono | Configure `server.proxy` in `vite.config.ts` so the React app and Hono backend share one port in dev |
| drizzle-kit studio | Visual DB browser | `npx drizzle-kit studio` — inspect SQLite data during development without external tooling |

---

## Installation

```bash
# Scaffold React + TypeScript app
npm create vite@latest honey-nest-dashboard -- --template react-ts
cd honey-nest-dashboard

# Core UI
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init

# Backend
npm install hono @hono/node-server better-sqlite3
npm install -D @types/better-sqlite3

# ORM
npm install drizzle-orm
npm install -D drizzle-kit

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Charts
npm install recharts

# Data fetching
npm install @tanstack/react-query

# Utilities
npm install date-fns lucide-react clsx tailwind-merge
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite | Next.js | If you need SSR, SEO, or public-facing pages. This dashboard has none of those requirements. Next.js adds deployment complexity (Node server required) with no benefit here. |
| shadcn/ui | MUI (Material UI) | If you need a very large pre-built component set and don't mind fighting Material Design aesthetics. MUI's theming system is heavier to customise. |
| shadcn/ui | Ant Design | For data-heavy enterprise admin panels where ProTable and ProForm components matter. Ant Design's opinionated styling is harder to make "feel custom" for a small business owner. |
| Hono | Express | Express is fine, but has no built-in TypeScript RPC, is slower, and is effectively in maintenance mode. Only use Express if the team already knows it deeply and type-sharing is not a priority. |
| Hono | Fastify | Fastify is better for high-throughput public APIs. For an internal dashboard with <10 req/s, its added plugin complexity isn't worth it. |
| SQLite | PostgreSQL | Use PostgreSQL when you need concurrent writes from multiple users, complex full-text search, or cloud-hosted managed DB. A solo-user dashboard with manual entry doesn't need it. |
| Drizzle ORM | Prisma | Prisma's query engine is a separate binary (~40MB), adds cold-start latency, and its SQLite support is secondary to PostgreSQL. Drizzle is lighter and stays closer to SQL for analytics queries. |
| Recharts | Tremor | Tremor is built on Recharts but adds a high-level abstraction layer. It produces good-looking dashboards fast but limits custom layouts (e.g., combined party + retail breakdown views). Use Tremor for pure metrics dashboards with no custom layout needs. |
| Recharts | Chart.js / react-chartjs-2 | Chart.js is canvas-based. SVG (Recharts) is easier to style with Tailwind and avoids canvas sizing quirks. |
| React Hook Form | Formik | Formik re-renders on every keystroke — acceptable for simple login forms, not for daily multi-field sales entry forms. |
| TanStack Query | SWR | TanStack Query v5 has better devtools, mutation support, and cache invalidation patterns. SWR is simpler but less capable for dashboards that need optimistic updates after form submissions. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App (CRA) | Deprecated since 2023, no longer maintained, slow builds, outdated Webpack config | `npm create vite@latest` |
| Next.js (for this project) | SSR/file-based routing adds complexity with zero benefit for a private, single-user internal tool. No SEO needed. Forces Node server deployment. | Vite SPA + Hono API |
| Prisma | Binary query engine is oversized for SQLite + solo-user workload. Migration workflow is more complex. | Drizzle ORM |
| Redux / Zustand (for server state) | Server state (fetched data) belongs in TanStack Query, not a client state store. This avoids the "dual state" anti-pattern. | TanStack Query for server state; React `useState` / `useReducer` for UI-only state |
| SQL.js (in-browser SQLite) | Runs SQLite in the browser via WASM — data exists only in-browser memory, not persisted to disk on a server. Not suitable for a business tracking system where data must survive browser refreshes and be accessible from multiple devices. | better-sqlite3 (server-side) |
| Vitest UI or Playwright (in MVP) | Testing infrastructure is valuable but is a Phase 2+ concern. Adding it before the data model is validated wastes time. | Add after MVP is usable |

---

## Stack Patterns by Variant

**If the owner wants to access the dashboard from multiple devices (phone + laptop):**
- Deploy the Hono server on a persistent host (e.g., a Raspberry Pi on the local network, or a cheap VPS like Hetzner CX11 at ~$4/month)
- The SQLite file lives on the server; all devices connect via the browser
- No change to the code architecture

**If Viber order parsing is added in v2:**
- Add a `/api/viber/parse` endpoint in Hono
- Use a regex/NLP step to extract customer names + items + quantities from pasted text
- Store parsed orders in a new `viber_orders` table; link to existing `sales_entries`
- No changes to the v1 data model required if the schema is designed with this in mind (foreign keys, category IDs)

**If multi-user access is added in v2:**
- Add `better-auth` or `lucia` (both TypeScript-native, work with SQLite)
- SQLite can handle multi-user reads; still fine for low concurrency
- Consider migrating to PostgreSQL (Drizzle schema migration is straightforward) only if concurrent writes become a bottleneck

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| shadcn/ui (latest CLI) | Tailwind CSS 4.x, React 19.x | Confirmed Feb 2025. Tailwind v3 + React 18 still work but new components default to v4/19. |
| Recharts 3.x | React 18.x and 19.x | 3.0 released June 2025; peer dep supports both React versions |
| Drizzle ORM 0.40.x | better-sqlite3 9.x, Node.js 20+ | Use `drizzle-kit` matching drizzle-orm version; mismatched versions cause migration errors |
| TanStack Query 5.x | React 18.x and 19.x | v5 is stable; devtools are a separate package (`@tanstack/react-query-devtools`) |
| React Hook Form 7.x | React 18.x and 19.x | `@hookform/resolvers` v3 supports both Zod v3 and v4 |
| Hono 4.x | Node.js 20+ | Use `@hono/node-server` adapter for Node.js deployment; Hono itself is runtime-agnostic |

---

## Sources

- Vite official docs (vite.dev) — confirmed Vite 8 is current stable, Node.js 20.19+ requirement
- React official blog (react.dev) — confirmed React 19.2 stable, released Oct 2025
- shadcn/ui changelog (ui.shadcn.com/docs/changelog) — confirmed Tailwind v4 + React 19 support Feb 2025
- Recharts npm (npmjs.com/package/recharts) — confirmed 3.8.x is latest stable
- TanStack Query releases (github.com/tanstack/query/releases) — confirmed 5.95.x current
- Drizzle ORM docs (orm.drizzle.team) — confirmed 0.40.x, v1 beta branch separate
- Hono docs (hono.dev/docs/concepts/stacks) — confirmed RPC pattern, Vite integration
- LogRocket: "Best React chart libraries 2025" — MEDIUM confidence, cross-referenced with npm stats
- Multiple WebSearch results comparing Vite vs Next.js for SPAs/internal tools — MEDIUM confidence
- DataCamp, Airbyte: SQLite vs PostgreSQL comparison — MEDIUM confidence, consistent across sources

---

*Stack research for: Honey Nest Dashboard — internal business operations and analytics dashboard*
*Researched: 2026-03-27*
