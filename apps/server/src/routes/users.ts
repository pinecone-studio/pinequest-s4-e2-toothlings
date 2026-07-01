import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { and, desc, eq, inArray } from 'drizzle-orm'
import type { UserRole } from '@pinequest/types'
import { users, userScopes, parentChildLinks, type DB } from '@pinequest/db/d1'
import { authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import type { AppEnv } from '../types.js'

export const userRoutes = new Hono<AppEnv>()

const ROLES: UserRole[] = ['screener', 'teacher', 'parent', 'school_doctor', 'dentist', 'follow_up', 'admin']
const userCols = { id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone, schoolId: users.schoolId, isActive: users.isActive }

// Replace a user's single class grant (admin assigns teacher → class).
const setClassScope = async (db: DB, userId: string, classId: string | null | undefined, grantedBy: string) => {
  if (classId === undefined) return
  await db.delete(userScopes).where(and(eq(userScopes.userId, userId), eq(userScopes.scopeKind, 'class')))
  if (classId) await db.insert(userScopes).values({ userId, scopeKind: 'class', scopeId: classId, grantedBy })
}

userRoutes.get('/', authorize('admin', 'school_doctor'), async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  // School doctors see only their own school's staff; admin sees everyone.
  const where = payload.role === 'school_doctor' && payload.schoolId ? eq(users.schoolId, payload.schoolId) : undefined
  const list = await db.select({ ...userCols, createdAt: users.createdAt }).from(users).where(where).orderBy(desc(users.createdAt))
  const scopes = list.length
    ? await db.select({ userId: userScopes.userId, scopeId: userScopes.scopeId }).from(userScopes)
        .where(and(eq(userScopes.scopeKind, 'class'), inArray(userScopes.userId, list.map((u) => u.id))))
    : []
  const classByUser = new Map(scopes.map((s) => [s.userId, s.scopeId]))
  return c.json({ success: true, data: list.map((u) => ({ ...u, classId: classByUser.get(u.id) ?? null })) })
})

userRoutes.post('/', authorize('admin'), async (c) => {
  const db = c.get('db')
  const { name, email, password, role, phone, schoolId, classId } =
    await c.req.json<{ name: string; email: string; password: string; role: UserRole; phone?: string; schoolId?: string; classId?: string }>()
  if (!name || !email || !password || password.length < 6 || !ROLES.includes(role)) {
    return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  }
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) return c.json({ success: false, data: null, message: 'email_taken' }, 409)
  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db.insert(users)
    .values({ name, email, role, phone: phone?.trim() || null, passwordHash, schoolId: schoolId ?? null })
    .returning(userCols)
  await setClassScope(db, user.id, classId, c.get('jwtPayload').sub)
  await writeAudit(db, c.get('jwtPayload').sub, 'User', user.id, 'user_create', null, user)
  return c.json({ success: true, data: { ...user, classId: classId ?? null } }, 201)
})

const patchSchema = z.object({
  role: z.enum(['screener', 'teacher', 'parent', 'school_doctor', 'dentist', 'follow_up', 'admin']).optional(),
  isActive: z.boolean().optional(),
  schoolId: z.string().nullable().optional(),
  classId: z.string().nullable().optional(),
})

userRoutes.patch('/:id', authorize('admin'), async (c) => {
  const db = c.get('db')
  const parsed = patchSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const { role, isActive, schoolId, classId } = parsed.data
  const id = c.req.param('id')
  const [before] = await db.select(userCols).from(users).where(eq(users.id, id))
  const [user] = await db.update(users).set({ role, isActive, schoolId }).where(eq(users.id, id)).returning(userCols)
  await setClassScope(db, id, classId, c.get('jwtPayload').sub)
  await writeAudit(db, c.get('jwtPayload').sub, 'User', id, 'user_update', before, user)
  return c.json({ success: true, data: user })
})

// Hard-delete a user from the DB, plus their access grants + parent links. Immutable
// audit/event actor stamps (screenings, reviews, follow-ups) are historical → left intact.
userRoutes.delete('/:id', authorize('admin'), async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const actorId = c.get('jwtPayload').sub
  if (id === actorId) return c.json({ success: false, data: null, message: 'cannot_delete_self' }, 400)

  const [before] = await db.select(userCols).from(users).where(eq(users.id, id))
  if (!before) return c.json({ success: false, data: null, message: 'not_found' }, 404)
  // Never leave the system without an admin.
  if (before.role === 'admin') {
    const admins = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.role, 'admin'), eq(users.isActive, true)))
    if (admins.length <= 1) return c.json({ success: false, data: null, message: 'last_admin' }, 400)
  }

  await db.delete(userScopes).where(eq(userScopes.userId, id))
  await db.delete(parentChildLinks).where(eq(parentChildLinks.userId, id))
  await db.delete(users).where(eq(users.id, id))
  await writeAudit(db, actorId, 'User', id, 'user_delete', before, null)
  return c.json({ success: true, data: { id } })
})
