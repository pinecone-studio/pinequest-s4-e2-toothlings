import { Hono } from 'hono'
import type { AppEnv } from '../types.js'

export const healthRoutes = new Hono<AppEnv>()

healthRoutes.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }))
