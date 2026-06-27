import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { eq, or, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@pinequest/types'
import { users, schools, children, parentChildLinks } from '@pinequest/db/d1'
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

const SELF_ROLES = ['teacher', 'school_doctor', 'parent'] as const

authRoutes.post('/register', async (c) => {
  const db = c.get('db')
  const { name, email, password, phone, role, schoolName, childName } =
    await c.req.json<{ name: string; email?: string; password: string; phone?: string; role?: string; schoolName?: string; childName?: string }>()
  // Phone is the required identifier — remote soum residents may have no email.
  const normPhone = /^\d{8}$/.test((phone ?? '').trim()) ? `+976${(phone ?? '').trim()}` : (phone ?? '').trim()
  if (!name || !normPhone || !password || password.length < 6) {
    return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  }
  // Only these roles may self-register; dentist/follow_up/admin are admin-provisioned.
  const selectedRole: UserRole = (SELF_ROLES as readonly string[]).includes(role ?? '') ? (role as UserRole) : 'screener'
  // Email optional; when absent store a phone-derived sentinel to satisfy the NOT NULL/unique column.
  const cleanEmail = (email ?? '').trim() || null
  const storedEmail = cleanEmail ?? `${normPhone}@phone.screener.mn`
  const phoneTaken = await db.query.users.findFirst({ where: eq(users.phone, normPhone) })
  if (phoneTaken) return c.json({ success: false, data: null, message: 'phone_taken' }, 409)
  const existing = await db.query.users.findFirst({ where: eq(users.email, storedEmail) })
  if (existing) return c.json({ success: false, data: null, message: 'email_taken' }, 409)

  // School-bound roles find-or-create their school; a parent links to one child by
  // its code. A staff member MAY also pass a childCode → dual teacher/parent link.
  let schoolId: string | null = null
  let linkChildKey: string | null = null
  let linkSchoolId: string | null = null
  // Parent links to their child by NAME (roster lookup). Names aren't unique, so
  // match any first/last name token and take the first hit.
  const cname = (childName ?? '').trim()
  const tokens = cname.split(/\s+/).filter(Boolean)
  const findChildByName = () =>
    db.query.children.findFirst({ where: or(inArray(children.firstName, tokens), inArray(children.lastName, tokens)) })
  if (selectedRole === 'teacher' || selectedRole === 'school_doctor') {
    const sName = (schoolName ?? '').trim()
    if (!sName) return c.json({ success: false, data: null, message: 'school_required' }, 400)
    const school = await db.query.schools.findFirst({ where: eq(schools.name, sName) })
    schoolId = school?.id ?? (await db.insert(schools).values({ name: sName }).returning())[0].id
    if (tokens.length) {
      const child = await findChildByName()
      if (child) { linkChildKey = child.childKey; linkSchoolId = child.schoolId }
    }
  } else if (selectedRole === 'parent') {
    if (!tokens.length) return c.json({ success: false, data: null, message: 'child_name_required' }, 400)
    const child = await findChildByName()
    if (!child) return c.json({ success: false, data: null, message: 'child_not_found' }, 400)
    schoolId = child.schoolId
    linkChildKey = child.childKey
    linkSchoolId = child.schoolId
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db.insert(users)
    .values({ name, email: storedEmail, role: selectedRole, phone: normPhone, passwordHash, schoolId })
    .returning()
  if (linkChildKey && linkSchoolId) {
    await db.insert(parentChildLinks)
      .values({ userId: user.id, childKey: linkChildKey, schoolId: linkSchoolId, consentAt: new Date() })
      .onConflictDoNothing()
  }
  const token = await sign(
    { sub: user.id, role: selectedRole, schoolId: schoolId ?? undefined, exp: Math.floor(Date.now() / 1000) + TTL },
    secretOf(c.env),
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId } } }, 201)
})

// Dual-role switch: a teacher who also linked their own child can re-scope to a
// parent JWT (and back). Reuses role-based scoping — no separate session model.
authRoutes.post('/switch-role', authenticate, async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const { role } = await c.req.json<{ role: string }>()
  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) })
  if (!user) return c.json({ success: false, data: null, message: 'not_found' }, 404)

  let target: UserRole
  if (role === 'parent') {
    const link = await db.query.parentChildLinks.findFirst({ where: eq(parentChildLinks.userId, user.id) })
    if (!link) return c.json({ success: false, data: null, message: 'no_parent_link' }, 403)
    target = 'parent'
  } else {
    target = user.role as UserRole // back to their provisioned role
  }
  const token = await sign(
    { sub: user.id, role: target, schoolId: user.schoolId ?? undefined, exp: Math.floor(Date.now() / 1000) + TTL },
    secretOf(c.env),
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: target, schoolId: user.schoolId } } })
})

authRoutes.patch('/me', authenticate, async (c) => {
  const db = c.get('db')
  const { name, phone, email } = await c.req.json<{ name?: string; phone?: string; email?: string }>()
  const set: { name?: string; phone?: string | null; email?: string } = {}
  if (typeof name === 'string' && name.trim()) set.name = name.trim()
  if (typeof phone === 'string') set.phone = phone.trim() || null
  if (typeof email === 'string' && email.trim()) {
    const clean = email.trim().toLowerCase()
    const taken = await db.query.users.findFirst({ where: eq(users.email, clean) })
    if (taken && taken.id !== c.get('jwtPayload').sub) {
      return c.json({ success: false, data: null, message: 'email_taken' }, 409)
    }
    set.email = clean
  }
  if (!Object.keys(set).length) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const [user] = await db.update(users).set(set).where(eq(users.id, c.get('jwtPayload').sub)).returning()
  return c.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, schoolId: user.schoolId } })
})

authRoutes.get('/me', authenticate, async (c) => {
  const db = c.get('db')
  const sub = c.get('jwtPayload').sub
  const [user, link] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, sub),
      columns: { id: true, email: true, name: true, role: true, phone: true, schoolId: true, isActive: true },
    }),
    db.query.parentChildLinks.findFirst({ where: eq(parentChildLinks.userId, sub) }),
  ])
  // activeRole = the JWT's current (possibly switched) role; hasParentLink gates the switch UI.
  return c.json({ success: true, data: user ? { ...user, activeRole: c.get('jwtPayload').role, hasParentLink: !!link } : null })
})
