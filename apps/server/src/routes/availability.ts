import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { dentistBlocks, volunteerDentists } from '@pinequest/db/d1'
import { authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const availabilityRoutes = new Hono<AppEnv>()

// A dentist manages their OWN blocked time slots (unavailable for bookings).
availabilityRoutes.get('/mine', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, c.get('jwtPayload').sub) })
  if (!vol) return c.json({ success: true, data: [] })
  const rows = await db.select({ at: dentistBlocks.blockedAt }).from(dentistBlocks).where(eq(dentistBlocks.dentistId, vol.id))
  return c.json({ success: true, data: rows.map((r) => r.at.getTime()) })
})

availabilityRoutes.post('/block', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const { blockedAt } = await c.req.json<{ blockedAt: number }>()
  const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, c.get('jwtPayload').sub) })
  if (!vol || !blockedAt) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  await db.insert(dentistBlocks).values({ dentistId: vol.id, blockedAt: new Date(blockedAt) }).onConflictDoNothing()
  return c.json({ success: true, data: null })
})

availabilityRoutes.post('/unblock', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const { blockedAt } = await c.req.json<{ blockedAt: number }>()
  const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, c.get('jwtPayload').sub) })
  if (!vol || !blockedAt) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  await db.delete(dentistBlocks).where(and(eq(dentistBlocks.dentistId, vol.id), eq(dentistBlocks.blockedAt, new Date(blockedAt))))
  return c.json({ success: true, data: null })
})
