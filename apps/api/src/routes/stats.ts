import { Hono } from 'hono'
import { prisma } from '@pinequest/db'
import { authenticate } from '../middleware/auth.js'
import { schoolScope } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const statsRoutes = new Hono<AppEnv>()

statsRoutes.get('/', authenticate, async (c) => {
  const { seasonId, schoolId: querySchoolId } = c.req.query()
  const payload = c.get('jwtPayload')
  const scopeSchoolId = schoolScope(payload) ?? (querySchoolId || undefined)

  const where = {
    schoolId: scopeSchoolId || undefined,
    seasonId: seasonId || undefined,
  }

  const [triajeGroups, totalChildren, pendingReview, flagged, resolved] = await Promise.all([
    prisma.screening.groupBy({
      by: ['triageLevel'],
      where,
      _count: { id: true },
    }),
    prisma.child.count({ where: { schoolId: scopeSchoolId || undefined, isActive: true } }),
    prisma.screening.count({
      where: { ...where, review: null },
    }),
    prisma.followUp.count({ where: { schoolId: scopeSchoolId || undefined, status: 'flagged' } }),
    prisma.followUp.count({ where: { schoolId: scopeSchoolId || undefined, status: { not: 'flagged' } } }),
  ])

  const byLevel = Object.fromEntries(triajeGroups.map((g) => [g.triageLevel, g._count.id]))
  const totalScreened = (byLevel.green ?? 0) + (byLevel.yellow ?? 0) + (byLevel.red ?? 0)

  return c.json({
    success: true,
    data: {
      totalScreened,
      triage: { green: byLevel.green ?? 0, yellow: byLevel.yellow ?? 0, red: byLevel.red ?? 0 },
      coverage: { screened: totalScreened, total: totalChildren },
      pendingReview,
      flaggedFollowUps: flagged,
      resolvedFollowUps: resolved,
    },
  })
})
