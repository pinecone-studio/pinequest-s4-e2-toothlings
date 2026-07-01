import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { eq, or, and, inArray } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@pinequest/types'
import { users, schools, children, parentChildLinks, userScopes } from '@pinequest/db/d1'
import { authenticate } from '../middleware/auth.js'
import { ensureTeacherClass } from '../lib/teacherClass.js'
import type { AppEnv } from '../types.js'

export const authRoutes = new Hono<AppEnv>()

const TTL = 60 * 60 * 24 * 7 // 7 days
const secretOf = (env: AppEnv['Bindings']) => env.JWT_SECRET ?? 'dev-secret-change-me'

// A staff member who registered as "teacher + parent" may name a child that
// isn't on any roster YET (they haven't built their class). We park that name as
// a pending scope and link it the moment a matching child appears.
const PENDING_CHILD = 'pending_child'

const childByName = (db: AppEnv['Variables']['db'], name: string) => {
  const tokens = name.trim().split(/\s+/).filter(Boolean)
  if (!tokens.length) return Promise.resolve(undefined)
  return db.query.children.findFirst({ where: or(inArray(children.firstName, tokens), inArray(children.lastName, tokens)) })
}

/** Idempotently resolve a user's parked child name into a real parent link once
 *  the child exists. Returns true if the user now has a parent link. */
const reconcileParentLink = async (db: AppEnv['Variables']['db'], userId: string): Promise<boolean> => {
  const existing = await db.query.parentChildLinks.findFirst({ where: eq(parentChildLinks.userId, userId) })
  if (existing) return true
  const pending = await db.query.userScopes.findFirst({
    where: and(eq(userScopes.userId, userId), eq(userScopes.scopeKind, PENDING_CHILD)),
  })
  if (!pending) return false
  const child = await childByName(db, pending.scopeId)
  if (!child) return false
  await db.insert(parentChildLinks)
    .values({ userId, childKey: child.childKey, schoolId: child.schoolId, consentAt: new Date() })
    .onConflictDoNothing()
  await db.delete(userScopes).where(and(eq(userScopes.userId, userId), eq(userScopes.scopeKind, PENDING_CHILD)))
  return true
}

