import { Hono } from 'hono'
import { and, eq, inArray, isNull, or } from 'drizzle-orm'
import { screenings, schoolClasses, seasons } from '@pinequest/db/d1'
import { authenticate, authorize } from '../middleware/auth.js'
import { resolveScope, scopeWhere } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const seasonRoutes = new Hono<AppEnv>()

// Distinct seasons (from screenings + classes), scope-filtered, newest first.
seasonRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const scSc = scopeWhere(scope, { classId: screenings.classId, schoolId: screenings.schoolId, childKey: screenings.childKey })
  // SchoolClass matches on its own id for class scope (no classId column).
  const classCond = scope.all
    ? undefined
    : (or(
        scope.classIds.length ? inArray(schoolClasses.id, scope.classIds) : undefined,
        scope.schoolIds.length ? inArray(schoolClasses.schoolId, scope.schoolIds) : undefined,
      ) ?? eq(schoolClasses.id, '__no_scope__'))

  const [fromScreenings, fromClasses] = await Promise.all([
    db.selectDistinct({ seasonId: screenings.seasonId }).from(screenings).where(scSc),
    db.selectDistinct({ seasonId: schoolClasses.seasonId }).from(schoolClasses).where(classCond),
  ])
  const seasonList = [...new Set([...fromScreenings, ...fromClasses].map((r) => r.seasonId))].sort().reverse()
  return c.json({ success: true, data: seasonList })
})

// Admin closes a season for a school — sets Season.closedAt.
// Only seasons in the authoritative Season table can be closed.
seasonRoutes.post('/:schoolId/:seasonId/close', authorize('admin'), async (c) => {
  const db = c.get('db')
  const { schoolId, seasonId } = c.req.param()

  const existing = await db.query.seasons.findFirst({
    where: and(eq(seasons.schoolId, schoolId), eq(seasons.id, seasonId), isNull(seasons.closedAt)),
  })
  if (!existing) return c.json({ success: false, data: null, message: 'season_not_found_or_already_closed' }, 404)

  const [updated] = await db.update(seasons)
    .set({ closedAt: new Date(), closedById: c.get('jwtPayload').sub })
    .where(and(eq(seasons.schoolId, schoolId), eq(seasons.id, seasonId)))
    .returning()
  return c.json({ success: true, data: updated })
})
