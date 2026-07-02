import { Hono } from 'hono'
import { and, eq, desc, asc, type SQL } from 'drizzle-orm'
import { appointments, volunteerDentists, children, schoolClasses, dentistBlocks } from '@pinequest/db/d1'
import { jitsiRoomName, jitsiRoomUrl, formatChildName } from '@pinequest/core'
import { authenticate, authorize } from '../middleware/auth.js'
import { hasChildAccess } from '../lib/scopeFilter.js'
import { loadChildSummary } from '../lib/childSummary.js'
import { recordDentistVerdict } from '../lib/dentistVerdict.js'
import type { AppEnv } from '../types.js'

export const appointmentRoutes = new Hono<AppEnv>()

// A dentist sees the calls booked WITH them; admin/follow-up see all. The child's
// name is included (clinical role) so the dentist knows who they're calling.
appointmentRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')

  let where: SQL | undefined
  if (payload.role === 'dentist') {
    const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, payload.sub) })
    if (!vol) return c.json({ success: true, data: [] })
    where = eq(appointments.dentistId, vol.id)
  } else if (payload.role !== 'admin' && payload.role !== 'follow_up') {
    where = eq(appointments.createdById, payload.sub) // others see only what they booked
  }

  const rows = await db.select({
    id: appointments.id,
    childKey: appointments.childKey,
    firstName: children.firstName,
    lastName: children.lastName,
    className: schoolClasses.name,
    birthYear: children.birthYear,
    dentistId: appointments.dentistId,
    dentistName: volunteerDentists.displayName,
    // The dentist's USER id (not the volunteer-profile id) — a PeerJS call invite is
    // addressed to a user, so the mobile caller needs this to ring the dentist.
    dentistUserId: volunteerDentists.userId,
    createdById: appointments.createdById,
    level: appointments.level,
    scheduledAt: appointments.scheduledAt,
    status: appointments.status,
    note: appointments.dentistNote,
  })
    .from(appointments)
    .leftJoin(children, eq(children.childKey, appointments.childKey))
    .leftJoin(schoolClasses, eq(schoolClasses.id, children.classId))
    .leftJoin(volunteerDentists, eq(volunteerDentists.id, appointments.dentistId))
    .where(where)
    .orderBy(desc(appointments.scheduledAt))

  const data = rows.map(({ firstName, lastName, scheduledAt, ...r }) => ({
    ...r,
    // Return ms epoch (not a Date→ISO string) so clients can compare/sort numerically,
    // matching AppointmentRow.scheduledAt: number and the /slots route below.
    scheduledAt: scheduledAt.getTime(),
    childName: lastName || firstName ? formatChildName({ firstName, lastName }) : null,
    roomUrl: jitsiRoomUrl(r.id),
  }))
  return c.json({ success: true, data })
})

// A dentist's UNAVAILABLE slots — booked appointments + self-blocked times. Times
// only (ms), no PII, so any user can see availability before booking/calling.
appointmentRoutes.get('/dentist/:dentistId/slots', authenticate, async (c) => {
  const db = c.get('db')
  const did = c.req.param('dentistId')
  const [appts, blocks] = await Promise.all([
    db.select({ at: appointments.scheduledAt }).from(appointments).where(and(eq(appointments.dentistId, did), eq(appointments.status, 'scheduled'))).orderBy(asc(appointments.scheduledAt)),
    db.select({ at: dentistBlocks.blockedAt }).from(dentistBlocks).where(eq(dentistBlocks.dentistId, did)),
  ])
  const data = [
    ...appts.map((a) => ({ scheduledAt: a.at.getTime(), kind: 'booked' as const })),
    ...blocks.map((b) => ({ scheduledAt: b.at.getTime(), kind: 'blocked' as const })),
  ]
  return c.json({ success: true, data })
})