authRoutes.post('/login', async (c) => {
  const db = c.get('db')
  const { email, password } = await c.req.json<{ email: string; password: string }>()
  // Accept phone (8 digits → +976XXXXXXXX) or email as the login identifier
  const normalised = /^\d{8}$/.test(email.trim()) ? `+976${email.trim()}` : email.trim()
  const user = await db.query.users.findFirst({
    where: or(eq(users.email, normalised), eq(users.phone, normalised)),
  })
  // Distinguish "no such account" from "wrong password" so the UI can guide the
  // user (register vs. retry). Inactive accounts read as not-registered.
  if (!user || !user.passwordHash || !user.isActive) {
    return c.json({ success: false, data: null, message: 'user_not_found' }, 401)
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return c.json({ success: false, data: null, message: 'wrong_password' }, 401)
  const token = await sign(
    { sub: user.id, role: user.role as UserRole, schoolId: user.schoolId ?? undefined, exp: Math.floor(Date.now() / 1000) + TTL },
    secretOf(c.env),
  )
  return c.json({ success: true, data: { token, user: { id: user.id, name: user.name, role: user.role, schoolId: user.schoolId } } })
})

const SELF_ROLES = ['teacher', 'school_doctor', 'parent'] as const

authRoutes.post('/register', async (c) => {
  const db = c.get('db')
  const { name, email, password, phone, role, schoolName, childName, className, expectedTotal } =
    await c.req.json<{ name: string; email?: string; password: string; phone?: string; role?: string; schoolName?: string; childName?: string; className?: string; expectedTotal?: number }>()
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
  // A "teacher + parent" registration whose child isn't on a roster yet: park the
  // name so we can link it later (reconcileParentLink) once the child appears.
  let pendingChildName: string | null = null
  // Parent links to their child by NAME (roster lookup). Names aren't unique, so
  // match any first/last name token and take the first hit.
  const cname = (childName ?? '').trim()
  const tokens = cname.split(/\s+/).filter(Boolean)
  if (selectedRole === 'teacher' || selectedRole === 'school_doctor') {
    const sName = (schoolName ?? '').trim()
    if (!sName) return c.json({ success: false, data: null, message: 'school_required' }, 400)
    const school = await db.query.schools.findFirst({ where: eq(schools.name, sName) })
    schoolId = school?.id ?? (await db.insert(schools).values({ name: sName }).returning())[0].id
    if (tokens.length) {
      const child = await childByName(db, cname)
      if (child) { linkChildKey = child.childKey; linkSchoolId = child.schoolId }
      else pendingChildName = cname // link deferred until the child is enrolled
    }
  } else if (selectedRole === 'parent') {
    if (!tokens.length) return c.json({ success: false, data: null, message: 'child_name_required' }, 400)
    const child = await childByName(db, cname)
    if (!child) return c.json({ success: false, data: null, message: 'child_not_found' }, 400)
    schoolId = child.schoolId
    linkChildKey = child.childKey
    linkSchoolId = child.schoolId
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const [user] = await db.insert(users)
    .values({ name, email: storedEmail, role: selectedRole, phone: normPhone, passwordHash, schoolId })
    .returning()
  // A teacher who named their class + total kids gets that class created for the
  // current season (with expectedTotal as the coverage denominator) and scoped to them.
  if (selectedRole === 'teacher' && schoolId && (className ?? '').trim()) {
    const total = typeof expectedTotal === 'number' && expectedTotal > 0 ? Math.floor(expectedTotal) : null
    await ensureTeacherClass(db, { userId: user.id, schoolId, className: className as string, expectedTotal: total }).catch(() => null)
  }
  if (linkChildKey && linkSchoolId) {
    await db.insert(parentChildLinks)
      .values({ userId: user.id, childKey: linkChildKey, schoolId: linkSchoolId, consentAt: new Date() })
      .onConflictDoNothing()
  } else if (pendingChildName) {
    await db.insert(userScopes)
      .values({ userId: user.id, scopeKind: PENDING_CHILD, scopeId: pendingChildName })
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
    // Pick up a deferred link if the child has since been enrolled.
    const linked = await reconcileParentLink(db, user.id)
    if (!linked) return c.json({ success: false, data: null, message: 'no_parent_link' }, 403)
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
  const { name, phone, email, avatarUrl } = await c.req.json<{ name?: string; phone?: string; email?: string; avatarUrl?: string | null }>()
  const set: { name?: string; phone?: string | null; email?: string; avatarUrl?: string | null } = {}
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
  // Passing avatarUrl (data URL string) sets the photo; null/'' clears it.
  if (avatarUrl !== undefined) set.avatarUrl = avatarUrl || null
  if (!Object.keys(set).length) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)
  const [user] = await db.update(users).set(set).where(eq(users.id, c.get('jwtPayload').sub)).returning()
  return c.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, schoolId: user.schoolId, avatarUrl: user.avatarUrl } })
})

authRoutes.get('/me', authenticate, async (c) => {
  const db = c.get('db')
  const sub = c.get('jwtPayload').sub
  // Resolve any pending "teacher + parent" link first, so the switch UI appears
  // as soon as the named child has been added to a roster.
  const hasLink = await reconcileParentLink(db, sub)
  const user = await db.query.users.findFirst({
    where: eq(users.id, sub),
    columns: { id: true, email: true, name: true, role: true, phone: true, schoolId: true, isActive: true, avatarUrl: true },
  })
  const link = hasLink ? { userId: sub } : null
  // activeRole = the JWT's current (possibly switched) role; hasParentLink gates the switch UI.
  return c.json({ success: true, data: user ? { ...user, activeRole: c.get('jwtPayload').role, hasParentLink: !!link } : null })
})
