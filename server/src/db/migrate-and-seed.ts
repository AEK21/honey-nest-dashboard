import path from 'path'
import { fileURLToPath } from 'url'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './index'
import { categories } from './schema'
import { SEED_CATEGORIES } from './seed-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function setup() {
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') })

  for (const cat of SEED_CATEGORIES) {
    await db.insert(categories).values(cat).onConflictDoNothing({ target: categories.name })
  }
}

setup().catch(console.error)
