# Phase 3: Dashboard & Analytics - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the analytics dashboard — the screen the owner sees every morning. It answers: "How is the business doing today / this month / compared to last month?" Shows KPI cards, revenue trends, category breakdowns, profit estimates, kids trends, and supports filtering by business area.

Party-specific analytics (DASH-08) are Phase 4. This phase covers DASH-01 through DASH-07.

</domain>

<decisions>
## Implementation Decisions

### Layout & Navigation
- **D-01:** Dashboard is a separate route (`/dashboard`) alongside the entry page (`/`). Bottom tab bar or top nav to switch between Entry and Dashboard. Entry stays the default landing route (owner's primary daily action is data entry, not reading charts).
- **D-02:** Dashboard is a single scrollable page — KPI cards at top, charts below, no tabs within the dashboard itself. Business area filter applies globally to the entire page.

### KPI Cards
- **D-03:** Three primary KPI cards at the top:
  1. **Today's Revenue** — total revenue for today across all areas (or filtered area)
  2. **Month-to-Date** — cumulative revenue for the current month
  3. **Gross Profit (MTD)** — estimated gross profit with exact/estimated indicator badge
- **D-04:** Each KPI card shows a comparison delta vs. same period last month (e.g., "+12%" or "-8%"). Delta is color-coded: green for positive, red for negative.

### Charts
- **D-05:** Monthly revenue trend — line/area chart comparing current month daily totals vs. previous month. X-axis: day of month (1–31). Two lines: this month vs. last month. This is the hero chart.
- **D-06:** Category income breakdown — horizontal bar chart or donut showing revenue by category for the selected period (current month). Grouped or colored by business area.
- **D-07:** Kids entry trends — simple line chart showing kids count over the last 30 days.

### Gross Profit Calculation
- **D-08:** Profit = Revenue - Cost. For each category entry:
  - If `costAmount` is entered (exact or estimated by user): use it directly
  - If no `costAmount`: estimate using `revenue * costMarginPct` from the category
  - The KPI card shows a badge: "Exact" if all costs are user-entered, "Estimated" if any are derived from margin %
- **D-09:** Profit is always computed server-side in SQL aggregation. Never send raw entries to the client for calculation.

### Business Area Filter
- **D-10:** Pill/toggle filter at the top: "All" | "Retail" | "Playroom & Cafe". When a filter is active, all KPI cards and charts update to show only that area's data. "All" is default. Parties filter exists but shows empty state until Phase 4.

### Aggregation API
- **D-11:** All dashboard data comes from dedicated aggregation endpoints, not from fetching individual daily entries. SQL does the heavy lifting:
  - `GET /api/dashboard/summary?month=YYYY-MM&area=all` — KPI totals + deltas
  - `GET /api/dashboard/trend?month=YYYY-MM&area=all` — daily revenue series for chart
  - `GET /api/dashboard/categories?month=YYYY-MM&area=all` — per-category breakdown
  - `GET /api/dashboard/kids?days=30` — kids count series

### Claude's Discretion
- Chart color palette choices (matching warm dark theme)
- Exact chart component configuration (Recharts tooltips, legends, axis formatting)
- Loading skeletons vs. spinner states
- Whether "previous month" comparison in trend chart uses calendar month or rolling 30 days
- KPI card layout (horizontal row vs. grid)

</decisions>

<canonical_refs>
## Canonical References

### Project Context
- `.planning/PROJECT.md` — Full project vision
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-07 requirements
- `.planning/ROADMAP.md` — Phase 3 success criteria

### Prior Phases
- `.planning/phases/01-foundation-data-model/01-SUMMARY.md` — Schema, @libsql/client deviation
- `.planning/phases/02-daily-data-entry/02-SUMMARY.md` — Form UI, API, dark theme direction

### Database Schema
- `server/src/db/schema.ts` — daily_entries, kids_entries, categories tables
- `server/src/db/seed-data.ts` — 8 categories with costMarginPct values

### Existing API
- `server/src/routes/daily-entries.ts` — GET/PUT for daily entries (reference for query patterns)
- `server/src/routes/categories.ts` — Category listing

### Visual Reference
- Phase 2 established warm dark theme: bg `#1C1917`, cards `#252220`, borders `#3D3530`, accent `#E7C76A`
- Typography: Cormorant Garamond headings, Inter body
- Phase 3 dashboard must continue this visual language

</canonical_refs>

<code_context>
## Existing Code Insights

### Data Available for Aggregation
- `daily_entries`: entry_date, category_id, revenue, cost_amount, cost_basis — JOIN with categories for business_area, costMarginPct
- `kids_entries`: entry_date, count
- Categories have `costMarginPct` for fallback cost estimation

### SQL Aggregation Patterns
- SQLite supports `strftime('%Y-%m', entry_date)` for month grouping
- `SUM(revenue)`, `SUM(CASE WHEN cost_amount IS NOT NULL THEN cost_amount ELSE revenue * cost_margin_pct END)` for profit calc
- Use `GROUP BY` with date for trend series, with category_id for breakdowns

### Client Stack
- TanStack Query for data fetching (already configured)
- Recharts 3.x installed and available
- React Router DOM for routing (currently only `/` route)
- Sonner for toasts
- shadcn/ui components available

### Integration Points
- `server/src/index.ts` — mount new dashboard route module
- `client/src/App.tsx` — add Dashboard route + navigation
- Need nav component to switch between Entry and Dashboard

</code_context>

<specifics>
## Specific Ideas

- The dashboard should feel like opening a premium morning briefing — clean, focused, not overwhelming
- KPI cards should be scannable in under 3 seconds (the "morning glance")
- Charts should use the warm dark theme palette — honey yellow for primary series, dusty mint for comparison, muted tones for secondary data
- Area chart with gradient fill looks better than plain line chart on dark backgrounds
- Consider adding a subtle date range indicator so the owner always knows what period they're looking at
- Empty state: if no data exists for the month, show a friendly message directing to the entry page
- The kids trend chart is a secondary concern — it can be smaller or positioned below the main charts

</specifics>

<deferred>
## Deferred Ideas

- DASH-08 (party revenue summary) — Phase 4
- Year-over-year comparisons — v2 (ADV-01)
- CSV/PDF export — v2 (ADV-02)
- Profit margin trends — v2 (ADV-03)

</deferred>

---

*Phase: 03-dashboard-analytics*
*Context gathered: 2026-03-27*
