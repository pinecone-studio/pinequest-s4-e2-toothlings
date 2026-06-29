import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })

// A dentist who has volunteered to help screened children (their availability profile).
export const volunteerDentists = sqliteTable('VolunteerDentist', {
  id: id(),
  userId: text('userId').notNull(), // FK User (dentist) — one profile per dentist
  displayName: text('displayName').notNull(),
  specialty: text('specialty'), // 'endodontics'|'oral_surgery'|'operative'|'pediatric'|'prosthodontics'|'periodontics'
  org: text('org'), // clinic / hospital (optional)
  area: text('area'), // soum / district served (optional)
  avatarUrl: text('avatarUrl'),
  experienceYears: integer('experienceYears'), // years in practice (shown on the dentist card)
  licenseNo: text('licenseNo'), // dentist licence number (verification)
  lat: real('lat'),
  lng: real('lng'),
  isAvailable: integer('isAvailable', { mode: 'boolean' }).notNull().default(true),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('VolunteerDentist_userId_key').on(t.userId)])

// A request from a red/yellow child's family (or teacher) for a volunteer dentist.
// Mutable status is the only mutable layer here (like FollowUp). childKey carries no PII.
export const helpRequests = sqliteTable('HelpRequest', {
  id: id(),
  childKey: text('childKey').notNull(),
  schoolId: text('schoolId').notNull(),
  level: text('level').notNull(), // 'red' | 'yellow' — only flagged children request help
  requestedById: text('requestedById').notNull(), // FK User (parent / teacher)
  note: text('note'),
  status: text('status').notNull().default('open'), // 'open' | 'connected' | 'closed'
  dentistId: text('dentistId'), // FK VolunteerDentist once a dentist connects
  connectedAt: ts('connectedAt'),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
  updatedAt: ts('updatedAt').notNull().$defaultFn(() => new Date()),
}, (t) => [
  index('HelpRequest_status_idx').on(t.status),
  index('HelpRequest_childKey_idx').on(t.childKey),
  index('HelpRequest_school_idx').on(t.schoolId),
  index('HelpRequest_requestedBy_idx').on(t.requestedById),
])

// A scheduled video-call appointment between a flagged child and a volunteer dentist.
// roomName is a PII-free Jitsi room (derived from this row's UUID). Booking is additive
// (a new row per booking); status is the only mutable field, like HelpRequest / FollowUp.
export const appointments = sqliteTable('Appointment', {
  id: id(),
  dentistId: text('dentistId').notNull(), // FK VolunteerDentist
  childKey: text('childKey').notNull(), // immutable identity, no PII
  schoolId: text('schoolId').notNull(),
  level: text('level').notNull(), // 'red' | 'yellow'
  scheduledAt: ts('scheduledAt').notNull(),
  roomName: text('roomName').notNull(), // Jitsi room id (PII-free)
  status: text('status').notNull().default('scheduled'), // 'scheduled' | 'completed' | 'cancelled'
  dentistNote: text('dentistNote'), // dentist's post-call advice for the next step
  createdById: text('createdById').notNull(), // FK User (the screener/parent who booked)
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [
  index('Appointment_dentist_idx').on(t.dentistId),
  index('Appointment_childKey_idx').on(t.childKey),
])

// A time slot a dentist has blocked off themselves (unavailable for bookings).
export const dentistBlocks = sqliteTable('DentistBlock', {
  id: id(),
  dentistId: text('dentistId').notNull(), // FK VolunteerDentist
  blockedAt: ts('blockedAt').notNull(), // the blocked slot's start time
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('DentistBlock_dentist_at_key').on(t.dentistId, t.blockedAt)])
