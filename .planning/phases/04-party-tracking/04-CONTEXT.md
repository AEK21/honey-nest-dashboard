# Phase 4: Party Tracking - Context

**Gathered:** 2026-03-27
**Status:** Ready for execution

<domain>
## Phase Boundary

Build party entry (CRUD), add-on itemization, and dashboard integration. Parties are a high-value revenue stream — this must feel integrated with the existing entry/analytics flow, not a siloed module.

Requirements: ENTRY-03, PARTY-01, PARTY-02, DASH-08

</domain>

<decisions>
## Data Model Decisions

### Party Fields (confirmed with owner)
- **D-01:** 4 statuses: inquiry, booked, completed, cancelled. All 4 are operationally useful.
- **D-02:** Party kids count is separate from daily kids_entries. A party with 15 kids does NOT increase playroom daily kids metric.
- **D-03:** Optional `event_type` field for future filtering (birthday, baptism, workshop, private event).
- **D-04:** Deposit is informational only — not part of revenue recognition. Balance = (package + addons) - deposit, computed in UI.
- **D-05:** No phone/email fields — this is operations, not CRM.

### Revenue Logic (confirmed with owner)
- **D-06:** Party revenue = package_price + SUM(addon_price). Only when status = 'completed'.
- **D-07:** Revenue recognized on party_date, not payment/booking date.
- **D-08:** Extra same-day cafe/playroom consumption is NOT party revenue — flows through regular daily entry.
- **D-09:** inquiry, booked, cancelled parties excluded from all dashboard aggregations.

### Schema Changes Required
- Add to `parties`: party_time, customer_name, child_name, child_age, kids_count, adults_count, deposit_amount, status, event_type
- `party_addons`: unchanged
- New migration needed

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` — Phase 4 success criteria
- `.planning/REQUIREMENTS.md` — ENTRY-03, PARTY-01, PARTY-02, DASH-08
- `server/src/db/schema.ts` — existing parties + party_addons tables
- `.planning/phases/02-daily-data-entry/02-SUMMARY.md` — form patterns to follow
- `.planning/phases/03-dashboard-analytics/03-CONTEXT.md` — dashboard integration patterns
- `server/src/routes/dashboard.ts` — aggregation endpoint patterns

</canonical_refs>
