import path from 'path'
import { fileURLToPath } from 'url'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { sql } from 'drizzle-orm'
import { db } from './index'
import { categories } from './schema'
import { SEED_CATEGORIES } from './seed-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function setup() {
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') })

  for (const cat of SEED_CATEGORIES) {
    await db.insert(categories).values(cat).onConflictDoNothing({ target: categories.name })
  }

  // Deactivate retired categories
  await db.run(sql`UPDATE categories SET active = 0 WHERE name IN ('gifts', 'lifestyle')`)
}

setup().catch(console.error)
