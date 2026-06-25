import { Hono } from 'hono'
import { screeningCreateSchema, triage } from '@pinequest/core'
import { prisma } from '@pinequest/db'
import { authenticate, authorize } from '../middleware/auth.js'
import { writeAudit } from '../lib/audit.js'
import { persistScreening } from '../lib/persistScreening.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const screeningRoutes = new Hono<AppEnv>()

screeningRoutes.post('/', authenticate, async (c) => {
  const body = screeningCreateSchema.parse(await c.req.json())
  const result = triage(body.findings, body.symptoms)
  const screening = await persistScreening(body, result, c.get('jwtPayload').sub)
  return c.json({ success: true, data: screening }, 201)
})

screeningRoutes.get('/', authenticate, async (c) => {
  const { childKey, classId, schoolId, seasonId, screenedById } = c.req.query()
  const scope = schoolScope(c.get('jwtPayload'))
  const screenings = await prisma.screening.findMany({
    where: {
      childKey: childKey || undefined,
      classId: classId || undefined,
      schoolId: scope ?? (schoolId || undefined),
      seasonId: seasonId || undefined,
      screenedById: screenedById || undefined,
    },
    orderBy: { capturedAt: 'desc' },
    include: { findings: true },
  })
  return c.json({ success: true, data: screenings })
})

screeningRoutes.get('/:id', authenticate, async (c) => {
  const screening = await prisma.screening.findUnique({
    where: { id: c.req.param('id') },
    include: { findings: true, images: true, questionnaire: true, review: true },
  })
  if (!screening) return c.json({ success: false, data: null }, 404)
  return c.json({ success: true, data: screening })
})

screeningRoutes.put('/:id/review', authorize('dentist', 'admin'), async (c) => {
  const { confirmedLevel, note } = await c.req.json<{ confirmedLevel: string; note?: string }>()
  if (!['green', 'yellow', 'red'].includes(confirmedLevel)) {
    return c.json({ success: false, data: null, message: 'invalid_level' }, 400)
  }
  const id = c.req.param('id')
  const screening = await prisma.screening.findUnique({ where: { id } })
  if (!screening) return c.json({ success: false, data: null }, 404)

  const existing = await prisma.screeningReview.findUnique({ where: { screeningId: id } })
  const review = await prisma.screeningReview.upsert({
    where: { screeningId: id },
    update: { confirmedLevel, note: note ?? null, reviewedById: c.get('jwtPayload').sub },
    create: { screeningId: id, confirmedLevel, note: note ?? null, reviewedById: c.get('jwtPayload').sub },
  })
  await writeAudit(c.get('jwtPayload').sub, 'ScreeningReview', review.id, existing ? 'override_update' : 'review', existing, review)
  return c.json({ success: true, data: review })
})
