import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './index'
import { categories } from './schema'
import { SEED_CATEGORIES } from './seed-data'

async function setup() {
  await migrate(db, { migrationsFolder: './src/db/migrations' })

  for (const cat of SEED_CATEGORIES) {
    await db.insert(categories).values(cat).onConflictDoNothing({ target: categories.name })
  }
}

setup().catch(console.error)
