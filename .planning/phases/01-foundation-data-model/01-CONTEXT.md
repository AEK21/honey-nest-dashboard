# Phase 1: Foundation & Data Model - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the full-stack project (Vite + React + Hono + SQLite + Drizzle) and design a normalized database schema that supports two business areas (Retail, Playroom/Café), party tracking with add-ons, category-based income, and dual-level cost tracking. One working end-to-end route proves the stack works.

</domain>

<decisions>
## Implementation Decisions

### Schema Structure
- **D-01:** Daily sales entries use **daily totals per category** granularity — one row per day per category (e.g., "March 27, Food, €320"). No line-item transaction detail. Optimized for fast manual entry.
- **D-02:** Party data **rolls into daily revenue** — party totals auto-add to that day's revenue under the party packages category. Party detail (base package + add-ons) stored separately but revenue flows into the daily view for unified analytics.
- **D-03:** Cost tracking lives at **both levels** — products have individual cost prices, categories have fallback margin percentages. Dashboard uses product cost where available, category % otherwise. Every profit figure must indicate which basis was used.
- **D-04:** Business areas (Retail, Playroom/Café, Parties) are **derived from category** — each category record has a `business_area` field (e.g., "Toys" → Retail, "Entry fees" → Playroom). Daily entries reference the category; business area is looked up through it. Safe for v1 — the business has clean separation between areas. If a category ever needs to span two areas, adding a direct field to entries is a simple migration.
- **D-05:** Categories are **append-only** with soft management — the category ID and original slug are never altered or deleted. Categories have a mutable `display_name` (for UI labeling) and an `active` flag (false = hidden from entry forms, still visible in historical reports). Historical data integrity preserved. (From FOUND-02)
- **D-06:** All entry records include a **`data_source`** field defaulting to `manual`. Enables Viber import in v2. (From FOUND-03)

### Project Structure
- **D-07:** **Monorepo** layout — single repo with `/client` and `/server` folders. Shared types between frontend and backend. Single `npm run dev` starts both.
- **D-08:** Client uses **feature/domain-oriented** folder structure: `features/daily-entry/`, `features/dashboard/`, `features/parties/`, `features/stock/`, `features/suppliers/`. Each feature owns its components, hooks, and schemas. Shared UI primitives (shadcn/ui) in `components/ui/`. Shared utilities and API client in `lib/`.

### Claude's Discretion
- Category design details (specific initial categories, how they're seeded) — Claude can derive from PROJECT.md context
- Deployment configuration — local development setup is sufficient for Phase 1; deployment target TBD

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project vision, brand context, constraints, key decisions
- `.planning/REQUIREMENTS.md` — v1 requirements with REQ-IDs; Phase 1 covers FOUND-01, FOUND-02, FOUND-03

### Research
- `.planning/research/STACK.md` — Recommended stack with versions and rationale
- `.planning/research/ARCHITECTURE.md` — System architecture, component boundaries, data flow
- `.planning/research/PITFALLS.md` — Critical pitfalls including data model warnings
- `.planning/research/SUMMARY.md` — Synthesized research findings

### Brand
- `docs/brand/Honey_Nest_Brand_Bible_v1_1.md` — Brand colors, typography, UI direction (apply in Phase 6, but schema/naming should be brand-aware)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established by this phase

### Integration Points
- This phase establishes the foundation all other phases build on
- Schema must support: daily entry forms (Phase 2), analytics aggregation queries (Phase 3), party tracking (Phase 4), stock/supplier management (Phase 5)

</code_context>

<specifics>
## Specific Ideas

- Party model must support base package + configurable add-ons (food, decorations, extras). Each add-on is a separate line item with its own price. This is critical for DASH-08 (packages vs. add-ons revenue split).
- Categories map to business areas: Retail categories (toys, gifts, accessories), Playroom/Café categories (entry fees, food, drinks), Party categories (party packages, party add-ons). The owner thinks about income by product type, not by area.
- Profit indicators must distinguish exact (per-item cost) from estimated (category margin %). This is a pitfall from research — silent inaccuracy destroys trust.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-data-model*
*Context gathered: 2026-03-27*
