# Features Research

**Domain:** Internal business operations dashboard — retail + playroom/café/parties
**Researched:** 2026-03-27
**Confidence:** HIGH

---

## Feature Landscape

### Category: Daily Data Entry

| Feature | Tier | Complexity | Dependencies |
|---------|------|------------|--------------|
| Daily sales entry form (revenue by category) | Table stakes | Medium | Data model |
| Quick-entry mode (minimal clicks for daily totals) | Table stakes | Medium | Forms framework |
| Kids entry count tracking | Table stakes | Low | Data model |
| Party booking entry (base package + add-ons) | Table stakes | Medium | Party data model |
| Cost input (per-item or category %) | Table stakes | Medium | Cost model |
| Edit/correct past entries | Table stakes | Low | Data model |
| Bulk entry (multiple days backfill) | Differentiator | Medium | Daily entry |
| End-of-day Viber message parsing | Differentiator | High | NLP/parsing logic |

**Research notes:** Solo operator means every extra field or click compounds friction. The daily entry form is the most-used screen — it must be completable in under 90 seconds.

---

### Category: Dashboard & KPIs

| Feature | Tier | Complexity | Dependencies |
|---------|------|------------|--------------|
| Monthly revenue trend (current vs. previous month) | Table stakes | Medium | Aggregation queries |
| Daily revenue summary | Table stakes | Low | Daily entries |
| Category-based income breakdown | Table stakes | Medium | Category model |
| Estimated gross profit display | Table stakes | Medium | Cost data |
| Party revenue summary (packages vs. add-ons) | Table stakes | Medium | Party model |
| Retail product performance | Table stakes | Medium | Product/category data |
| Kids entry trends | Table stakes | Low | Entry count data |
| Year-over-year comparison | Differentiator | Medium | 12+ months of data |
| Profit margin indicator (exact vs. estimated) | Table stakes | Low | Cost model |
| Exportable reports (PDF/CSV) | Differentiator | Medium | Chart/data layer |

**Research notes:** Monthly trend is the primary KPI — it's what the owner wants to see first every morning. All profit figures must indicate whether they use exact per-item cost or estimated category margin.

---

### Category: Stock & Inventory

| Feature | Tier | Complexity | Dependencies |
|---------|------|------------|--------------|
| Product catalog (name, category, cost price) | Table stakes | Low | Data model |
| Current stock levels | Table stakes | Low | Product catalog |
| Low-stock alerts | Table stakes | Low | Stock thresholds |
| Stock adjustment (manual add/subtract) | Table stakes | Low | Stock levels |
| Automatic stock deduction on sale | Differentiator | High | POS integration |
| Stock valuation report | Differentiator | Medium | Cost + stock data |
| Reorder suggestions | Differentiator | Medium | Sales velocity data |

**Research notes:** For v1 MVP, stock should be manual tracking with threshold-based alerts. Automatic deduction requires POS integration (out of scope).

---

### Category: Suppliers

| Feature | Tier | Complexity | Dependencies |
|---------|------|------------|--------------|
| Supplier directory (name, contact, products) | Table stakes | Low | Data model |
| Supplier-product mapping | Table stakes | Low | Product catalog |
| Purchase order tracking | Differentiator | High | Supplier + stock |
| Supplier price comparison | Differentiator | Medium | Multiple supplier prices |
| Payment tracking | Differentiator | High | Accounting scope |

**Research notes:** v1 needs a simple directory only — who supplies what, with contact info. Purchase orders and payment tracking are accounting features, not operations dashboard features.

---

### Category: Parties & Events

| Feature | Tier | Complexity | Dependencies |
|---------|------|------------|--------------|
| Party entry with base package selection | Table stakes | Medium | Package model |
| Add-on itemization per party | Table stakes | Medium | Add-on model |
| Party revenue vs. cost breakdown | Table stakes | Medium | Cost tracking |
| Party calendar view | Differentiator | Medium | Date-based queries |
| Party package management (CRUD) | Table stakes | Low | Settings/config |
| Party profitability report | Differentiator | Medium | Full cost data |

**Research notes:** The base + add-ons model is critical to get right in the data model. Each party must store its package type and individual add-on line items, not a flat total.

---

### Category: Raw Materials & Food Cost

| Feature | Tier | Complexity | Dependencies |
|---------|------|------------|--------------|
| Ingredient/material catalog | Differentiator | Medium | Data model |
| Recipe costing (ingredients per menu item) | Differentiator | High | Ingredient catalog |
| Food cost percentage tracking | Table stakes | Low | Category margin % |
| Waste tracking | Differentiator | Medium | Inventory system |

**Research notes:** Full recipe costing is complex and typically a v2 feature. For v1, category-based food cost percentages are sufficient. The dual approach (per-item where known, category % as fallback) covers this well.

---

## Anti-Features

| Feature | Why NOT to build |
|---------|-----------------|
| Multi-user auth / roles | Solo operator — adds login friction with zero benefit for v1 |
| Real-time sync / WebSockets | Manual entry with one user — no concurrent data to sync |
| POS integration | No existing POS system; manual entry is the reality |
| Mobile native app | Web app works on mobile browsers; native adds build complexity |
| Accounting / tax reports | Separate concern — this is operations, not bookkeeping |
| Customer database / CRM | Not an operations dashboard feature |
| Employee scheduling | Different tool category entirely |
| AI-powered insights | Premature — need data history first before analytics make sense |

---

## Summary

**Table stakes for v1:** Daily entry forms, dashboard KPIs (monthly trends, category breakdown, profit), party package + add-ons tracking, basic stock alerts, supplier directory.

**Key differentiators for v2+:** Viber parsing, recipe costing, year-over-year comparisons, exportable reports, reorder suggestions.

**Critical dependency:** The data model must be designed before any feature is built. Party add-ons, category immutability, and cost basis tracking all require upfront schema decisions.
