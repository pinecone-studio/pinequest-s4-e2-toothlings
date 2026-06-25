import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { UserRole } from '@pinequest/types'
import { prisma } from '@pinequest/db'
import { authorize } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const userRoutes = new Hono<AppEnv>()

const ROLES: UserRole[] = ['screener', 'dentist', 'follow_up', 'admin']

userRoutes.get('/', authorize('admin'), async (c) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, schoolId: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return c.json({ success: true, data: users })
})

userRoutes.post('/', authorize('admin'), async (c) => {
  const { name, email, password, role, schoolId } =
    await c.req.json<{ name: string; email: string; password: string; role: UserRole; schoolId?: string }>()
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
  return c.json({ success: true, data: user }, 201)
})

const patchSchema = z.object({
  role: z.enum(['screener', 'dentist', 'follow_up', 'admin']).optional(),
  isActive: z.boolean().optional(),
  schoolId: z.string().nullable().optional(),
})

userRoutes.patch('/:id', authorize('admin'), async (c) => {
  const parsed = patchSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const { role, isActive, schoolId } = parsed.data
  const user = await prisma.user.update({
    where: { id: c.req.param('id') },
    data: { role, isActive, schoolId },
    select: { id: true, name: true, email: true, role: true, schoolId: true, isActive: true },
  })
  return c.json({ success: true, data: user })
})
