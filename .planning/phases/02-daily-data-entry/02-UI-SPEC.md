---
phase: 2
slug: daily-data-entry
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-27
---

# Phase 2 — UI Design Contract: Daily Data Entry

> Visual and interaction contract for the daily entry screen.
> All decisions reference 02-CONTEXT.md (D-01 through D-09).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (CLI-based, copied into project) |
| Preset | not applicable |
| Component library | Radix UI (via shadcn) |
| Icon library | lucide-react |
| Heading font | Cormorant Garamond (Google Fonts) |
| Body font | Inter (Google Fonts) |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing, input internal padding |
| md | 16px | Default element spacing, card padding |
| lg | 24px | Section padding, group gaps |
| xl | 32px | Layout gaps between major sections |
| 2xl | 48px | Page top/bottom padding |

Exceptions: none

---

## Typography

| Role | Font | Size | Weight | Line Height |
|------|------|------|--------|-------------|
| Page heading | Cormorant Garamond | 24px | 600 | 1.3 |
| Section heading | Cormorant Garamond | 18px | 600 | 1.3 |
| Body / input text | Inter | 14px | 400 | 1.5 |
| Label | Inter | 13px | 500 | 1.4 |
| Helper / timestamp | Inter | 12px | 400 | 1.4 |
| Button text | Inter | 14px | 500 | 1.0 |
| Currency prefix (€) | Inter | 14px | 400 | 1.0 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F8F5EF` Soft Ivory | Page background |
| Secondary (30%) | `#FCFBF8` Warm White | Cards, form sections, input backgrounds |
| Accent (10%) | `#E7C76A` Honey Yellow | Save button, active date indicator, success toast |
| Text primary | `#5F5247` Deep Brown | Headings, labels, input text |
| Text secondary | `#8D8175` Muted Taupe | Helper text, timestamps, placeholders |
| Border | `#CFC8BE` Warm Grey | Card borders, input borders, dividers |
| Mint highlight | `#BFD8D2` Dusty Mint | Playroom/Café section accent stripe |
| Destructive | `#D4564E` | Discard button in unsaved changes dialog |
| Success | `#6B9E78` | Success toast background tint |

Accent reserved for: Save Day button fill, today-date pill background, success toast icon, active cost-toggle indicator. Never used for borders or input focus rings — use Warm Grey `#CFC8BE` for focus rings with 2px offset.

---

## Screen Layout

### Page Structure (D-01, D-03, D-04)

```
┌─────────────────────────────────────────┐
│  Date Navigation Bar                    │
│  ← prev   [  March 27, 2026  ▾ ]  next →│
│                [Today]                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ Retail ──────────────────────────┐  │
│  │  Toys          [€ ________]       │  │
│  │  Gifts         [€ ________]       │  │
│  │  Lifestyle     [€ ________]       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ Playroom & Café ────────────────┐  │
│  │  Entry Fees    [€ ________]       │  │
│  │  Food          [€ ________]       │  │
│  │  Drinks        [€ ________]       │  │
│  │  ─────────────────────────────    │  │
│  │  Kids today    [  ________]       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ Costs (collapsed) ──────────────┐  │
│  │  ▶ Add costs                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [ Last saved: 14:32 ]                  │
│  [        Save Day        ]             │
│                                         │
└─────────────────────────────────────────┘
```

**Max width:** 480px centered. Single-column layout optimized for phone and narrow desktop use.

---

## Component Specifications

### 1. Date Navigation Bar (D-03)

| Element | Spec |
|---------|------|
| Container | Sticky top, Warm White background, bottom border Warm Grey 1px |
| Left arrow | `ChevronLeft` icon (lucide), 20px, Deep Brown, tappable 44px hit area |
| Right arrow | `ChevronRight` icon (lucide), 20px, Deep Brown, tappable 44px hit area |
| Date display | Button showing formatted date (e.g., "Thu, March 27"), Cormorant Garamond 18px 600 |
| Date picker | shadcn `Calendar` popover, triggered by clicking date display |
| Today button | Pill below date, Inter 12px 500, Honey Yellow background, Deep Brown text. Hidden when already on today. |
| Behavior | Arrows step ±1 day. Future dates allowed (for pre-entering). Changing date triggers unsaved-changes check (D-09). |

