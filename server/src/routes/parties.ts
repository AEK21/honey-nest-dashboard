import { Hono } from 'hono'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db'
import { parties, partyAddons } from '../db/schema'

const partiesRoute = new Hono()

const monthRegex = /^\d{4}-\d{2}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
const timeRegex = /^\d{2}:\d{2}$/
const validStatuses = ['inquiry', 'booked', 'completed', 'cancelled'] as const

const addonSchema = z.object({
  addonName: z.string().min(1),
  addonPrice: z.number().min(0),
  quantity: z.number().int().min(1).optional().default(1),
  category: z.string().nullable().optional(),
})

const partySchema = z.object({
  partyDate: z.string().regex(dateRegex),
  partyTime: z.string().regex(timeRegex).nullable().optional(),
  customerName: z.string().min(1),
  contactPhone: z.string().nullable().optional(),
  childName: z.string().nullable().optional(),
  childAge: z.number().int().min(0).nullable().optional(),
  kidsCount: z.number().int().min(0).nullable().optional(),
  adultsCount: z.number().int().min(0).nullable().optional(),
  packageName: z.string().min(1),
  packagePrice: z.number().min(0),
  depositAmount: z.number().min(0).nullable().optional(),
  status: z.enum(validStatuses).optional().default('booked'),
  eventType: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  addons: z.array(addonSchema).optional().default([]),
})

// ── GET / — list parties for a month ────────────────────────────
partiesRoute.get('/', async (c) => {
  const month = c.req.query('month')
  if (!month || !monthRegex.test(month)) {
    return c.json({ error: 'month query param required (YYYY-MM)' }, 400)
  }

  const [y, m] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEndDate = new Date(y, m, 0)
  const monthEnd = monthEndDate.toISOString().slice(0, 10)

  const allParties = await db
    .select()
    .from(parties)
    .where(
      and(
        sql`${parties.partyDate} >= ${monthStart}`,
        sql`${parties.partyDate} <= ${monthEnd}`
      )
    )
    .orderBy(parties.partyDate)

  const allAddons = allParties.length > 0
    ? await db.select().from(partyAddons)
        .where(sql`${partyAddons.partyId} IN (${sql.join(allParties.map(p => sql`${p.id}`), sql`,`)})`)
    : []

  const addonsByParty = new Map<number, typeof allAddons>()
  for (const addon of allAddons) {
    const list = addonsByParty.get(addon.partyId) ?? []
    list.push(addon)
    addonsByParty.set(addon.partyId, list)
  }

  const result = allParties.map((p) => {
    const addons = addonsByParty.get(p.id) ?? []
    const addonsTotal = addons.reduce((s, a) => s + a.addonPrice * (a.quantity ?? 1), 0)
    return {
      ...p,
      addons,
      addonsTotal,
      totalRevenue: p.packagePrice + addonsTotal,
    }
  })

  return c.json({ parties: result })
})

// ── GET /:id — single party with addons ─────────────────────────
partiesRoute.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return c.json({ error: 'invalid id' }, 400)

  const party = await db.select().from(parties).where(eq(parties.id, id))
  if (!party.length) return c.json({ error: 'not found' }, 404)

  const addons = await db.select().from(partyAddons).where(eq(partyAddons.partyId, id))
  const addonsTotal = addons.reduce((s, a) => s + a.addonPrice * (a.quantity ?? 1), 0)

  return c.json({
    ...party[0],
    addons,
    addonsTotal,
    totalRevenue: party[0].packagePrice + addonsTotal,
  })
})

// ── POST / — create party + addons ──────────────────────────────
partiesRoute.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = partySchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const { addons, ...partyData } = parsed.data
  const now = new Date().toISOString()

  const result = await db.run(sql`
    INSERT INTO parties (
      party_date, party_time, customer_name, contact_phone, child_name, child_age,
      kids_count, adults_count, package_name, package_price,
      deposit_amount, status, event_type, notes, updated_at
    ) VALUES (
      ${partyData.partyDate}, ${partyData.partyTime ?? null},
      ${partyData.customerName}, ${partyData.contactPhone ?? null},
      ${partyData.childName ?? null},
      ${partyData.childAge ?? null}, ${partyData.kidsCount ?? null},
      ${partyData.adultsCount ?? null}, ${partyData.packageName},
      ${partyData.packagePrice}, ${partyData.depositAmount ?? null},
      ${partyData.status}, ${partyData.eventType ?? null},
      ${partyData.notes ?? null}, ${now}
    )
  `)

  const partyId = Number(result.lastInsertRowid)

  for (const addon of addons) {
    await db.run(sql`
      INSERT INTO party_addons (party_id, addon_name, addon_price, quantity, category)
      VALUES (${partyId}, ${addon.addonName}, ${addon.addonPrice}, ${addon.quantity ?? 1}, ${addon.category ?? null})
    `)
  }

  return c.json({ success: true, id: partyId }, 201)
})

// ── PUT /:id — update party, replace addons ─────────────────────
partiesRoute.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return c.json({ error: 'invalid id' }, 400)

  const existing = await db.select().from(parties).where(eq(parties.id, id))
  if (!existing.length) return c.json({ error: 'not found' }, 404)

  const body = await c.req.json()
  const parsed = partySchema.safeParse(body)
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const { addons, ...partyData } = parsed.data
  const now = new Date().toISOString()

  await db.run(sql`
    UPDATE parties SET
      party_date = ${partyData.partyDate},
      party_time = ${partyData.partyTime ?? null},
      customer_name = ${partyData.customerName},
      contact_phone = ${partyData.contactPhone ?? null},
      child_name = ${partyData.childName ?? null},
      child_age = ${partyData.childAge ?? null},
      kids_count = ${partyData.kidsCount ?? null},
      adults_count = ${partyData.adultsCount ?? null},
      package_name = ${partyData.packageName},
      package_price = ${partyData.packagePrice},
      deposit_amount = ${partyData.depositAmount ?? null},
      status = ${partyData.status},
      event_type = ${partyData.eventType ?? null},
      notes = ${partyData.notes ?? null},
      updated_at = ${now}
    WHERE id = ${id}
  `)

  // Replace addons: delete old, insert new
  await db.delete(partyAddons).where(eq(partyAddons.partyId, id))
  for (const addon of addons) {
    await db.run(sql`
      INSERT INTO party_addons (party_id, addon_name, addon_price, quantity, category)
      VALUES (${id}, ${addon.addonName}, ${addon.addonPrice}, ${addon.quantity ?? 1}, ${addon.category ?? null})
    `)
  }

  return c.json({ success: true, id })
})

// ── DELETE /:id — delete party (cascade) ────────────────────────
partiesRoute.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  if (isNaN(id)) return c.json({ error: 'invalid id' }, 400)

  const existing = await db.select().from(parties).where(eq(parties.id, id))
  if (!existing.length) return c.json({ error: 'not found' }, 404)

  await db.delete(parties).where(eq(parties.id, id))
  return c.json({ success: true })
})

export default partiesRoute
