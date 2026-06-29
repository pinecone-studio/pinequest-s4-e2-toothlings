import { Hono } from 'hono'
import { and, eq, gt } from 'drizzle-orm'
import { callInvites } from '@pinequest/db/d1'
import { authenticate } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const callRoutes = new Hono<AppEnv>()

const TTL_MS = 120_000 // invites ring for 120s

// Caller invites a callee to a room. WebRTC media is peer-to-peer (PeerJS) — this
// row only tells the callee a call is incoming.
callRoutes.post('/', authenticate, async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const { roomId, toUserId, fromName } = await c.req.json<{ roomId: string; toUserId: string; fromName?: string }>()
  if (!roomId || !toUserId) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const [row] = await db.insert(callInvites).values({
    roomId,
    toUserId,
    fromUserId: payload.sub,
    fromName: fromName?.trim() || 'Дуудлага',
    status: 'ringing',
    expiresAt: new Date(Date.now() + TTL_MS),
  }).returning()
  return c.json({ success: true, data: row }, 201)
})

// Callee polls for ringing invites addressed to them (not expired).
callRoutes.get('/pending', authenticate, async (c) => {
  const db = c.get('db')
  const rows = await db.select().from(callInvites).where(and(
    eq(callInvites.toUserId, c.get('jwtPayload').sub),
    eq(callInvites.status, 'ringing'),
    gt(callInvites.expiresAt, new Date()),
  ))
  return c.json({ success: true, data: rows })
})

// Caller polls a single invite to learn answered / declined.
callRoutes.get('/:id', authenticate, async (c) => {
  const row = await c.get('db').query.callInvites.findFirst({ where: eq(callInvites.id, c.req.param('id')) })
  return c.json({ success: true, data: row ?? null })
})

// Callee answers or declines (only the addressed callee may change status).
callRoutes.post('/:id/answer', authenticate, async (c) => {
  const db = c.get('db')
  const [row] = await db.update(callInvites).set({ status: 'answered' })
    .where(and(eq(callInvites.id, c.req.param('id')), eq(callInvites.toUserId, c.get('jwtPayload').sub))).returning()
  return c.json({ success: true, data: row ?? null })
})

callRoutes.post('/:id/decline', authenticate, async (c) => {
  const db = c.get('db')
  const [row] = await db.update(callInvites).set({ status: 'declined' })
    .where(and(eq(callInvites.id, c.req.param('id')), eq(callInvites.toUserId, c.get('jwtPayload').sub))).returning()
  return c.json({ success: true, data: row ?? null })
})
