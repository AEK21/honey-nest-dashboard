import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { mkdirSync } from 'fs'

const DB_PATH = './data/honey-nest.db'
mkdirSync('data', { recursive: true })

const client = createClient({ url: `file:${DB_PATH}` })

export const db = drizzle(client, { schema })
