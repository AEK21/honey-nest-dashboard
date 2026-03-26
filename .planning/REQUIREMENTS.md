# Requirements: Honey Nest Dashboard

**Defined:** 2026-03-27
**Core Value:** The owner can enter daily business data quickly and see clear revenue, cost, and profit summaries across all business areas.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Data Entry

- [ ] **ENTRY-01**: User can enter daily sales data for Retail / concept store by date
- [ ] **ENTRY-02**: User can enter daily sales data for Playroom / café by date
- [ ] **ENTRY-03**: User can enter party data with base package selection and add-on line items
- [ ] **ENTRY-04**: User can enter revenue by product category (food, drinks, toys, entry fees, party packages)
- [ ] **ENTRY-05**: User can enter kids entry count for playroom by date
- [ ] **ENTRY-06**: User can enter cost data (per-item cost or category margin percentage)
- [ ] **ENTRY-07**: User can edit or correct previously entered daily data

### Dashboard & Analytics

- [ ] **DASH-01**: User sees monthly revenue trend (current month vs. previous month) as primary KPI on landing page
- [ ] **DASH-02**: User sees daily revenue summary for the current day
- [ ] **DASH-03**: User sees month-to-date revenue totals
- [ ] **DASH-04**: User sees category-based income breakdown (by product type)
- [ ] **DASH-05**: User sees estimated gross profit with indicator showing exact vs. estimated basis
- [ ] **DASH-06**: User sees kids entry count trends over time
- [ ] **DASH-07**: User can view dashboard filtered by business area (Retail, Playroom/Café, Parties)
- [ ] **DASH-08**: User sees party revenue summary (base packages vs. add-ons)

### Parties

- [ ] **PARTY-01**: User can record a party with base package type and price
- [ ] **PARTY-02**: User can itemize add-ons per party (food, decorations, extras) with individual prices

### Stock & Inventory

- [ ] **STOCK-01**: User can manage a simple product list (name, category, cost price)
- [ ] **STOCK-02**: User can view and update current stock levels
- [ ] **STOCK-03**: User sees low-stock warnings when quantities fall below a set threshold

### Suppliers

- [ ] **SUPP-01**: User can manage a supplier list (name, contact info, notes)

### Foundation

- [ ] **FOUND-01**: Normalized data model supporting two business areas with shared cost concepts
- [ ] **FOUND-02**: Categories are append-only (historical data integrity preserved)
- [ ] **FOUND-03**: All entry records include a `data_source` field (manual for v1, enables Viber import in v2)

## v2 Requirements

### Viber Integration

- **VIBER-01**: User can paste end-of-day Viber order list and have it parsed into structured entries
- **VIBER-02**: Parsed Viber entries are tagged with `data_source: viber`

### Advanced Analytics

- **ADV-01**: User can view year-over-year revenue comparisons
- **ADV-02**: User can export reports as PDF or CSV
- **ADV-03**: User can view profit margin trends over time

### Party Management

- **PARTY-03**: User can view party revenue breakdown as a standalone report (packages vs. add-ons over time)
- **PARTY-04**: User can define and manage party package types and standard pricing
- **PARTY-05**: User can view a party calendar
- **PARTY-06**: User can see per-party profitability report

### Stock & Suppliers Advanced

- **STOCK-04**: User can manually adjust stock with reason tracking
- **SUPP-02**: User can map which products each supplier provides
- **STOCK-05**: System suggests reorder quantities based on sales velocity
- **STOCK-06**: User can view stock valuation report

### Food Cost

- **FOOD-01**: User can manage ingredient/material catalog
- **FOOD-02**: User can define recipes with ingredient quantities per menu item
- **FOOD-03**: System calculates food cost percentage from recipes

### Security

- **AUTH-01**: Passphrase or PIN-based authentication for the dashboard

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user auth / role-based access | Solo operator — no benefit for v1 |
| POS system integration | No existing POS; manual entry is the current reality |
| Real-time sync / WebSockets | Single user, manual entry — no concurrent data |
| Mobile native app | Web app works on mobile browsers |
| Accounting / tax reports | Separate concern — operations, not bookkeeping |
| Customer database / CRM | Not an operations dashboard feature |
| Employee scheduling | Different tool category |
| AI-powered insights | Premature — need data history first |
| Recipe costing | Complex; category margin % is sufficient for v1 |
| Automatic stock deduction on sale | Requires POS integration (out of scope) |
| Supplier-product mapping | Lightweight notes field on supplier is enough for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| *(populated by roadmap)* | | |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 0
- Unmapped: 20 ⚠️

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after tightening v1 scope*
