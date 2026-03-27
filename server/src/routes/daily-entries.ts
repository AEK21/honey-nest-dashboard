import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db'
import { categories, dailyEntries, kidsEntries } from '../db/schema'

const dailyEntriesRoute = new Hono()

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

// GET / — returns all categories with their entries for a given date
dailyEntriesRoute.get('/', async (c) => {
  const date = c.req.query('date')
  if (!date || !dateRegex.test(date)) {
    return c.json({ error: 'date query param required (YYYY-MM-DD)' }, 400)
  }

  // Get all active categories
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.sortOrder)

  // Get entries for this date
  const entries = await db
    .select()
    .from(dailyEntries)
    .where(eq(dailyEntries.entryDate, date))

  // Get kids count for this date
  const kidsRow = await db
    .select()
    .from(kidsEntries)
    .where(eq(kidsEntries.entryDate, date))

  // Build entry lookup by categoryId
  const entryMap = new Map(entries.map((e) => [e.categoryId, e]))

  // Merge categories with their entries
  const merged = allCategories.map((cat) => {
    const entry = entryMap.get(cat.id)
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      displayName: cat.displayName,
      businessArea: cat.businessArea,
      revenue: entry?.revenue ?? null,
      costAmount: entry?.costAmount ?? null,
      costBasis: entry?.costBasis ?? 'estimated',
      costMarginPct: cat.costMarginPct,
    }
  })

  // Find latest updatedAt across all entries for this date
  const allTimestamps = [
    ...entries.map((e) => e.updatedAt),
    ...kidsRow.map((k) => k.updatedAt),
  ].filter(Boolean)
  const lastSaved = allTimestamps.length
    ? allTimestamps.sort().reverse()[0]
    : null

  return c.json({
    date,
    entries: merged,
    kidsCount: kidsRow[0]?.count ?? null,
    lastSaved,
  })
})

// PUT / — upsert revenue entries + kids count for a date
const saveSchema = z.object({
  date: z.string().regex(dateRegex),
  entries: z.array(
    z.object({
      categoryId: z.number().int().positive(),
      revenue: z.number().min(0),
      costAmount: z.number().min(0).nullable().optional(),
      costBasis: z.enum(['exact', 'estimated']).optional().default('estimated'),
    })
  ),
  kidsCount: z.number().int().min(0).nullable().optional(),
})

dailyEntriesRoute.put('/', async (c) => {
  const body = await c.req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400)
  }

  const { date, entries, kidsCount } = parsed.data
  const now = new Date().toISOString()

  // Upsert each entry that has revenue (raw SQL for drizzle 0.38 insert type compat)
  for (const entry of entries) {
    await db.run(sql`
      INSERT INTO daily_entries (entry_date, category_id, revenue, cost_amount, cost_basis, updated_at)
      VALUES (${date}, ${entry.categoryId}, ${entry.revenue}, ${entry.costAmount ?? null}, ${entry.costBasis}, ${now})
      ON CONFLICT (entry_date, category_id) DO UPDATE SET
        revenue = ${entry.revenue},
        cost_amount = ${entry.costAmount ?? null},
        cost_basis = ${entry.costBasis},
        updated_at = ${now}
    `)
  }

  // Upsert kids count if provided
  if (kidsCount != null) {
    await db.run(sql`
      INSERT INTO kids_entries (entry_date, count, updated_at)
      VALUES (${date}, ${kidsCount}, ${now})
      ON CONFLICT (entry_date) DO UPDATE SET
        count = ${kidsCount},
        updated_at = ${now}
    `)
  }

  return c.json({ success: true, date, savedAt: now })
})

export default dailyEntriesRoute
