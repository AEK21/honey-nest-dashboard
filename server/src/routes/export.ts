import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { db } from '../db'

const exportRoute = new Hono()

const monthRegex = /^\d{4}-\d{2}$/

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function csvRow(values: (string | number | null | undefined)[]): string {
  return values.map(csvEscape).join(',')
}

function getMonthRange(month: string) {
  const start = `${month}-01`
  const [y, m] = month.split('-').map(Number)
  const endDate = new Date(y, m, 0)
  const end = endDate.toISOString().slice(0, 10)
  return { start, end }
}

// GET /entries?month=YYYY-MM
exportRoute.get('/entries', async (c) => {
  let month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    const now = new Date()
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const { start, end } = getMonthRange(month)

  const rows = await db.all<{
    entryDate: string
    categoryName: string
    businessArea: string
    revenue: number
    costAmount: number | null
    costBasis: string
  }>(sql`
    SELECT
      d.entry_date as entryDate,
      c.display_name as categoryName,
      c.business_area as businessArea,
      d.revenue,
      d.cost_amount as costAmount,
      d.cost_basis as costBasis
    FROM daily_entries d
    JOIN categories c ON c.id = d.category_id
    WHERE d.entry_date >= ${start} AND d.entry_date <= ${end}
      AND c.active = 1
    ORDER BY d.entry_date, c.sort_order
  `)

  const header = 'Date,Category,Business Area,Revenue,Cost,Cost Basis'
  const lines = rows.map((r) =>
    csvRow([r.entryDate, r.categoryName, r.businessArea, r.revenue, r.costAmount, r.costBasis])
  )
  const csv = [header, ...lines].join('\n')

  c.header('Content-Type', 'text/csv')
  c.header('Content-Disposition', `attachment; filename="entries-${month}.csv"`)
  return c.body(csv)
})

// GET /parties?month=YYYY-MM
exportRoute.get('/parties', async (c) => {
  let month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    const now = new Date()
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const { start, end } = getMonthRange(month)

  const rows = await db.all<{
    partyDate: string
    partyTime: string | null
    customerName: string
    childName: string | null
    packageName: string
    packagePrice: number
    addonTotal: number
    depositAmount: number | null
    status: string
  }>(sql`
    SELECT
      p.party_date as partyDate,
      p.party_time as partyTime,
      p.customer_name as customerName,
      p.child_name as childName,
      p.package_name as packageName,
      p.package_price as packagePrice,
      COALESCE((SELECT SUM(pa.addon_price) FROM party_addons pa WHERE pa.party_id = p.id), 0) as addonTotal,
      p.deposit_amount as depositAmount,
      p.status
    FROM parties p
    WHERE p.party_date >= ${start} AND p.party_date <= ${end}
    ORDER BY p.party_date, p.party_time
  `)

  const header = 'Date,Time,Customer,Child,Package,Package Price,Add-ons Total,Total Revenue,Deposit,Status'
  const lines = rows.map((r) =>
    csvRow([
      r.partyDate,
      r.partyTime,
      r.customerName,
      r.childName,
      r.packageName,
      r.packagePrice,
      r.addonTotal,
      r.packagePrice + r.addonTotal,
      r.depositAmount,
      r.status,
    ])
  )
  const csv = [header, ...lines].join('\n')

  c.header('Content-Type', 'text/csv')
  c.header('Content-Disposition', `attachment; filename="parties-${month}.csv"`)
  return c.body(csv)
})

export default exportRoute
