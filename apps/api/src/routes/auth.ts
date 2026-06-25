import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@pinequest/types'
import { prisma } from '@pinequest/db'
import { authenticate } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const authRoutes = new Hono<AppEnv>()

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'
const TTL = 60 * 60 * 24 * 7 // 7 days

authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash || !user.isActive) {
    return c.json({ success: false, data: null, message: 'invalid_credentials' }, 401)
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return c.json({ success: false, data: null, message: 'invalid_credentials' }, 401)
  const token = await sign(
    { sub: user.id, role: user.role as UserRole, schoolId: user.schoolId ?? undefined, exp: Math.floor(Date.now() / 1000) + TTL },
    SECRET,
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId } } })
})

authRoutes.post('/register', async (c) => {
  const { name, email, password } = await c.req.json<{ name: string; email: string; password: string }>()
  if (!name || !email || !password || password.length < 6) {
    return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return c.json({ success: false, data: null, message: 'email_taken' }, 409)
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, role: 'screener', passwordHash } })
  const token = await sign(
    { sub: user.id, role: 'screener' as UserRole, exp: Math.floor(Date.now() / 1000) + TTL },
    SECRET,
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role } } }, 201)
})

authRoutes.get('/me', authenticate, async (c) => {
  const { sub } = c.get('jwtPayload')
  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { id: true, email: true, name: true, role: true, schoolId: true, isActive: true },
  })
  return c.json({ success: true, data: user })
})
