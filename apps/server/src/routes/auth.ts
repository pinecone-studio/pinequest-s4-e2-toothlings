import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@pinequest/types'
import { users } from '@pinequest/db/d1'
import { authenticate } from '../middleware/auth.js'
import type { AppEnv } from '../types.js'

export const authRoutes = new Hono<AppEnv>()

const TTL = 60 * 60 * 24 * 7 // 7 days
const secretOf = (env: AppEnv['Bindings']) => env.JWT_SECRET ?? 'dev-secret-change-me'

authRoutes.post('/login', async (c) => {
  const db = c.get('db')
  const { email, password } = await c.req.json<{ email: string; password: string }>()
  // Accept phone (8 digits → +976XXXXXXXX) or email as the login identifier
  const normalised = /^\d{8}$/.test(email.trim()) ? `+976${email.trim()}` : email.trim()
  const user = await db.query.users.findFirst({
    where: or(eq(users.email, normalised), eq(users.phone, normalised)),
  })
  if (!user || !user.passwordHash || !user.isActive) {
    return c.json({ success: false, data: null, message: 'invalid_credentials' }, 401)
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return c.json({ success: false, data: null, message: 'invalid_credentials' }, 401)
  const token = await sign(
    { sub: user.id, role: user.role as UserRole, schoolId: user.schoolId ?? undefined, exp: Math.floor(Date.now() / 1000) + TTL },
    secretOf(c.env),
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId } } })
})

authRoutes.post('/register', async (c) => {
  const db = c.get('db')
  const { name, email, password, phone } = await c.req.json<{ name: string; email: string; password: string; phone?: string }>()
  if (!name || !email || !password || password.length < 6) {
    return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  }
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) return c.json({ success: false, data: null, message: 'email_taken' }, 409)
  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db.insert(users).values({ name, email, role: 'screener', phone: phone?.trim() || null, passwordHash }).returning()
  const token = await sign(
    { sub: user.id, role: 'screener' as UserRole, exp: Math.floor(Date.now() / 1000) + TTL },
    secretOf(c.env),
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role } } }, 201)
})

authRoutes.get('/me', authenticate, async (c) => {
  const db = c.get('db')
  const user = await db.query.users.findFirst({
    where: eq(users.id, c.get('jwtPayload').sub),
    columns: { id: true, email: true, name: true, role: true, schoolId: true, isActive: true },
  })
  return c.json({ success: true, data: user ?? null })
})
