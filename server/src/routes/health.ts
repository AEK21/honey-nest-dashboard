import { Hono } from 'hono'
import { db } from '../db'
import { categories } from '../db/schema'
import { count } from 'drizzle-orm'

const health = new Hono()

health.get('/', async (c) => {
  const [result] = await db.select({ count: count() }).from(categories)
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    categories: result.count,
  })
})

export default health
