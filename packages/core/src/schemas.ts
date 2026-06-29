import { z } from 'zod'

/**
 * Zod schemas for the runtime trust boundaries (untrusted input from devices /
 * bulk imports). Internal shapes stay as plain types in @pinequest/types; only
 * what crosses a boundary gets validated here.
 */

export const rosterImportRowSchema = z.object({
  rosterSlot: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Upper bound is checked lazily at parse() time, NOT at module load. On
  // Cloudflare Workers the clock is frozen at epoch 0 during top-level module
  // evaluation, so `new Date().getFullYear()` read here would be 1970 and reject
  // every real birth year. A refine runs inside the request, where the clock is live.
  birthYear: z
    .number()
    .int()
    .gte(2000)
    .refine((y) => y <= new Date().getFullYear(), { message: 'birthYear cannot be in the future' }),
  gender: z.enum(['M', 'F']).optional(),
  guardianPhone: z.string().min(6).optional(),
})
export type RosterImportRowInput = z.infer<typeof rosterImportRowSchema>

/** A roster row entered by a teacher — same as import, plus an optional guardian email. */
export const teacherRosterRowSchema = rosterImportRowSchema.extend({
  guardianEmail: z.string().email().optional(),
})

/** Teacher creates a class + its roster in one shot (the create-class form payload). */
export const teacherClassCreateSchema = z.object({
  name: z.string().min(1),
  seasonId: z.string().min(1),
  gradeLevel: z.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
  reminderPhone: z.string().min(6).optional(),
  students: z.array(teacherRosterRowSchema).max(100),
})
export type TeacherClassCreateInput = z.infer<typeof teacherClassCreateSchema>

/** Teacher appends students to an existing class — roster slots are assigned server-side. */
export const teacherRosterAppendSchema = z.object({
  students: z.array(teacherRosterRowSchema.omit({ rosterSlot: true })).min(1).max(100),
})
export type TeacherRosterAppendInput = z.infer<typeof teacherRosterAppendSchema>

// MUST mirror FollowUpStatus in @pinequest/types/common.ts — this validates the
// /api/followups PATCH boundary, and a divergence silently 400s valid UI values.
export const followUpStatusSchema = z.enum([
  'flagged',
  'contacted',
  'doctor_connected',
  'treatment_done',
  'treatment_refused',
  'unclear',
])

export const followUpUpdateSchema = z.object({
  status: followUpStatusSchema,
  /** The version the client last observed (optimistic lock). */
  version: z.number().int().nonnegative(),
  assignedToId: z.string().optional(),
  appointmentAt: z.string().optional(),
  notifiedAt: z.string().optional(),
  notificationChannel: z.enum(['sms', 'call', 'in_person']).optional(),
  notes: z.string().optional(),
})
export type FollowUpUpdateInput = z.infer<typeof followUpUpdateSchema>

const boundingBoxSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
})

const findingClassSchema = z.enum(['caries', 'cavity', 'crack'])

export const toothFindingSchema = z.object({
  id: z.string(),
  fdi: z.number().int().refine(
    (n) => { const q = Math.floor(n / 10); const t = n % 10; return (q >= 1 && q <= 4 && t >= 1 && t <= 8) || (q >= 5 && q <= 8 && t >= 1 && t <= 5) },
    { message: 'Invalid FDI tooth code' },
  ).optional(),
  className: findingClassSchema,
  classId: z.number().int(),
  confidence: z.number().min(0).max(1),
  box: boundingBoxSchema,
  longitudinal: z.enum(['new', 'worsened', 'stable', 'resolved']).optional(),
})

export const symptomSetSchema = z.object({
  swelling: z.boolean().optional(),
  painDisturbingSleepOrEating: z.boolean().optional(),
  fever: z.boolean().optional(),
  gumPimpleOrFistula: z.boolean().optional(),
  trauma: z.boolean().optional(),
})

/** Validates the device's screening-create payload (the trust boundary). */
export const screeningCreateSchema = z.object({
  id: z.string(),
  childKey: z.string(),
  classId: z.string(),
  schoolId: z.string(),
  seasonId: z.string(),
  screenedById: z.string(),
  imageRefs: z.array(z.string()),
  findings: z.array(toothFindingSchema),
  symptoms: symptomSetSchema,
  triage: z.object({
    level: z.enum(['green', 'yellow', 'red']),
    score: z.number(),
    confidentWording: z.boolean(),
    reason: z.string().optional(),
  }),
  modelName: z.string(),
  modelVersion: z.string().optional(),
  contentVersionId: z.string(),
  capturedAt: z.string(),
  deviceId: z.string().optional(),
  consentAt: z.string().optional(),
  consentVersion: z.string().optional(),
})
export type ScreeningCreateInput = z.infer<typeof screeningCreateSchema>
