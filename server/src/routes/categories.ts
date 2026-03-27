import { Hono } from 'hono'
import { db } from '../db'
import { categories } from '../db/schema'
import { eq } from 'drizzle-orm'

const categoriesRoute = new Hono()

categoriesRoute.get('/', async (c) => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.sortOrder)

  return c.json(result)
})

export default categoriesRoute
