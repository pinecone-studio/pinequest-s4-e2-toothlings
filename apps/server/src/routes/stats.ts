import { Hono } from 'hono'
import { and, count, eq, inArray, ne } from 'drizzle-orm'
import { screenings, children, followUps, screeningReviews } from '@pinequest/db/d1'
import { authenticate } from '../middleware/auth.js'
import { resolveScope, scopeWhere } from '../lib/scopeFilter.js'
import type { AppEnv } from '../types.js'

export const statsRoutes = new Hono<AppEnv>()

// --- Screened-vs-Flagged time-series (bucketed in TS, DB-agnostic) ---------
type Range = 'D' | 'W' | 'M' | 'Y'
const SLOTS: Record<Range, number> = { D: 14, W: 8, M: 6, Y: 5 }

const bucketStart = (date: Date, r: Range): Date => {
  const x = new Date(date)
  x.setHours(0, 0, 0, 0)
  if (r === 'W') x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  else if (r === 'M') x.setDate(1)
  else if (r === 'Y') x.setMonth(0, 1)
  return x
}
const stepBack = (date: Date, r: Range, k: number): Date => {
  const x = new Date(date)
  if (r === 'D') x.setDate(x.getDate() - k)
  else if (r === 'W') x.setDate(x.getDate() - 7 * k)
  else if (r === 'M') x.setMonth(x.getMonth() - k)
  else x.setFullYear(x.getFullYear() - k)
  return x
}
const bucketize = (rows: { capturedAt: Date; triageLevel: string }[], r: Range) => {
  const n = SLOTS[r]
  const now = bucketStart(new Date(), r)
  const slots = Array.from({ length: n }, (_, i) => bucketStart(stepBack(now, r, n - 1 - i), r))
  const idx = new Map(slots.map((s, i) => [s.getTime(), i]))
  const buckets = slots.map((s) => ({ ts: s.toISOString(), screened: 0, flagged: 0 }))
  for (const row of rows) {
    const i = idx.get(bucketStart(new Date(row.capturedAt), r).getTime())
    if (i === undefined) continue
    buckets[i].screened += 1
    if (row.triageLevel === 'yellow' || row.triageLevel === 'red') buckets[i].flagged += 1
  }
  return buckets
}

// 12 fixed calendar-month buckets (Jan–Dec) for a given year — used by the
// season-scoped "Үзүүлэлт" chart. Y = kids screened per month.
const calendarBuckets = (rows: { capturedAt: Date; triageLevel: string }[], year: number) => {
  const buckets = Array.from({ length: 12 }, (_, m) => ({ ts: new Date(Date.UTC(year, m, 1)).toISOString(), screened: 0, flagged: 0 }))
  for (const row of rows) {
    const m = new Date(row.capturedAt).getUTCMonth()
    buckets[m].screened += 1
    if (row.triageLevel === 'yellow' || row.triageLevel === 'red') buckets[m].flagged += 1
  }
  return buckets
}

statsRoutes.get('/timeseries', authenticate, async (c) => {
  const db = c.get('db')
  const { range, seasonId, schoolId: querySchoolId } = c.req.query()
  const scSc = scopeWhere(await resolveScope(db, c.get('jwtPayload')), { classId: screenings.classId, schoolId: screenings.schoolId, childKey: screenings.childKey })
  const rows = await db.select({ capturedAt: screenings.capturedAt, triageLevel: screenings.triageLevel }).from(screenings)
    .where(and(scSc, seasonId ? eq(screenings.seasonId, seasonId) : undefined, querySchoolId ? eq(screenings.schoolId, querySchoolId) : undefined))
  // CAL = 12 calendar months of the season's year (X axis), kids/month (Y axis).
  if (range === 'CAL') {
    const year = seasonId && /^\d{4}/.test(seasonId) ? parseInt(seasonId.slice(0, 4), 10) : new Date().getUTCFullYear()
    return c.json({ success: true, data: { range: 'CAL', buckets: calendarBuckets(rows, year) } })
  }
  const r: Range = (['D', 'W', 'M', 'Y'] as const).includes(range as Range) ? (range as Range) : 'M'
  return c.json({ success: true, data: { range: r, buckets: bucketize(rows, r) } })
})

