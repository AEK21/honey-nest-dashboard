# Phase 2: Daily Data Entry - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the daily entry forms so the owner can record sales by business area, kids entries, and cost data. Entry must be fast and frictionless (target: under 90 seconds for a typical day). This phase covers the full data input loop — entering, saving, navigating dates, and editing past entries.

Party entry is NOT part of this phase (Phase 4). This phase handles the 6 revenue categories (Retail: toys, gifts, lifestyle; Playroom/Café: entry fees, food, drinks) plus kids count.

</domain>

<decisions>
## Implementation Decisions

### Form Layout
- **D-01:** Single scrollable form with grouped sections — Retail (Toys, Gifts, Lifestyle), Playroom/Café (Entry Fees, Food, Drinks), plus Kids Count inline in Playroom section. All visible at once for maximum speed. No tabs, no wizard.
- **D-02:** Each category row shows revenue field only (€ amount). Cost entry is a separate expandable section, collapsed by default. This keeps the default daily flow ultra-fast — most days the owner just enters revenue totals.

### Date Navigation & Editing
- **D-03:** Date picker (calendar popup) + ←/→ arrow buttons + "Today" button at the top of the form. Arrows step one day at a time. Today button always returns to current date. Form opens on today's date by default.
- **D-04:** Same form for new and existing dates. When navigating to a date with saved data, fields are pre-filled with existing values. No separate "edit mode" — just edit in place and re-save. A subtle "Last saved" timestamp shows when data was last saved.

### Cost Input
- **D-05:** Expandable "Add costs" toggle below the main form. When expanded, shows cost amount field + cost basis toggle (exact/estimated) for each category. Collapsed by default. Category margin percentages auto-fill estimated costs when no exact cost is entered.

### Kids Entry
- **D-06:** Kids count is a number input field at the bottom of the Playroom/Café section, below Drinks. Simple integer input. It is contextually part of the playroom business area.

### Save & Validation
- **D-07:** Explicit "Save Day" button at the bottom. One save commits all entered data for that date. Success confirmation toast (e.g., "March 27 saved"). No auto-save.
- **D-08:** Empty field = not entered (row is NOT saved to database). Explicit 0 = zero revenue (row IS saved). When loading a saved day, categories without entries show blank, not 0. This distinguishes "not entered yet" from "no sales."
- **D-09:** When navigating to a different date with unsaved changes, show a confirmation dialog: "You have unsaved changes. Discard or Save first?" with Discard / Save options. Prevents accidental data loss.

### Claude's Discretion
- Field validation details (e.g., min/max values, decimal precision for currency)
- Loading states and error handling UX
- Exact styling of section headers and grouping visuals
- Implementation of the "Last saved" timestamp display
- Whether to use React Hook Form or simpler controlled inputs

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand context, constraints, key decisions
- `.planning/REQUIREMENTS.md` — v1 requirements with REQ-IDs; Phase 2 covers ENTRY-01, ENTRY-02, ENTRY-04, ENTRY-05, ENTRY-06, ENTRY-07

### Prior Phase
- `.planning/phases/01-foundation-data-model/01-CONTEXT.md` — Schema decisions (D-01 through D-08) that constrain data entry
- `.planning/phases/01-foundation-data-model/01-SUMMARY.md` — What was built, including @libsql/client deviation

### Database Schema
- `server/src/db/schema.ts` — Drizzle schema with all 7 tables; daily_entries has UNIQUE(entry_date, category_id)
- `server/src/db/seed-data.ts` — 8 seed categories with business areas and sort orders

### Brand
- `docs/brand/Honey_Nest_Brand_Bible_v1_1.md` — Brand colors, typography, UI direction

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/lib/api.ts` — Hono RPC client (`hc<AppType>`) for typed API calls
- `client/src/features/daily-entry/` — Empty directory ready for feature code
- TanStack Query available for server state management
- Tailwind CSS v4 with brand colors already used in App.tsx (#F8F5EF, #5F5247, #E7C76A, #BFD8D2)

### Established Patterns
- Server routes in `server/src/routes/` — Hono route modules exported as default
- DB queries use Drizzle ORM with `@libsql/client` (NOT better-sqlite3)
- `drizzle-orm/libsql` for imports (not `drizzle-orm/better-sqlite3`)
- Categories loaded via `db.select().from(categories).where(eq(categories.active, true)).orderBy(categories.sortOrder)`

### Integration Points
- `server/src/index.ts` mounts routes with `app.route('/api/...', routeModule)` — new daily entry routes follow this pattern
- `client/src/App.tsx` currently just shows health check — will need routing to daily entry page
- Category data available from `GET /api/categories` — entry form should fetch and display these

</code_context>

<specifics>
## Specific Ideas

- Revenue fields should use € currency formatting (the business is in Greece)
- The form should feel warm and premium per brand bible — soft cards, generous whitespace, not a dense data grid
- "Under 90 seconds" target: owner opens app, sees today's form, enters ~6 revenue amounts + kids count, hits Save. That's the happy path.
- Cost entry is optional but available — most days the owner may skip it entirely, hence collapsed by default
- The expandable cost section should show which categories already have estimated costs via margin % (visual hint that costs exist even without explicit entry)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-daily-data-entry*
*Context gathered: 2026-03-27*
