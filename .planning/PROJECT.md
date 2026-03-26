# Honey Nest Dashboard

## What This Is

An internal web-based business dashboard for Honey Nest — a business with two connected operational areas: a retail/concept store and a playroom + café + parties venue. The dashboard helps the owner track daily operations, revenue, costs, and profitability across all business lines through manual data entry and visual analytics.

## Core Value

The owner can enter daily business data quickly and see clear revenue, cost, and profit summaries across all business areas — making informed decisions without spreadsheets.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Daily data entry for retail and playroom/café/parties
- [ ] Dashboard showing daily and monthly revenue trends
- [ ] Kids entry tracking (playroom)
- [ ] Category-based income breakdown (by product type: food, drinks, toys, entry fees, party packages)
- [ ] Basic cost input with estimated gross profit calculation
- [ ] Party revenue summaries (base package + extras)
- [ ] Retail product performance summaries
- [ ] Monthly trend view as primary landing page KPI
- [ ] Basic stock tracking and low-stock alerts (MVP level)
- [ ] Basic supplier directory (MVP level)
- [ ] Strong, extensible data model for future features

### Out of Scope

- Public-facing website or marketing — this is internal only
- Multi-user access control / staff accounts — solo owner use for v1
- Real-time POS integration — manual entry first
- Full raw materials / food cost tracking — basic cost input only for v1
- End-of-day Viber order parsing — planned for v2, not required in v1
- Mobile native app — web app accessible from any device
- Advanced reporting (custom report builder, exports) — v2

## Context

- **Business structure:** Two connected areas sharing some operations. Retail sells physical products (concept store). Playroom charges entry fees, runs a café (food/drinks), and hosts parties (package + extras pricing).
- **Physical space:** Ground floor = café/bar + concept store. First floor = playroom, kitchen, family area. Internal zones: "Hive Room" (events/workshops), "The Nest" (upstairs kids area).
- **Current state:** No formal tracking system. Manual methods (spreadsheets, notebooks). No POS system.
- **Data entry:** Owner is sole user — data entry must be fast and frictionless since there's no staff doing it.
- **Income categories:** Organized by product type (food, drinks, toys, entry fees, party packages) rather than by business area.
- **Cost tracking approach:** Per-item cost where available, category-based margin percentage as fallback. Both methods supported.
- **Party model:** Base package price + configurable add-ons (food, decorations, etc.). Parties are a high-value revenue stream — premium but warm styling.
- **Retail identity:** Curated concept store (Little Dutch, Legami, Studio Roof, etc.) — high-margin, design-driven, giftable products. Not generic children's commerce.
- **Viber context:** End-of-day Viber messages contain order lists (customer names + items + quantities). Parsing planned for future but not v1 blocker.
- **Primary KPI view:** Monthly trend (how this month tracks vs. last month) is what the owner wants to see first.
- **Brand Bible:** See `docs/brand/Honey_Nest_Brand_Bible_v1_1.md` for full brand context. Dashboard should reflect brand tone (warm, premium, calm) without being a marketing site.

## Brand Context (Dashboard Application)

The dashboard is an internal tool, not customer-facing. Brand Bible applies as follows:

- **Color palette:** Use Honey Nest colors for UI chrome — Soft Ivory (#F8F5EF) backgrounds, Deep Soft Brown (#5F5247) text, Honey Yellow (#E7C76A) accents, Dusty Mint (#BFD8D2) for secondary elements. Warm, not sterile.
- **Typography:** Inter for UI/body (clean, readable). Cormorant Garamond optional for dashboard headers if it feels right. No harsh tech fonts.
- **UI feel:** Rounded corners, soft cards, generous whitespace, subtle shadows. Premium simplicity — not a generic admin panel. The owner should enjoy using it.
- **Tone:** Labels and copy should feel warm and clear, not corporate. "Today's overview" not "Daily Report Generator."
- **What to avoid:** Harsh black backgrounds, neon accents, cluttered layouts, generic SaaS aesthetics, aggressive data-dense tables without breathing room.

## Constraints

- **Stack**: Web application (browser-based, any device)
- **Users**: Single user (owner) — no auth complexity needed for v1
- **Data entry**: Must be manual-first, fast, and low-friction
- **Scope**: MVP-focused — clean and usable, not overloaded

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app over desktop | Accessible from any device, no installation | — Pending |
| Manual data entry first | No existing POS to integrate with | — Pending |
| Income by product type | Matches how owner thinks about the business | — Pending |
| Dual cost tracking (per-item + category %) | Flexibility — precise where possible, estimated where not | — Pending |
| Viber parsing deferred to v2 | Keeps v1 focused; can be added cleanly later | — Pending |
| Single user, no auth for v1 | Solo operator, internal tool — complexity not justified yet | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after initialization*
