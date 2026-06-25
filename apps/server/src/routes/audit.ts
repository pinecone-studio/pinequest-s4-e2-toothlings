import { Hono } from 'hono'
import { prisma } from '@pinequest/db'
import { authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const auditRoutes = new Hono<AppEnv>()

auditRoutes.get('/', authorize('admin', 'dentist'), async (c) => {
  const { entityType, entityId, userId, limit } = c.req.query()
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      userId: userId || undefined,
    },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Number(limit) || 50, 200),
    include: { user: { select: { id: true, name: true, role: true } } },
  })
  return c.json({ success: true, data: logs })
})
