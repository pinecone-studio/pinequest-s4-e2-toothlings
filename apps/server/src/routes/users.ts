import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { UserRole } from '@pinequest/types'
import { prisma } from '@pinequest/db'
import { authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const userRoutes = new Hono<AppEnv>()

const ROLES: UserRole[] = ['screener', 'dentist', 'follow_up', 'admin']

// Replace a user's single class grant (admin assigns teacher → class).
const setClassScope = async (userId: string, classId: string | null | undefined, grantedBy: string) => {
  if (classId === undefined) return
  await prisma.userScope.deleteMany({ where: { userId, scopeKind: 'class' } })
  if (classId) {
    await prisma.userScope.create({ data: { userId, scopeKind: 'class', scopeId: classId, grantedBy } })
  }
}

userRoutes.get('/', authorize('admin'), async (c) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, schoolId: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  const scopes = await prisma.userScope.findMany({
    where: { scopeKind: 'class', userId: { in: users.map((u) => u.id) } },
    select: { userId: true, scopeId: true },
  })
  const classByUser = new Map(scopes.map((s) => [s.userId, s.scopeId]))
  return c.json({ success: true, data: users.map((u) => ({ ...u, classId: classByUser.get(u.id) ?? null })) })
})

userRoutes.post('/', authorize('admin'), async (c) => {
  const { name, email, password, role, schoolId, classId } =
    await c.req.json<{ name: string; email: string; password: string; role: UserRole; schoolId?: string; classId?: string }>()
  if (!name || !email || !password || password.length < 6 || !ROLES.includes(role)) {
    return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return c.json({ success: false, data: null, message: 'email_taken' }, 409)
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, role, passwordHash, schoolId: schoolId ?? null },
    select: { id: true, name: true, email: true, role: true, schoolId: true, isActive: true },
  })
  await setClassScope(user.id, classId, c.get('jwtPayload').sub)
  return c.json({ success: true, data: { ...user, classId: classId ?? null } }, 201)
})

const patchSchema = z.object({
  role: z.enum(['screener', 'dentist', 'follow_up', 'admin']).optional(),
  isActive: z.boolean().optional(),
  schoolId: z.string().nullable().optional(),
  classId: z.string().nullable().optional(),
})

userRoutes.patch('/:id', authorize('admin'), async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const { role, isActive, schoolId, classId } = parsed.data
  const id = c.req.param('id')
  const user = await prisma.user.update({
    where: { id },
    data: { role, isActive, schoolId },
    select: { id: true, name: true, email: true, role: true, schoolId: true, isActive: true },
  })
  await setClassScope(id, classId, c.get('jwtPayload').sub)
  return c.json({ success: true, data: user })
})
