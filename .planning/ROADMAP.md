# Roadmap: Honey Nest Dashboard

## Overview

Build an internal business dashboard for Honey Nest from the ground up. Start with the data model and project scaffold (Phase 1), then build daily data entry forms (Phase 2), followed by the analytics dashboard (Phase 3). Party tracking gets its own focused phase (Phase 4). Stock and supplier management round out the core (Phase 5). A final polish phase (Phase 6) ties everything together into a cohesive, brand-aligned experience.

## Phases

- [x] **Phase 1: Foundation & Data Model** - Scaffold the full-stack project and design the normalized database schema (441d77e)
- [x] **Phase 2: Daily Data Entry** - Build entry forms for all business areas with fast, frictionless input (9f53bb8)
- [x] **Phase 3: Dashboard & Analytics** - Build the main analytics dashboard with KPIs, trends, and charts (a6da68f)
- [x] **Phase 4: Party Tracking** - Party entry with packages and add-ons, party revenue views (e32ec8a)
- [ ] **Phase 5: Operational Polish** - CSV export, PWA installability, empty states, error boundary
- [ ] **Phase 6: Stock & Suppliers** - Product list, stock levels, low-stock alerts, supplier directory

## Phase Details

### Phase 1: Foundation & Data Model
**Goal**: Scaffold the full-stack project (Vite + React + Hono + SQLite + Drizzle) and design a normalized data model that supports two business areas, category-based income, party add-ons, and dual cost tracking. One working end-to-end route proves the stack works.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**UI hint**: no
**Success Criteria** (what must be TRUE):
  1. Project runs locally with `npm run dev` — React frontend and Hono API server both start
  2. SQLite database is created with tables for daily entries, categories, parties, party add-ons, products, suppliers, and cost records
  3. Categories are append-only by design (no update/delete on category names)
  4. All entry-related tables include a `data_source` field defaulting to `manual`
  5. One test API route (e.g., GET /api/health) returns data from the database, proving full-stack wiring works
**Plans**: 3 plans

Plans:
- [ ] 01-01: Project scaffold (Vite, React, TypeScript, Tailwind, shadcn/ui, Hono, SQLite, Drizzle)
- [ ] 01-02: Database schema design and Drizzle migrations
- [ ] 01-03: API skeleton and full-stack wiring verification

### Phase 2: Daily Data Entry
**Goal**: Build the daily entry forms so the owner can record sales by business area, kids entries, and cost data — completing the core data input loop. Entry must be fast and frictionless (target: under 90 seconds for a typical day).
**Depends on**: Phase 1
**Requirements**: ENTRY-01, ENTRY-02, ENTRY-04, ENTRY-05, ENTRY-06, ENTRY-07
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can select a date and enter sales data for Retail / concept store
  2. User can select a date and enter sales data for Playroom / café
  3. User can enter revenue broken down by product category (food, drinks, toys, entry fees, party packages)
  4. User can enter kids entry count for playroom for a given date
  5. User can enter cost data using per-item cost or category margin percentage
  6. User can edit previously entered data for any past date
  7. All entries are saved to SQLite and persist across page refreshes
**Plans**: 3 plans

Plans:
- [ ] 02-01: Daily entry form UI (date picker, business area tabs, category fields)
- [ ] 02-02: Cost entry and category margin input
- [ ] 02-03: Edit mode for past entries and data persistence validation

### Phase 3: Dashboard & Analytics
**Goal**: Build the main analytics dashboard showing monthly trends, daily summaries, month-to-date totals, category breakdowns, gross profit, kids trends, and business area filtering. This is the primary screen the owner sees every morning.
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Landing page shows monthly revenue trend chart (current month vs. previous month)
  2. User sees today's daily revenue summary
  3. User sees month-to-date revenue totals
  4. User sees category-based income breakdown (by product type)
  5. User sees estimated gross profit with clear indicator of exact vs. estimated basis
  6. User sees kids entry count trends over time
  7. User can filter the entire dashboard by business area (Retail, Playroom/Café, Parties)
  8. All analytics are computed via SQL aggregation queries, not client-side
**Plans**: 4 plans

Plans:
- [ ] 03-01: KPI cards (daily summary, month-to-date, gross profit)
- [ ] 03-02: Monthly trend chart and kids entry trends (Recharts)
- [ ] 03-03: Category income breakdown and business area filter
- [ ] 03-04: Aggregation API endpoints and query optimization

### Phase 4: Party Tracking
**Goal**: Build party entry with base package selection and add-on itemization, and surface party revenue in the dashboard (packages vs. add-ons breakdown).
**Depends on**: Phase 2
**Requirements**: ENTRY-03, PARTY-01, PARTY-02, DASH-08
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can record a party with a base package type and price
  2. User can add individual add-on line items (food, decorations, extras) with prices
  3. Party data is stored with normalized structure (party → add-ons relationship)
  4. Dashboard shows party revenue summary splitting package revenue from add-on revenue
**Plans**: 2 plans

Plans:
- [ ] 04-01: Party entry form (package selection, add-on itemization)
- [ ] 04-02: Party revenue summary widget and DASH-08 integration

### Phase 5: Stock & Suppliers
**Goal**: Build a simple product list with stock levels and low-stock alerts, plus a supplier directory with contact info and notes.
**Depends on**: Phase 1
**Requirements**: STOCK-01, STOCK-02, STOCK-03, SUPP-01
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can add, edit, and view products (name, category, cost price)
  2. User can view and update stock levels for each product
  3. Dashboard or stock page shows low-stock warnings when quantities fall below threshold
  4. User can manage a supplier list with name, contact info, and notes
**Plans**: 2 plans

Plans:
- [ ] 05-01: Product list and stock level management
- [ ] 05-02: Low-stock alerts and supplier directory

### Phase 6: Polish & Integration
**Goal**: Tie all modules into a cohesive experience. Apply Honey Nest brand styling (colors, typography, warmth), handle empty states, ensure navigation flows smoothly between entry and analytics, and verify the full end-to-end workflow works.
**Depends on**: Phase 3, Phase 4, Phase 5
**Requirements**: (cross-cutting — validates all requirements work together)
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Dashboard uses Honey Nest brand colors (Soft Ivory backgrounds, Deep Brown text, Honey Yellow accents)
  2. Navigation between all modules (entry, dashboard, parties, stock, suppliers) is smooth and intuitive
  3. Empty states are handled gracefully (no broken charts or blank screens on first use)
  4. Full end-to-end workflow works: enter data → see it reflected in dashboard analytics
  5. UI feels warm and premium — rounded corners, soft cards, generous whitespace (not a generic admin panel)
**Plans**: 2 plans

Plans:
- [ ] 06-01: Brand styling, navigation, and layout polish
- [ ] 06-02: Empty states, edge cases, and end-to-end validation
