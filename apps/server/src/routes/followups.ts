import { Hono } from 'hono'
import { followUpUpdateSchema } from '@pinequest/core'
import { prisma } from '@pinequest/db'
import { authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const followUpRoutes = new Hono<AppEnv>()

followUpRoutes.get('/', authorize('follow_up', 'dentist', 'admin'), async (c) => {
  const { status, schoolId } = c.req.query()
  const scope = schoolScope(c.get('jwtPayload'))
  const followUps = await prisma.followUp.findMany({
    where: { status: status || undefined, schoolId: scope ?? (schoolId || undefined) },
    orderBy: { updatedAt: 'desc' },
  })
  const children = await prisma.child.findMany({
    where: { childKey: { in: followUps.map((f) => f.childKey) } },
  })
  const byKey = new Map(children.map((ch) => [ch.childKey, ch]))
  const data = followUps.map((f) => {
    const ch = byKey.get(f.childKey)
    return { ...f, childName: ch ? `${ch.lastName} ${ch.firstName}` : null, guardianPhone: ch?.guardianPhone ?? null }
  })
  return c.json({ success: true, data })
})

followUpRoutes.patch('/:childKey', authorize('follow_up', 'admin'), async (c) => {
  const update = followUpUpdateSchema.parse(await c.req.json())
  const ck = c.req.param('childKey')
  const existing = await prisma.followUp.findUnique({ where: { childKey: ck } })

  if (existing && existing.version !== update.version) {
    return c.json({ success: false, data: existing, message: 'version_conflict' }, 409)
  }

  const fields = {
    status: update.status,
    assignedToId: update.assignedToId ?? null,
    appointmentAt: update.appointmentAt ? new Date(update.appointmentAt) : null,
    notifiedAt: update.notifiedAt ? new Date(update.notifiedAt) : null,
    notificationChannel: update.notificationChannel ?? null,
    notes: update.notes ?? null,
    updatedById: c.get('jwtPayload').sub,
  }

  let saved
  if (existing) {
    saved = await prisma.followUp.update({ where: { childKey: ck }, data: { ...fields, version: existing.version + 1 } })
  } else {
    const child = await prisma.child.findFirst({ where: { childKey: ck } })
    if (!child) return c.json({ success: false, data: null, message: 'unknown_child' }, 404)
    saved = await prisma.followUp.create({ data: { childKey: ck, schoolId: child.schoolId, ...fields, version: 1 } })
  }

  await writeAudit(c.get('jwtPayload').sub, 'FollowUp', saved.id, existing ? 'update' : 'create', existing, saved)
  return c.json({ success: true, data: saved })
})

followUpRoutes.post('/:childKey/notify', authorize('follow_up', 'admin'), async (c) => {
  const { channel, note } = await c.req.json<{ channel: string; note?: string }>()
  const ck = c.req.param('childKey')
  const existing = await prisma.followUp.findUnique({ where: { childKey: ck } })
  if (!existing) return c.json({ success: false, data: null, message: 'unknown_child' }, 404)

  const updated = await prisma.followUp.update({
    where: { childKey: ck },
    data: {
      notifiedAt: new Date(),
      notificationChannel: channel,
      notes: note ?? existing.notes,
      status: existing.status === 'flagged' ? 'contacted' : existing.status,
      updatedById: c.get('jwtPayload').sub,
      version: existing.version + 1,
    },
  })
  await writeAudit(c.get('jwtPayload').sub, 'FollowUp', updated.id, 'notify', existing, updated)
  return c.json({ success: true, data: updated })
})