### 2. Section Cards (D-01)

| Element | Spec |
|---------|------|
| Container | Warm White `#FCFBF8` background, rounded-xl (12px), border 1px Warm Grey, padding lg (24px) |
| Section heading | Cormorant Garamond 18px 600 Deep Brown, margin-bottom md (16px) |
| Section accent | 3px left border on card — Honey Yellow for Retail, Dusty Mint for Playroom/Café |
| Gap between cards | xl (32px) |

### 3. Revenue Row (D-02)

| Element | Spec |
|---------|------|
| Layout | Flex row: label (left) + input (right), vertically centered |
| Label | Inter 14px 400 Deep Brown, flex-1 |
| Input | shadcn `Input`, right-aligned text, 120px width, Warm White bg, Warm Grey border |
| Currency | "€" prefix inside input (left-padded), Muted Taupe |
| Spacing | sm (8px) gap between rows |
| Validation | Numeric only, 2 decimal places max, non-negative. No min/max cap. |
| Empty state | Placeholder text "—" in Muted Taupe (D-08: empty = not entered) |
| Zero handling | User types "0" → saved as explicit zero revenue (D-08) |

### 4. Kids Count (D-06)

| Element | Spec |
|---------|------|
| Position | Bottom of Playroom/Café card, separated by a 1px Warm Grey divider with md (16px) margin above |
| Layout | Same flex row as revenue: label "Kids today" + input |
| Input | shadcn `Input`, 80px width, integer only, no decimals, non-negative |
| Icon | `Users` icon (lucide) 16px Muted Taupe, before label |
| Placeholder | "—" |

### 5. Expandable Cost Section (D-05)

| Element | Spec |
|---------|------|
| Collapsed state | Card with dashed border (Warm Grey), "Add costs" text + `ChevronDown` icon, Inter 14px 500 Muted Taupe |
| Toggle | Click anywhere on collapsed card to expand |
| Expanded state | Solid border, same card styling as sections. `ChevronUp` icon replaces down. |
| Cost rows | One per category (all 6). Layout: category label + cost input (€) + cost basis toggle |
| Cost basis toggle | Two-option pill toggle: "Exact" / "Estimated", default "Exact". Inter 12px 500. |
| Margin hint | Below each cost row, if category has `costMarginPct`: "Est. from margin: €XX.XX" in Helper style (12px Muted Taupe). Shown only when revenue exists and no exact cost entered. |
| Collapse behavior | Remembers expanded state during session. Defaults collapsed on page load. |

### 6. Save Button & State (D-07, D-04)

| Element | Spec |
|---------|------|
| Container | Below cost section, centered, full-width within max-width |
| Button | shadcn `Button`, Honey Yellow `#E7C76A` background, Deep Brown `#5F5247` text, rounded-lg (8px), height 48px, Inter 14px 500 |
| Hover | Slightly darker yellow (`#D4B55E`), subtle shadow |
| Disabled state | When no fields have values — reduced opacity (0.5), no pointer |
| Loading state | Spinner icon replaces text while saving |
| Last saved | Below button, Inter 12px 400 Muted Taupe, format: "Last saved: 14:32" or "Not yet saved" |
| Success toast | Top-right toast, 3s auto-dismiss: `Check` icon + "March 27 saved", Success green tint bg, Deep Brown text |

### 7. Unsaved Changes Dialog (D-09)

| Element | Spec |
|---------|------|
| Trigger | Navigating date (arrows, picker, Today) when form has unsaved modifications |
| Component | shadcn `AlertDialog` |
| Title | "Unsaved changes" — Inter 16px 600 |
| Body | "You have unsaved changes for {date}. What would you like to do?" — Inter 14px 400 |
| Actions | Two buttons, right-aligned: |
| Discard button | Outline style, Destructive red text `#D4564E`, "Discard" |
| Save button | Filled, Honey Yellow bg, "Save & continue" |

