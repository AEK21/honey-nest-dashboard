# Phase 2: Daily Data Entry - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 02-daily-data-entry
**Areas discussed:** Entry form layout, Cost input flow, Date navigation & editing, Save behavior, Kids entry, Empty vs zero, Unsaved changes, Saved day display

---

## Entry Form Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single form, grouped | One scrollable form with sections: Retail, Playroom/Café, Kids. All visible at once. | ✓ |
| Tabs per business area | Separate tabs for Retail and Playroom/Café. | |
| Step-by-step wizard | One business area per step. Guided flow. | |

**User's choice:** Single form, grouped
**Notes:** User wanted practical and fast, not overcomplicated.

---

## Category Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Revenue only | Each category just has a revenue field. Cost in separate section. | ✓ |
| Revenue + cost inline | Both revenue and cost fields side by side per category. | |
| Revenue + optional notes | Revenue plus a notes icon per category. | |

**User's choice:** Revenue only
**Notes:** Keeps the default flow ultra-fast.

---

## Cost Input Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Expandable section below | "Add costs" toggle expands cost section below main form. Collapsed by default. | ✓ |
| Per-category expand | Each category row has its own expand arrow for cost fields. | |
| Separate cost page | Dedicated costs tab/page. | |

**User's choice:** Expandable section below
**Notes:** None

---

## Date Navigation & Editing

| Option | Description | Selected |
|--------|-------------|----------|
| Date picker + arrows, same form | Calendar popup + ←/→ arrows + Today button. Same form for new/existing dates. | ✓ |
| Separate edit view | New entries vs. editing past data are different flows. | |
| Calendar overview first | Landing is calendar view, click day to open form. | |

**User's choice:** Date picker + arrows, same form
**Notes:** None

---

## Save Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit Save button | One "Save Day" button. Confirmation toast. Unsaved changes warning. | ✓ |
| Auto-save on blur | Each field saves when owner moves to next. | |
| Save per section | Each business area section has own save button. | |

**User's choice:** Explicit Save button
**Notes:** None

---

## Kids Entry

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in Playroom section | Number field at bottom of Playroom/Café section. | ✓ |
| Separate Kids section | Own visual section with header. | |
| Standalone field at top | Prominent field at top of form. | |

**User's choice:** Inline in Playroom section
**Notes:** Contextually part of the playroom business area.

---

## Empty vs Zero

| Option | Description | Selected |
|--------|-------------|----------|
| Empty = not entered, 0 = explicit zero | Blank fields not saved. Explicit 0 means zero revenue. | ✓ |
| Empty = zero on save | All blanks treated as €0 on save. | |
| Required fields | All fields must be filled before saving. | |

**User's choice:** Empty = not entered, 0 = explicit zero
**Notes:** Distinguishes "not entered yet" from "no sales."

---

## Unsaved Changes

| Option | Description | Selected |
|--------|-------------|----------|
| Warn and confirm | Confirmation dialog: Discard or Save first? | ✓ |
| Auto-save then navigate | Auto-save before navigating. | |
| Silently discard | Navigate without warning. | |

**User's choice:** Warn and confirm
**Notes:** Prevents accidental data loss.

---

## Saved Day Display

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-filled form, same layout | Same form, pre-filled values, "Last saved" timestamp. | ✓ |
| Read-only view with Edit button | Summary view, click Edit to modify. | |
| Summary card + edit form below | Summary at top, editable form below. | |

**User's choice:** Pre-filled form, same layout
**Notes:** No visual mode change — just edit in place and re-save.

---

## Claude's Discretion

- Field validation details (min/max, decimal precision)
- Loading states and error handling UX
- Section header styling
- "Last saved" timestamp implementation
- React Hook Form vs simpler controlled inputs

## Deferred Ideas

None — discussion stayed within phase scope
