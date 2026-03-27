import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from '../db'

const dashboardRoute = new Hono()

const monthRegex = /^\d{4}-\d{2}$/
const validAreas = ['all', 'retail', 'playroom_cafe', 'parties'] as const

function parseArea(raw: string | undefined) {
  if (!raw || !validAreas.includes(raw as (typeof validAreas)[number])) return 'all'
  return raw as (typeof validAreas)[number]
}

function areaFilter(area: string) {
  if (area === 'all') return sql``
  return sql`AND c.business_area = ${area}`
}

async function partyRevenueForRange(start: string, end: string): Promise<number> {
  const rows = await db.all<{ revenue: number }>(sql`
    SELECT COALESCE(SUM(p.package_price), 0) + COALESCE(SUM(at.addon_total), 0) as revenue
    FROM parties p
    LEFT JOIN (
      SELECT party_id, SUM(addon_price) as addon_total FROM party_addons GROUP BY party_id
    ) at ON at.party_id = p.id
    WHERE p.party_date >= ${start} AND p.party_date <= ${end} AND p.status = 'completed'
  `)
  return rows[0]?.revenue ?? 0
}

async function partyRevenueByDay(start: string, end: string) {
  return db.all<{ date: string; revenue: number }>(sql`
    SELECT p.party_date as date,
      COALESCE(SUM(p.package_price), 0) + COALESCE(SUM(at.addon_total), 0) as revenue
    FROM parties p
    LEFT JOIN (
      SELECT party_id, SUM(addon_price) as addon_total FROM party_addons GROUP BY party_id
    ) at ON at.party_id = p.id
    WHERE p.party_date >= ${start} AND p.party_date <= ${end} AND p.status = 'completed'
    GROUP BY p.party_date
    ORDER BY p.party_date
  `)
}

