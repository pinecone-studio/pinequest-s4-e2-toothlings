import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppEnv } from './types.js'
import { withDb } from './middleware/db.js'
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
import { seasonRoutes } from './routes/seasons.js'
import { auditRoutes } from './routes/audit.js'
import { devRoutes } from './routes/dev.js'

const app = new Hono<AppEnv>()

app.use('*', cors({
  origin: (_origin, c) => c.env.CORS_ORIGIN ?? 'http://localhost:3000',
}))
app.use('*', withDb) // attach the per-request D1-backed Drizzle client

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
app.route('/api/seasons', seasonRoutes)
app.route('/api/audit', auditRoutes)
app.route('/api/dev', devRoutes)

app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, data: null, message: (err as Error).message ?? 'internal_error' }, 500)
})

export default app