// A child is the unit of coverage (identity = child_key × season). One child may
// produce several screening EVENTS in a season (upper + lower photos, re-captures,
// corrections), so we MUST aggregate by childKey — counting raw screening rows would
// report a single child as 2+. Per child we keep the worst triage severity seen
// (red > yellow > green): never under-report a danger signal.
const SEVERITY: Record<string, number> = { green: 1, yellow: 2, red: 3 }
const worse = (a: string, b: string) => ((SEVERITY[b] ?? 0) > (SEVERITY[a] ?? 0) ? b : a)

statsRoutes.get('/', authenticate, async (c) => {
  const db = c.get('db')
  const { seasonId, schoolId: querySchoolId } = c.req.query()
  const scope = await resolveScope(db, c.get('jwtPayload'))
  const scSc = scopeWhere(scope, { classId: screenings.classId, schoolId: screenings.schoolId, childKey: screenings.childKey })
  const chSc = scopeWhere(scope, { classId: children.classId, schoolId: children.schoolId, childKey: children.childKey })
  const seasonCond = seasonId ? eq(screenings.seasonId, seasonId) : undefined
  const querySchool = querySchoolId ? eq(screenings.schoolId, querySchoolId) : undefined
  const fuSchool = scope.all
    ? (querySchoolId ? eq(followUps.schoolId, querySchoolId) : undefined)
    : inArray(followUps.schoolId, scope.schoolIds.length ? scope.schoolIds : ['__no_scope__'])

  const [eventRows, childRow, flaggedRow, resolvedRow] = await Promise.all([
    // One row per screening event, with whether that event was dentist-reviewed.
    db.select({ childKey: screenings.childKey, triageLevel: screenings.triageLevel, reviewId: screeningReviews.id })
      .from(screenings).leftJoin(screeningReviews, eq(screeningReviews.screeningId, screenings.id))
      .where(and(scSc, seasonCond, querySchool)),
    db.select({ c: count() }).from(children).where(and(chSc, eq(children.isActive, true), querySchoolId ? eq(children.schoolId, querySchoolId) : undefined)),
    db.select({ c: count() }).from(followUps).where(and(fuSchool, eq(followUps.status, 'flagged'))),
    db.select({ c: count() }).from(followUps).where(and(fuSchool, ne(followUps.status, 'flagged'))),
  ])

  // Collapse events → children. perChild.level = worst seen; reviewed = any event reviewed.
  const perChild = new Map<string, { level: string; reviewed: boolean }>()
  for (const r of eventRows) {
    const prev = perChild.get(r.childKey)
    if (prev) {
      prev.level = worse(prev.level, r.triageLevel)
      prev.reviewed = prev.reviewed || r.reviewId != null
    } else {
      perChild.set(r.childKey, { level: r.triageLevel, reviewed: r.reviewId != null })
    }
  }

  const triage = { green: 0, yellow: 0, red: 0 }
  // "Эмчийн хяналт хүлээж буй" = children with a danger signal (red/yellow) that
  // a dentist has NOT yet confirmed. Green (no danger seen) children are not
  // surfaced as awaiting review — only those that actually need a human look.
  let pendingReview = 0
  for (const v of perChild.values()) {
    if (v.level in triage) triage[v.level as keyof typeof triage] += 1
    if (!v.reviewed && (v.level === 'red' || v.level === 'yellow')) pendingReview += 1
  }
  const totalScreened = perChild.size
  return c.json({
    success: true,
    data: {
      totalScreened,
      triage,
      coverage: { screened: totalScreened, total: childRow[0]?.c ?? 0 },
      pendingReview,
      flaggedFollowUps: flaggedRow[0]?.c ?? 0,
      resolvedFollowUps: resolvedRow[0]?.c ?? 0,
    },
  })
})
