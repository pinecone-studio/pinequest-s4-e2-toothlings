import { Hono } from 'hono'
import { prisma } from '@pinequest/db'
import { authenticate } from '../middleware/auth.js'
import { resolveScope, scopeOr } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const seasonRoutes = new Hono<AppEnv>()

// Distinct seasons that actually exist (from screenings + classes), scope-filtered.
// Newest first. No Season model — derived from the immutable event log + roster.
seasonRoutes.get('/', authenticate, async (c) => {
  const scope = await resolveScope(c.get('jwtPayload'))
  const or = scopeOr(scope)
  // SchoolClass matches on its own id (class scope), not a classId column.
  const classOr = scope.all ? undefined : [
    ...(scope.classIds.length ? [{ id: { in: scope.classIds } }] : []),
    ...(scope.schoolIds.length ? [{ schoolId: { in: scope.schoolIds } }] : []),
    ...(!scope.classIds.length && !scope.schoolIds.length ? [{ id: '__no_scope__' }] : []),
  ]
  const [fromScreenings, fromClasses] = await Promise.all([
    prisma.screening.findMany({ where: or ? { OR: or } : {}, select: { seasonId: true }, distinct: ['seasonId'] }),
    prisma.schoolClass.findMany({ where: classOr ? { OR: classOr } : {}, select: { seasonId: true }, distinct: ['seasonId'] }),
  ])
  const seasons = [...new Set([...fromScreenings, ...fromClasses].map((r) => r.seasonId))]
    .sort()
    .reverse()
  return c.json({ success: true, data: seasons })
})