### 8. Saved Day Display (D-04, D-08)

| Element | Spec |
|---------|------|
| Behavior | Same form layout — fields pre-filled with saved values. No visual mode change. |
| Populated inputs | Show saved values right-aligned, normal input styling (editable) |
| Empty categories | Show blank input with "—" placeholder (not "0") |
| Last saved | Shows timestamp of most recent save for that date |
| Re-save | Same Save Day button — overwrites previous entry for that date |

---

## Interaction Patterns

### Tab Order
1. Toys → Gifts → Lifestyle → Entry Fees → Food → Drinks → Kids → Save button
2. Tab through revenue inputs top-to-bottom. Enter/Tab advances to next field.
3. Cost section only enters tab order when expanded.

### Keyboard
- `Enter` on last field (Kids) focuses Save button
- `Escape` on date picker closes it without change

### Touch
- All tappable targets minimum 44px hit area
- Revenue inputs: tap to focus, on-screen numeric keyboard (inputmode="decimal")
- Kids input: inputmode="numeric"

### Loading States
- Initial page load: skeleton shimmer on section cards (3 cards)
- Date change: brief opacity fade (150ms) on form content while fetching
- Save: button shows spinner, inputs disabled during save

### Error States
- Network error on save: destructive toast "Couldn't save — check connection", persists until dismissed
- Network error on load: inline message in form area "Couldn't load data — tap to retry" with retry button

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 480px (mobile) | Full-width with 16px horizontal padding. Cards edge-to-edge minus padding. |
| 480–768px (tablet) | Centered 480px max-width column. |
| > 768px (desktop) | Centered 480px column. Page background Soft Ivory visible on sides. |

The form is intentionally narrow — this is a data entry form, not a dashboard. Narrow width keeps inputs reachable and the flow fast.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "Save Day" |
| Empty state heading | — (no empty state page; form is always shown) |
| Empty state body | — |
| Date not saved hint | "Not yet saved" |
| Date saved hint | "Last saved: {HH:mm}" |
| Error on save | "Couldn't save — check your connection" |
| Error on load | "Couldn't load data for this date" |
| Retry action | "Tap to retry" |
| Success toast | "{Month Day} saved" (e.g., "March 27 saved") |
| Unsaved dialog title | "Unsaved changes" |
| Unsaved dialog body | "You have unsaved changes for {formatted date}. What would you like to do?" |
| Discard action | "Discard" |
| Save-and-continue action | "Save & continue" |
| Cost toggle label | "Add costs" |
| Cost basis: exact | "Exact" |
| Cost basis: estimated | "Estimated" |
| Margin hint | "Est. from margin: €{amount}" |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button, Input, Calendar, Popover, AlertDialog, Separator, Sonner (toast) | not required |

No third-party registry blocks used.

---

## shadcn Components Required

Install before implementation:

```bash
npx shadcn@latest init
npx shadcn@latest add button input calendar popover alert-dialog separator sonner
```

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — All CTAs use specific verb+noun ("Save Day"), empty/error states have clear copy with next steps, destructive action labeled explicitly
- [x] Dimension 2 Visuals: PASS — Rounded-xl cards, 3px accent borders, generous whitespace, warm premium feel matching Brand Bible. No dense data grids.
- [x] Dimension 3 Color: PASS — 60/30/10 mapped (Soft Ivory / Warm White / Honey Yellow). Accent reserved for 4 specific elements. Destructive red only for discard. No accent overuse.
- [x] Dimension 4 Typography: PASS — Two-font system (Cormorant Garamond headings, Inter body). Sizes from 12–24px with clear hierarchy. No extra fonts.
- [x] Dimension 5 Spacing: PASS — All values multiples of 4px. Consistent usage per token. No arbitrary spacing.
- [x] Dimension 6 Registry Safety: PASS — Only shadcn official registry. No third-party blocks.

**Approval:** approved 2026-03-27
