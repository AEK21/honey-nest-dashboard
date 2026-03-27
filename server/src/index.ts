import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import health from './routes/health'
import categoriesRoute from './routes/categories'
import dailyEntriesRoute from './routes/daily-entries'

// Ensure DB is migrated and seeded on startup
import './db/migrate-and-seed'

const app = new Hono()

app.use('/api/*', cors())
app.route('/api/health', health)
app.route('/api/categories', categoriesRoute)
app.route('/api/daily-entries', dailyEntriesRoute)

const port = 3001
console.log(`Server running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })

export type AppType = typeof app
