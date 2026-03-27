import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './index'

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  console.log('Migrations complete.')
}

main()
