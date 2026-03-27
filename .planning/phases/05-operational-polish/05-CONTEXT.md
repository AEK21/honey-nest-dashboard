# Phase 5: Operational Polish

**Goal**: Make the existing 3-screen product (Entry, Parties, Dashboard) feel finished and production-ready. No new modules — just close gaps, add safety nets, and refine the experience.

## Why now

Phases 1-4 built the full operational core. Before adding any new module (stock, suppliers, inquiries), the existing screens should feel complete and trustworthy. First-launch experience has rough edges, there's no data export, and mobile installability is missing.

## Decisions

1. **No new database tables** — this phase is purely client + server polish
2. **CSV export** — simpler and more universal than Excel. One endpoint per data type.
3. **PWA** — manifest + service worker registration only. No offline mode (data requires server).
4. **Settings** — stored in a new `settings` key-value table (minimal schema change, but no new "module")
5. **Mobile meta tags** — theme-color, apple-touch-icon, viewport already set

## What's in scope

- Data export (CSV download for entries, parties)
- PWA manifest + installability (home screen icon)
- Mobile meta tags (theme-color, status bar)
- Empty state audit across all screens
- First-launch onboarding hint
- Page title updates per route
- Loading skeleton/shimmer states
- Error boundary with retry
- STATE.md + ROADMAP.md updates

## What's out of scope

- Settings page (defer — hardcoded values work fine for solo user)
- Offline support (requires service worker caching strategy)
- Authentication (not needed for v1)
- New business modules (stock, suppliers, inquiries)
