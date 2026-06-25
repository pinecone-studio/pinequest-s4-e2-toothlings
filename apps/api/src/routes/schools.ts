import { Hono } from 'hono'
import { prisma } from '@pinequest/db'
import { authenticate, authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const schoolRoutes = new Hono<AppEnv>()

schoolRoutes.get('/', authenticate, async (c) => {
  const schools = await prisma.school.findMany({ orderBy: { name: 'asc' } })
  return c.json({ success: true, data: schools })
})

schoolRoutes.post('/', authorize('admin'), async (c) => {
  const { name, soumCode, district } = await c.req.json<{ name: string; soumCode?: string; district?: string }>()
  const school = await prisma.school.create({
    data: { name, soumCode: soumCode ?? null, district: district ?? null },
  })
  return c.json({ success: true, data: school }, 201)
})
