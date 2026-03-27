# Phase 1: Foundation & Data Model - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 01-foundation-data-model
**Areas discussed:** Schema structure, Project structure

---

## Schema Structure

### Q1: How granular should daily sales entry be?

| Option | Description | Selected |
|--------|-------------|----------|
| Daily totals per category | One row per day per category. Simplest entry, fast. | ✓ |
| Line items per transaction | Individual items sold. More detail, slower entry. | |
| Daily totals + optional notes | Category totals with free-text notes. Balance of speed and detail. | |

**User's choice:** Daily totals per category
**Notes:** Optimized for fast manual entry by solo operator.

### Q2: How should party data relate to daily entries?

| Option | Description | Selected |
|--------|-------------|----------|
| Parties are separate | Party entries in own table, linked by date. Dashboard combines. | |
| Parties roll into daily | Party total auto-adds to daily revenue. Detail stored separately. | ✓ |
| You decide | Claude picks best approach for clean analytics. | |

**User's choice:** Parties roll into daily
**Notes:** Party revenue appears in unified daily/monthly analytics alongside other revenue.

### Q3: For cost tracking — where does cost data live?

| Option | Description | Selected |
|--------|-------------|----------|
| On the category | Each category has a default margin %. Applied automatically. | |
| On the product | Each product has a cost price. Category % as fallback. | |
| Both levels | Products have cost prices, categories have fallback margin %. | ✓ |

**User's choice:** Both levels
**Notes:** Dual cost tracking as discussed during requirements.

### Q4: How should business areas be represented?

| Option | Description | Selected |
|--------|-------------|----------|
| Tag on each entry | Each row has a 'business_area' field. | |
| Separate tables | Different tables for retail vs. playroom entries. | |
| Derived from category | Categories belong to a business area. No extra field. | ✓ |

**User's choice:** Derived from category
**Notes:** Categories map to business areas, keeping the schema simpler.

---

## Project Structure

### Q5: How should client and server code be organized?

| Option | Description | Selected |
|--------|-------------|----------|
| Monorepo (Recommended) | Single repo: /client and /server. Shared types. One dev command. | ✓ |
| Single app | Hono serves React directly. Everything in one package. | |
| You decide | Claude picks simplest approach. | |

**User's choice:** Monorepo
**Notes:** None

### Q6: How should features be organized within the client?

| Option | Description | Selected |
|--------|-------------|----------|
| Feature-based | features/daily-entry/, features/dashboard/, etc. | |
| Layer-based | components/, hooks/, pages/, api/ | |
| You decide | Claude picks best for this project size. | ✓ |

**User's choice:** You decide (Claude's discretion)
**Notes:** None

---

## Claude's Discretion

- Client folder organization (feature-based vs. layer-based)
- Category design details and initial seed data
- Deployment configuration for local development

## Deferred Ideas

None — discussion stayed within phase scope
