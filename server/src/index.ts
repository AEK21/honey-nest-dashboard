import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import health from './routes/health'
import categoriesRoute from './routes/categories'
import dailyEntriesRoute from './routes/daily-entries'
import dashboardRoute from './routes/dashboard'
import partiesRoute from './routes/parties'
import exportRoute from './routes/export'
import tameioRoute from './routes/tameio'

// Ensure DB is migrated and seeded on startup
import './db/migrate-and-seed'

const app = new Hono()

app.use('/api/*', cors())
app.route('/api/health', health)
app.route('/api/categories', categoriesRoute)
app.route('/api/daily-entries', dailyEntriesRoute)
app.route('/api/dashboard', dashboardRoute)
app.route('/api/parties', partiesRoute)
app.route('/api/export', exportRoute)
app.route('/api/tameio', tameioRoute)

// In production, serve the built client files
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './client-dist' }))
  // SPA fallback: serve index.html for any non-API, non-file route
  app.get('/*', serveStatic({ root: './client-dist', path: 'index.html' }))
}

const port = parseInt(process.env.PORT || '3001', 10)
console.log(`Server running on http://localhost:${port}`)
serve({ fetch: app.fetch, port })

export type AppType = typeof app
