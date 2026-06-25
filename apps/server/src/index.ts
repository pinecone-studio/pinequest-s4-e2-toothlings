import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import type { AppEnv } from './types.js'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { schoolRoutes } from './routes/schools.js'
import { classRoutes } from './routes/classes.js'
import { childRoutes } from './routes/children.js'
import { analyzeRoutes } from './routes/analyze.js'
import { screeningRoutes } from './routes/screenings.js'
import { followUpRoutes } from './routes/followups.js'
import { userRoutes } from './routes/users.js'
import { statsRoutes } from './routes/stats.js'
import { auditRoutes } from './routes/audit.js'

const app = new Hono<AppEnv>()

app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true }))

app.route('/', healthRoutes)
app.route('/api/auth', authRoutes)
app.route('/api/schools', schoolRoutes)
app.route('/api', classRoutes)
app.route('/api', childRoutes)
app.route('/api/screenings', analyzeRoutes) // /analyze literal before /:id param
app.route('/api/screenings', screeningRoutes)
app.route('/api/followups', followUpRoutes)
app.route('/api/users', userRoutes)
app.route('/api/stats', statsRoutes)
app.route('/api/audit', auditRoutes)

app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, data: null, message: (err as Error).message ?? 'internal_error' }, 500)
})

const port = Number(process.env.PORT) || 4000
serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running at http://localhost:${port}`)
})