// Full clinical summary for a booked call — screening photos, triage, AI advice,
// questionnaire. The appointment IS the authorization grant: a dentist with a call
// booked with this child may view their screening summary (dentists hold no class /
// school scope of their own). Admin / follow-up workers see any.
appointmentRoutes.get('/:id/summary', authenticate, async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const appt = await db.query.appointments.findFirst({ where: eq(appointments.id, c.req.param('id')) })
  if (!appt) return c.json({ success: false, data: null, message: 'not_found' }, 404)
  if (payload.role !== 'admin' && payload.role !== 'follow_up') {
    const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, payload.sub) })
    if (!vol || vol.id !== appt.dentistId) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }
  const child = await db.query.children.findFirst({ where: eq(children.childKey, appt.childKey) })
  if (!child) return c.json({ success: false, data: null, message: 'child_not_found' }, 404)
  const data = await loadChildSummary(db, child.id)
  if (!data) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data })
})

// A flagged child's screener (parent / teacher / school doctor) books a video call
// with a volunteer dentist. Booking is additive — one new row per booking. The Jitsi
// room is derived from the new row's UUID, so it carries no PII.
appointmentRoutes.post('/', authorize('parent', 'teacher', 'school_doctor', 'screener', 'follow_up', 'admin'), async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const { dentistId, childKey, scheduledAt, level } =
    await c.req.json<{ dentistId: string; childKey: string; scheduledAt: string | number; level?: string }>()
  if (!dentistId || !childKey || !scheduledAt) return c.json({ success: false, data: null, message: 'invalid_input' }, 400)

  const dentist = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.id, dentistId) })
  if (!dentist) return c.json({ success: false, data: null, message: 'dentist_not_found' }, 404)

  const child = await db.query.children.findFirst({ where: eq(children.childKey, childKey) })
  if (!child) return c.json({ success: false, data: null, message: 'child_not_found' }, 404)
  if (!(await hasChildAccess(db, payload, child))) return c.json({ success: false, data: null, message: 'forbidden' }, 403)

  const apptId = crypto.randomUUID()
  const [row] = await db.insert(appointments).values({
    id: apptId,
    dentistId,
    childKey,
    schoolId: child.schoolId,
    level: level === 'yellow' ? 'yellow' : 'red',
    scheduledAt: new Date(scheduledAt),
    roomName: jitsiRoomName(apptId),
    status: 'scheduled',
    createdById: payload.sub,
  }).returning()
  return c.json({ success: true, data: { ...row, roomUrl: jitsiRoomUrl(apptId) } }, 201)
})

// The booking dentist (or admin) records their post-call advice for the next step.
// Saving a note IS the "call finished" signal: it flips status → 'completed' (real
// status, not a time guess); clearing it reverts to 'scheduled'. Cancelled stays put.
appointmentRoutes.patch('/:id', authorize('dentist', 'admin'), async (c) => {
  const db = c.get('db')
  const payload = c.get('jwtPayload')
  const { note, outcome } = await c.req.json<{ note?: string; outcome?: string }>()
  const appt = await db.query.appointments.findFirst({ where: eq(appointments.id, c.req.param('id')) })
  if (!appt) return c.json({ success: false, data: null, message: 'not_found' }, 404)
  if (payload.role !== 'admin') {
    const vol = await db.query.volunteerDentists.findFirst({ where: eq(volunteerDentists.userId, payload.sub) })
    if (!vol || vol.id !== appt.dentistId) return c.json({ success: false, data: null, message: 'forbidden' }, 403)
  }
  const trimmed = note?.trim() || null
  const verdict = outcome === 'treatment_needed' || outcome === 'postponed' ? outcome : null
  // A recorded verdict IS the "call finished" signal (a bare note also completes it).
  const status = appt.status === 'cancelled' ? 'cancelled' : verdict || trimmed ? 'completed' : 'scheduled'
  const [row] = await db.update(appointments).set({ dentistNote: trimmed, status }).where(eq(appointments.id, appt.id)).returning()
  // The dentist's verdict closes the child's open follow-up episode + emits an audited
  // event — the ONLY status write the appointed dentist makes.
  if (verdict) {
    await recordDentistVerdict(db, appt.childKey, payload.sub, payload.role, trimmed ?? '', verdict)
  }
  return c.json({ success: true, data: row })
})
