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

schoolRoutes.get('/:schoolId', authenticate, async (c) => {
  const school = await prisma.school.findUnique({ where: { id: c.req.param('schoolId') } })
  if (!school) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data: school })
})

schoolRoutes.patch('/:schoolId', authorize('admin'), async (c) => {
  const { name, soumCode, district } = await c.req.json<{ name?: string; soumCode?: string; district?: string }>()
  const school = await prisma.school.update({
    where: { id: c.req.param('schoolId') },
    data: { name, soumCode, district },
  })
  return c.json({ success: true, data: school })
})
