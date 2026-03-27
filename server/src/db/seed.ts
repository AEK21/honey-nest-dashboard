import { db } from './index'
import { categories } from './schema'
import { SEED_CATEGORIES } from './seed-data'

async function main() {
  console.log('Seeding categories...')

  for (const cat of SEED_CATEGORIES) {
    await db.insert(categories)
      .values(cat)
      .onConflictDoNothing({ target: categories.name })
  }

  console.log(`Seeded ${SEED_CATEGORIES.length} categories.`)
  process.exit(0)
}

main()
