import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'

const uuid = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID())
const ts = (name: string) => integer(name, { mode: 'timestamp_ms' })
const bool = (name: string) => integer(name, { mode: 'boolean' })

// Immutable event. id = client-generated UUID (sync idempotency key) — no default.
export const screenings = sqliteTable('Screening', {
  id: text('id').primaryKey(),
  childKey: text('childKey').notNull(),
  classId: text('classId').notNull(),
  schoolId: text('schoolId').notNull(),
  seasonId: text('seasonId').notNull(),
  screenedById: text('screenedById').notNull(),
  triageLevel: text('triageLevel').notNull(), // 'green' | 'yellow' | 'red'
  triageScore: real('triageScore').notNull(),
  triageConfidentWording: bool('triageConfidentWording').notNull(),
  triageReason: text('triageReason'),
  modelName: text('modelName').notNull(),
  modelVersion: text('modelVersion'),
  contentVersionId: text('contentVersionId').notNull(),
  capturedAt: ts('capturedAt').notNull(),
  deviceId: text('deviceId'),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
  syncedAt: ts('syncedAt'),
}, (t) => [
  index('Screening_childKey_idx').on(t.childKey),
  index('Screening_child_season_idx').on(t.childKey, t.seasonId),
  index('Screening_school_season_idx').on(t.schoolId, t.seasonId),
  index('Screening_school_triage_idx').on(t.schoolId, t.triageLevel),
  index('Screening_classId_idx').on(t.classId),
  index('Screening_capturedAt_idx').on(t.capturedAt),
])

export const screeningReviews = sqliteTable('ScreeningReview', {
  id: uuid(),
  screeningId: text('screeningId').notNull().unique(),
  reviewedById: text('reviewedById').notNull(),
  confirmedLevel: text('confirmedLevel').notNull(),
  note: text('note'),
  createdAt: ts('createdAt').notNull().$defaultFn(() => new Date()),
  updatedAt: ts('updatedAt').notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
})

export const screeningImages = sqliteTable('ScreeningImage', {
  id: uuid(),
  screeningId: text('screeningId').notNull(),
  ref: text('ref').notNull(),
  order: integer('order').notNull().default(0),
}, (t) => [index('ScreeningImage_screeningId_idx').on(t.screeningId)])

export const toothFindings = sqliteTable('ToothFinding', {
  id: text('id').primaryKey(), // client-generated
  screeningId: text('screeningId').notNull(),
  fdi: integer('fdi'),
  className: text('className').notNull(),
  classId: integer('classId').notNull(),
  confidence: real('confidence').notNull(),
  boxX1: real('boxX1').notNull(),
  boxY1: real('boxY1').notNull(),
  boxX2: real('boxX2').notNull(),
  boxY2: real('boxY2').notNull(),
  longitudinal: text('longitudinal'),
}, (t) => [index('ToothFinding_screeningId_idx').on(t.screeningId)])

export const questionnaires = sqliteTable('Questionnaire', {
  id: uuid(),
  screeningId: text('screeningId').notNull().unique(),
  isAdult: bool('isAdult').notNull().default(false),
  swelling: bool('swelling'),
  painDisturbingSleepOrEating: bool('painDisturbingSleepOrEating'),
  fever: bool('fever'),
  gumPimpleOrFistula: bool('gumPimpleOrFistula'),
  trauma: bool('trauma'),
  bleedingGums: bool('bleedingGums'),
  smoker: bool('smoker'),
  lastCheckupAdult: text('lastCheckupAdult'),
})

// The only mutable record (two-way sync, version optimistic-lock).
export const followUps = sqliteTable('FollowUp', {
  id: uuid(),
  childKey: text('childKey').notNull().unique(),
  schoolId: text('schoolId').notNull(),
  status: text('status').notNull().default('flagged'),
  assignedToId: text('assignedToId'),
  appointmentAt: ts('appointmentAt'),
  notifiedAt: ts('notifiedAt'),
  notificationChannel: text('notificationChannel'),
  notes: text('notes'),
  updatedAt: ts('updatedAt').notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  updatedById: text('updatedById').notNull(),
  version: integer('version').notNull().default(0),
}, (t) => [index('FollowUp_school_status_idx').on(t.schoolId, t.status)])
