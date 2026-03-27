import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from '../db'

const dashboardRoute = new Hono()

const monthRegex = /^\d{4}-\d{2}$/
const validAreas = ['all', 'retail', 'playroom_cafe'] as const

function parseArea(raw: string | undefined) {
  if (!raw || !validAreas.includes(raw as (typeof validAreas)[number])) return 'all'
  return raw as (typeof validAreas)[number]
}

function areaFilter(area: string) {
  if (area === 'all') return sql``
  return sql`AND c.business_area = ${area}`
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

  const todayRevenue = todayResult[0]?.total ?? 0
  const mtdRevenue = mtdResult[0]?.total ?? 0
  const mtdCost = mtdCostResult[0]?.total ?? 0
  const mtdProfit = mtdRevenue - mtdCost
  const profitBasis = mtdCostResult[0]?.allExact === 1 ? 'exact' : 'estimated'
  const prevMonthRevenue = prevRevResult[0]?.total ?? 0
  const prevMonthCost = prevCostResult[0]?.total ?? 0
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

export default dashboardRoute
