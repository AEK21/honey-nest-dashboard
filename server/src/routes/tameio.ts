import { Hono } from 'hono'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { tameioEntries } from '../db/schema'

const tameioRoute = new Hono()

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

// GET /?date=YYYY-MM-DD
// Returns today's tameio data. If not yet saved, prefills last_day_cash
// from the previous saved day: prev.synolo - prev.cash_se_king
tameioRoute.get('/', async (c) => {
  const date = c.req.query('date')
  if (!date || !dateRegex.test(date)) {
    return c.json({ error: 'date query param required (YYYY-MM-DD)' }, 400)
  }

  // Try to find today's saved entry
  const existing = await db
    .select()
    .from(tameioEntries)
    .where(eq(tameioEntries.entryDate, date))

  if (existing.length > 0) {
    const row = existing[0]
    const synolo = row.cash + row.aValue + row.lastDayCash - row.exoda
    return c.json({ ...row, synolo })
  }

  // No entry yet — compute last_day_cash from the most recent previous day
  const prevRows = await db.all<{
    cash: number; a_value: number; last_day_cash: number; exoda: number; cash_se_king: number
  }>(sql`
    SELECT cash, a_value, last_day_cash, exoda, cash_se_king
    FROM tameio_entries
    WHERE entry_date < ${date}
    ORDER BY entry_date DESC
    LIMIT 1
  `)

  let lastDayCash = 0
  if (prevRows.length > 0) {
    const prev = prevRows[0]
    const prevSynolo = prev.cash + prev.a_value + prev.last_day_cash - prev.exoda
    lastDayCash = Math.max(0, prevSynolo - prev.cash_se_king)
  }

  return c.json({
    entryDate: date,
    cash: 0,
    card: 0,
    aValue: 0,
    lastDayCash,
    exoda: 0,
    cashSeKing: 0,
    synolo: lastDayCash, // cash(0) + aValue(0) + lastDayCash - exoda(0)
    saved: false,
  })
})

// PUT / — upsert tameio entry for a date
const saveSchema = z.object({
  date: z.string().regex(dateRegex),
  cash: z.number().min(0).default(0),
  card: z.number().min(0).default(0),
  aValue: z.number().min(0).default(0),
  lastDayCash: z.number().min(0).default(0),
  exoda: z.number().min(0).default(0),
  cashSeKing: z.number().min(0).default(0),
})

tameioRoute.put('/', async (c) => {
  const body = await c.req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const { date, cash, card, aValue, lastDayCash, exoda, cashSeKing } = parsed.data
  const now = new Date().toISOString()

  try {
    const existing = await db.select().from(tameioEntries).where(eq(tameioEntries.entryDate, date))
    if (existing.length > 0) {
      await db.run(sql`
        UPDATE tameio_entries SET
          cash = ${cash}, card = ${card}, a_value = ${aValue},
          last_day_cash = ${lastDayCash}, exoda = ${exoda},
          cash_se_king = ${cashSeKing}, updated_at = ${now}
        WHERE entry_date = ${date}
      `)
    } else {
      await db.run(sql`
        INSERT INTO tameio_entries (entry_date, cash, card, a_value, last_day_cash, exoda, cash_se_king, updated_at)
        VALUES (${date}, ${cash}, ${card}, ${aValue}, ${lastDayCash}, ${exoda}, ${cashSeKing}, ${now})
      `)
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[tameio PUT]', msg)
    return c.json({ error: msg }, 500)
  }

  const synolo = cash + aValue + lastDayCash - exoda
  return c.json({ success: true, date, synolo, savedAt: now })
})

export default tameioRoute
