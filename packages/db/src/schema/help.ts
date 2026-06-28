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