// ── Summary ─────────────────────────────────────────────────────
// GET /summary?month=YYYY-MM&area=all
dashboardRoute.get('/summary', async (c) => {
  const month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    return c.json({ error: 'month query param required (YYYY-MM)' }, 400)
  }
  const area = parseArea(c.req.query('area'))

  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${month}-01`
  // Last day: go to next month, subtract 1 day
  const [y, m] = month.split('-').map(Number)
  const nextMonth = new Date(y, m, 1) // month is 0-indexed, so m = next month
  nextMonth.setDate(nextMonth.getDate() - 1)
  const monthEnd = nextMonth.toISOString().slice(0, 10)

  // Previous month boundaries
  const prevDate = new Date(y, m - 2, 1)
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const prevStart = `${prevMonthStr}-01`
  const prevEndDate = new Date(y, m - 1, 0)
  const prevEnd = prevEndDate.toISOString().slice(0, 10)

  const af = areaFilter(area)

  // Today's revenue
  const todayResult = await db.all<{ total: number }>(sql`
    SELECT COALESCE(SUM(d.revenue), 0) as total
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date = ${today} AND c.active = 1 ${af}
  `)

  // MTD revenue
  const mtdResult = await db.all<{ total: number }>(sql`
    SELECT COALESCE(SUM(d.revenue), 0) as total
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${monthStart} AND d.entry_date <= ${monthEnd}
      AND c.active = 1 ${af}
  `)

  // MTD cost (effective: use cost_amount if set, else revenue * cost_margin_pct)
  const mtdCostResult = await db.all<{ total: number; allExact: number }>(sql`
    SELECT
      COALESCE(SUM(
        CASE
          WHEN d.cost_amount IS NOT NULL THEN d.cost_amount
          ELSE d.revenue * COALESCE(c.cost_margin_pct, 0)
        END
      ), 0) as total,
      MIN(CASE WHEN d.cost_amount IS NOT NULL THEN 1 ELSE 0 END) as allExact
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${monthStart} AND d.entry_date <= ${monthEnd}
      AND c.active = 1 ${af}
  `)

  // Previous month revenue (full month)
  const prevRevResult = await db.all<{ total: number }>(sql`
    SELECT COALESCE(SUM(d.revenue), 0) as total
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${prevStart} AND d.entry_date <= ${prevEnd}
      AND c.active = 1 ${af}
  `)

  // Previous month cost
  const prevCostResult = await db.all<{ total: number }>(sql`
    SELECT COALESCE(SUM(
      CASE
        WHEN d.cost_amount IS NOT NULL THEN d.cost_amount
        ELSE d.revenue * COALESCE(c.cost_margin_pct, 0)
      END
    ), 0) as total
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${prevStart} AND d.entry_date <= ${prevEnd}
      AND c.active = 1 ${af}
  `)

  let todayRevenue = todayResult[0]?.total ?? 0
  let mtdRevenue = mtdResult[0]?.total ?? 0
  const mtdCost = mtdCostResult[0]?.total ?? 0
  const profitBasis = mtdCostResult[0]?.allExact === 1 ? 'exact' : 'estimated'
  let prevMonthRevenue = prevRevResult[0]?.total ?? 0
  const prevMonthCost = prevCostResult[0]?.total ?? 0

  // Include party revenue when area is 'all' or 'parties'
  // (When area='parties', daily_entries queries return 0 naturally since no category has business_area='parties')
  if (area === 'all' || area === 'parties') {
    todayRevenue += await partyRevenueForRange(today, today)
    mtdRevenue += await partyRevenueForRange(monthStart, monthEnd)
    prevMonthRevenue += await partyRevenueForRange(prevStart, prevEnd)
  }

  // Parties have no cost tracking in MVP, so party revenue is pure profit
  const mtdProfit = mtdRevenue - mtdCost
  const prevMonthProfit = prevMonthRevenue - prevMonthCost

  const revenueDelta = prevMonthRevenue > 0
    ? ((mtdRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    : null
  const profitDelta = prevMonthProfit > 0
    ? ((mtdProfit - prevMonthProfit) / prevMonthProfit) * 100
    : null

  return c.json({
    todayRevenue,
    mtdRevenue,
    mtdProfit,
    profitBasis,
    prevMonthRevenue,
    prevMonthProfit,
    revenueDelta,
    profitDelta,
  })
})

// ── Trend ───────────────────────────────────────────────────────
// GET /trend?month=YYYY-MM&area=all
dashboardRoute.get('/trend', async (c) => {
  const month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    return c.json({ error: 'month query param required (YYYY-MM)' }, 400)
  }
  const area = parseArea(c.req.query('area'))
  const af = areaFilter(area)

  const [y, m] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEndDate = new Date(y, m, 0)
  const monthEnd = monthEndDate.toISOString().slice(0, 10)

  // Previous month
  const prevDate = new Date(y, m - 2, 1)
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const prevStart = `${prevMonthStr}-01`
  const prevEndDate = new Date(y, m - 1, 0)
  const prevEnd = prevEndDate.toISOString().slice(0, 10)

  const currentMonth = await db.all<{ date: string; revenue: number }>(sql`
    SELECT d.entry_date as date, COALESCE(SUM(d.revenue), 0) as revenue
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${monthStart} AND d.entry_date <= ${monthEnd}
      AND c.active = 1 ${af}
    GROUP BY d.entry_date
    ORDER BY d.entry_date
  `)

  const previousMonth = await db.all<{ date: string; revenue: number }>(sql`
    SELECT d.entry_date as date, COALESCE(SUM(d.revenue), 0) as revenue
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${prevStart} AND d.entry_date <= ${prevEnd}
      AND c.active = 1 ${af}
    GROUP BY d.entry_date
    ORDER BY d.entry_date
  `)

  // Merge party revenue into trend when applicable
  if (area === 'all' || area === 'parties') {
    const partyCurrentMonth = await partyRevenueByDay(monthStart, monthEnd)
    const partyPrevMonth = await partyRevenueByDay(prevStart, prevEnd)

    const mergeRevenue = (
      dailyRows: { date: string; revenue: number }[],
      partyRows: { date: string; revenue: number }[]
    ) => {
      const map = new Map<string, number>()
      for (const r of dailyRows) map.set(r.date, (map.get(r.date) ?? 0) + r.revenue)
      for (const r of partyRows) map.set(r.date, (map.get(r.date) ?? 0) + r.revenue)
      return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({ date, revenue }))
    }

    const mergedCurrent = mergeRevenue(currentMonth, partyCurrentMonth)
    const mergedPrev = mergeRevenue(previousMonth, partyPrevMonth)

    return c.json({
      currentMonth: mergedCurrent.map((r) => ({
        day: parseInt(r.date.split('-')[2], 10),
        date: r.date,
        revenue: r.revenue,
      })),
      previousMonth: mergedPrev.map((r) => ({
        day: parseInt(r.date.split('-')[2], 10),
        date: r.date,
        revenue: r.revenue,
      })),
    })
  }

  return c.json({
    currentMonth: currentMonth.map((r) => ({
      day: parseInt(r.date.split('-')[2], 10),
      date: r.date,
      revenue: r.revenue,
    })),
    previousMonth: previousMonth.map((r) => ({
      day: parseInt(r.date.split('-')[2], 10),
      date: r.date,
      revenue: r.revenue,
    })),
  })
})

// ── Categories ──────────────────────────────────────────────────
// GET /categories?month=YYYY-MM&area=all
dashboardRoute.get('/categories', async (c) => {
  const month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    return c.json({ error: 'month query param required (YYYY-MM)' }, 400)
  }
  const area = parseArea(c.req.query('area'))
  const af = areaFilter(area)

  const monthStart = `${month}-01`
  const [y, m] = month.split('-').map(Number)
  const monthEndDate = new Date(y, m, 0)
  const monthEnd = monthEndDate.toISOString().slice(0, 10)

  const rows = await db.all<{
    categoryId: number
    categoryName: string
    displayName: string
    businessArea: string
    revenue: number
    cost: number
    allExact: number
  }>(sql`
    SELECT
      c.id as categoryId,
      c.name as categoryName,
      c.display_name as displayName,
      c.business_area as businessArea,
      COALESCE(SUM(d.revenue), 0) as revenue,
      COALESCE(SUM(
        CASE
          WHEN d.cost_amount IS NOT NULL THEN d.cost_amount
          ELSE d.revenue * COALESCE(c.cost_margin_pct, 0)
        END
      ), 0) as cost,
      MIN(CASE WHEN d.cost_amount IS NOT NULL THEN 1 ELSE 0 END) as allExact
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${monthStart} AND d.entry_date <= ${monthEnd}
      AND c.active = 1 ${af}
    GROUP BY c.id
    ORDER BY c.sort_order
  `)

  return c.json({
    categories: rows.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      displayName: r.displayName,
      businessArea: r.businessArea,
      revenue: r.revenue,
      cost: r.cost,
      profit: r.revenue - r.cost,
      costBasis: r.allExact === 1 ? 'exact' as const : 'estimated' as const,
    })),
  })
})

// ── Kids ────────────────────────────────────────────────────────
// GET /kids?days=30
dashboardRoute.get('/kids', async (c) => {
  const daysParam = c.req.query('days')
  const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 365) : 30

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const start = startDate.toISOString().slice(0, 10)

  const rows = await db.all<{ date: string; count: number }>(sql`
    SELECT entry_date as date, count
    FROM kids_entries
    WHERE entry_date >= ${start}
    ORDER BY entry_date
  `)

  return c.json({ entries: rows })
})

// ── Parties ─────────────────────────────────────────────────────
// GET /parties?month=YYYY-MM
dashboardRoute.get('/parties', async (c) => {
  const month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    return c.json({ error: 'month query param required (YYYY-MM)' }, 400)
  }

  const monthStart = `${month}-01`
  const [y, m] = month.split('-').map(Number)
  const monthEndDate = new Date(y, m, 0)
  const monthEnd = monthEndDate.toISOString().slice(0, 10)

  // Only completed parties count as revenue
  const partyStats = await db.all<{
    partyCount: number
    packageRevenue: number
  }>(sql`
    SELECT
      COUNT(*) as partyCount,
      COALESCE(SUM(package_price), 0) as packageRevenue
    FROM parties
    WHERE party_date >= ${monthStart} AND party_date <= ${monthEnd}
      AND status = 'completed'
  `)

  // Add-on revenue for completed parties
  const addonStats = await db.all<{ addonRevenue: number }>(sql`
    SELECT COALESCE(SUM(pa.addon_price), 0) as addonRevenue
    FROM party_addons pa
    JOIN parties p ON p.id = pa.party_id
    WHERE p.party_date >= ${monthStart} AND p.party_date <= ${monthEnd}
      AND p.status = 'completed'
  `)

  const partyCount = partyStats[0]?.partyCount ?? 0
  const packageRevenue = partyStats[0]?.packageRevenue ?? 0
  const addonRevenue = addonStats[0]?.addonRevenue ?? 0
  const totalRevenue = packageRevenue + addonRevenue

  return c.json({
    partyCount,
    packageRevenue,
    addonRevenue,
    totalRevenue,
    avgPerParty: partyCount > 0 ? totalRevenue / partyCount : 0,
  })
})

export default dashboardRoute
