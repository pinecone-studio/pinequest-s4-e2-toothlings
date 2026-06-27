import { Hono } from 'hono'
import { and, desc, eq, inArray, isNull } from 'drizzle-orm'
import { followUpUpdateSchema } from '@pinequest/core'
import { followUps, followUpEpisodes, followUpEvents, children } from '@pinequest/db/d1'
import { authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { schoolScope, hasChildAccess } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

// Status transition rules: backward moves are forbidden; closed episodes are immutable.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  flagged:           ['contacted', 'unclear'],
  contacted:         ['doctor_connected', 'unclear'],
  doctor_connected:  ['treatment_done', 'treatment_refused', 'unclear'],
  unclear:           ['contacted'],
}
const TERMINAL = new Set(['treatment_done', 'treatment_refused', 'unclear', 'superseded', 'season_cleared'])

export const followUpRoutes = new Hono<AppEnv>()

followUpRoutes.get('/', authorize('follow_up', 'dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const { status, schoolId } = c.req.query()
  const scope = schoolScope(c.get('jwtPayload'))
  const schoolFilter = scope ?? (schoolId || undefined)
  const conds = [
    status ? eq(followUps.status, status) : undefined,
    schoolFilter ? eq(followUps.schoolId, schoolFilter) : undefined,
  ].filter(Boolean)
  const list = await db.select().from(followUps)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(followUps.updatedAt))

  const kids = list.length
    ? await db.select().from(children).where(inArray(children.childKey, list.map((f) => f.childKey)))
    : []
  const byKey = new Map(kids.map((ch) => [ch.childKey, ch]))
  const data = list.map((f) => {
    const ch = byKey.get(f.childKey)
    return { ...f, childName: ch ? `${ch.lastName} ${ch.firstName}` : null, guardianPhone: ch?.guardianPhone ?? null }
  })
  return c.json({ success: true, data })
})

followUpRoutes.patch('/:childKey', authorize('follow_up', 'admin'), async (c) => {
  const db = c.get('db')
  const update = followUpUpdateSchema.parse(await c.req.json())
  const ck = c.req.param('childKey')
  const existing = await db.query.followUps.findFirst({ where: eq(followUps.childKey, ck) })

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
    [saved] = await db.update(followUps).set({ ...fields, version: existing.version + 1 }).where(eq(followUps.childKey, ck)).returning()
  } else {
    const child = await db.query.children.findFirst({ where: eq(children.childKey, ck) })
    if (!child) return c.json({ success: false, data: null, message: 'unknown_child' }, 404)
    ;[saved] = await db.insert(followUps).values({ childKey: ck, schoolId: child.schoolId, ...fields, version: 1 }).returning()
  }

  await writeAudit(db, c.get('jwtPayload').sub, 'FollowUp', saved.id, existing ? 'update' : 'create', existing, saved)
  return c.json({ success: true, data: saved })
})

// Episode-level PATCH — authoritative write path replacing the childKey-level route.
// Enforces state machine, rejects closed episodes and backward transitions.
followUpRoutes.patch('/episodes/:episodeId', authorize('follow_up', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const episodeId = c.req.param('episodeId')
  const { status, version, assignedToId, appointmentAt, notifiedAt, notificationChannel, notes } =
    await c.req.json<{
      status: string; version: number;
      assignedToId?: string; appointmentAt?: string; notifiedAt?: string;
      notificationChannel?: string; notes?: string;
    }>()

  const ep = await db.query.followUpEpisodes.findFirst({ where: eq(followUpEpisodes.id, episodeId) })
  if (!ep) return c.json({ success: false, data: null, message: 'not_found' }, 404)
  if (ep.closedAt) return c.json({ success: false, data: null, message: 'episode_closed' }, 409)
  if (ep.version !== version) return c.json({ success: false, data: null, message: 'version_conflict' }, 409)

  const allowed = ALLOWED_TRANSITIONS[ep.status] ?? []
  if (!allowed.includes(status)) {
    return c.json({ success: false, data: null, message: 'invalid_transition' }, 422)
  }

  const actorId = c.get('jwtPayload').sub
  const actorRole = c.get('jwtPayload').role
  const isTerminal = TERMINAL.has(status)

  const [updated] = await db.update(followUpEpisodes).set({
    status,
    assignedToId: assignedToId ?? ep.assignedToId,
    appointmentAt: appointmentAt ? new Date(appointmentAt) : ep.appointmentAt,
    notifiedAt: notifiedAt ? new Date(notifiedAt) : ep.notifiedAt,
    notificationChannel: notificationChannel ?? ep.notificationChannel,
    notes: notes ?? ep.notes,
    closedAt: isTerminal ? new Date() : null,
    closedReason: isTerminal ? status : null,
    updatedById: actorId,
    version: ep.version + 1,
  }).where(eq(followUpEpisodes.id, episodeId)).returning()

  await db.insert(followUpEvents).values({
    episodeId, childKey: ep.childKey, seasonId: ep.triggerSeasonId,
    fromStatus: ep.status, toStatus: status,
    actorId, actorRole, channel: notificationChannel ?? null,
  })

  return c.json({ success: true, data: updated })
})

// Open-episode shortcut: find the current open episode for a child and mutate it.
// Notifies the parent via a deep-link channel (sms/mailto) — no server-push.
followUpRoutes.post('/episodes/by-child/:childKey/notify', authorize('follow_up', 'school_doctor', 'admin'), async (c) => {
  const db = c.get('db')
  const { channel, note } = await c.req.json<{ channel: string; note?: string }>()
  const ck = c.req.param('childKey')

  const ep = await db.query.followUpEpisodes.findFirst({
    where: and(eq(followUpEpisodes.childKey, ck), isNull(followUpEpisodes.closedAt)),
  })
  if (!ep) return c.json({ success: false, data: null, message: 'no_open_episode' }, 404)

  const actorId = c.get('jwtPayload').sub
  const newStatus = ep.status === 'flagged' ? 'contacted' : ep.status
  const [updated] = await db.update(followUpEpisodes).set({
    notifiedAt: new Date(), notificationChannel: channel,
    notes: note ?? ep.notes,
    status: newStatus,
    updatedById: actorId,
    version: ep.version + 1,
  }).where(eq(followUpEpisodes.id, ep.id)).returning()

  await db.insert(followUpEvents).values({
    episodeId: ep.id, childKey: ck, seasonId: ep.triggerSeasonId,
    fromStatus: ep.status, toStatus: newStatus,
    actorId, actorRole: c.get('jwtPayload').role, channel,
    note: note ?? null,
  })
  return c.json({ success: true, data: updated })
})

// Legacy notify — kept for backward compat while Phase C rolls out.
followUpRoutes.post('/:childKey/notify', authorize('follow_up', 'admin'), async (c) => {
  const db = c.get('db')
  const { channel, note } = await c.req.json<{ channel: string; note?: string }>()
  const ck = c.req.param('childKey')
  const existing = await db.query.followUps.findFirst({ where: eq(followUps.childKey, ck) })
  if (!existing) return c.json({ success: false, data: null, message: 'unknown_child' }, 404)

  const [updated] = await db.update(followUps).set({
    notifiedAt: new Date(),
    notificationChannel: channel,
    notes: note ?? existing.notes,
    status: existing.status === 'flagged' ? 'contacted' : existing.status,
    updatedById: c.get('jwtPayload').sub,
    version: existing.version + 1,
  }).where(eq(followUps.childKey, ck)).returning()
  await writeAudit(db, c.get('jwtPayload').sub, 'FollowUp', updated.id, 'notify', existing, updated)
  return c.json({ success: true, data: updated })
})
