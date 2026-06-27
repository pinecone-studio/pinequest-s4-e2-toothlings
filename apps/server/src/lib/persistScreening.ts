import { and, desc, eq, isNotNull, isNull, lt } from 'drizzle-orm'
import {
  screenings, toothFindings, screeningImages, questionnaires,
  followUpEpisodes, followUpEvents, followUps, type DB,
} from '@pinequest/db/d1'
import type { FindingClass, SymptomSet, ToothFinding, TriageLevel, TriageResult } from '@pinequest/types'
import { computeToothLongitudinal } from '@pinequest/core'

export type PersistInput = {
  id: string
  childKey: string
  classId: string
  schoolId: string
  seasonId: string
  imageRefs: string[]
  findings: ToothFinding[]
  symptoms: SymptomSet
  modelName: string
  modelVersion?: string
  capturedAt: string
  deviceId?: string
}

const LEVEL_RANK: Record<TriageLevel, number> = { green: 0, yellow: 1, red: 2 }

const withChildren = { with: { findings: true, images: true, questionnaire: true } } as const

type Episode = typeof followUpEpisodes.$inferSelect

const emitEvent = (
  db: DB, ep: Episode, from: string | null, to: string, actorId: string, note?: string | null,
) =>
  db.insert(followUpEvents).values({
    episodeId: ep.id, childKey: ep.childKey, seasonId: ep.triggerSeasonId,
    fromStatus: from, toStatus: to,
    actorId, actorRole: 'system', note: note ?? null,
  })

const closeEp = async (db: DB, ep: Episode, reason: string) => {
  const [closed] = await db.update(followUpEpisodes)
    .set({ closedAt: new Date(), closedReason: reason, status: reason, updatedById: 'system', version: ep.version + 1 })
    .where(eq(followUpEpisodes.id, ep.id)).returning()
  await emitEvent(db, ep, ep.status, reason, 'system')
  return closed
}

export const persistScreening = async (
  db: DB,
  body: PersistInput,
  result: TriageResult,
  screenedById: string,
) => {
  // Idempotent on the client-generated UUID — a re-synced capture is a no-op.
  const existing = await db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
  if (existing) return existing

  const capturedAtDate = new Date(body.capturedAt)

  // Server-side longitudinal: compare against prior season's findings for this child.
  const priorRows = await db
    .select({ fdi: toothFindings.fdi, className: toothFindings.className })
    .from(toothFindings)
    .innerJoin(screenings, eq(screenings.id, toothFindings.screeningId))
    .where(and(eq(screenings.childKey, body.childKey), lt(screenings.capturedAt, capturedAtDate)))
    .orderBy(desc(screenings.capturedAt))
    .limit(100)
  const priorFindings = priorRows.map((r) => ({
    fdi: r.fdi ?? undefined,
    className: r.className as FindingClass,
  }))

  // Immutable screening event.
  await db.insert(screenings).values({
    id: body.id,
    childKey: body.childKey,
    classId: body.classId,
    schoolId: body.schoolId,
    seasonId: body.seasonId,
    screenedById,
    triageLevel: result.level,
    triageScore: result.score,
    triageConfidentWording: result.confidentWording,
    triageReason: result.reason ?? null,
    modelName: body.modelName,
    modelVersion: body.modelVersion ?? null,
    capturedAt: capturedAtDate,
    deviceId: body.deviceId ?? null,
    syncedAt: new Date(),
  })

  if (body.findings.length) {
    await db.insert(toothFindings).values(body.findings.map((f) => ({
      id: f.id,
      screeningId: body.id,
      fdi: f.fdi ?? null,
      className: f.className,
      classId: f.classId,
      confidence: f.confidence,
      boxX1: f.box.x1, boxY1: f.box.y1, boxX2: f.box.x2, boxY2: f.box.y2,
      longitudinal: computeToothLongitudinal(
        { fdi: f.fdi, className: f.className }, priorFindings,
      ),
    })))
  }
  if (body.imageRefs.length) {
    await db.insert(screeningImages).values(body.imageRefs.map((ref, order) => ({ screeningId: body.id, ref, order })))
  }
  await db.insert(questionnaires).values({
    screeningId: body.id,
    swelling: body.symptoms.swelling ?? null,
    painDisturbingSleepOrEating: body.symptoms.painDisturbingSleepOrEating ?? null,
    fever: body.symptoms.fever ?? null,
    gumPimpleOrFistula: body.symptoms.gumPimpleOrFistula ?? null,
    trauma: body.symptoms.trauma ?? null,
  })

  // Episode lifecycle.
  const openEp = await db.query.followUpEpisodes.findFirst({
    where: and(eq(followUpEpisodes.childKey, body.childKey), isNull(followUpEpisodes.closedAt)),
  })

  if (result.level === 'green') {
    if (openEp) await closeEp(db, openEp, 'season_cleared')
  } else {
    const isSameSeason = openEp?.triggerSeasonId === body.seasonId

    if (isSameSeason && openEp) {
      if (LEVEL_RANK[result.level] <= LEVEL_RANK[openEp.triggerLevel as TriageLevel]) {
        // Idempotent re-screen — lower or equal severity in same season, no-op.
        return db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
      }
      await closeEp(db, openEp, 'superseded')
    } else if (!isSameSeason && openEp) {
      await closeEp(db, openEp, 'superseded')
    }

    // Escalation: any prior episode closed as treatment_refused with a worse score.
    const prevRefused = await db.query.followUpEpisodes.findFirst({
      where: and(
        eq(followUpEpisodes.childKey, body.childKey),
        isNotNull(followUpEpisodes.closedAt),
        eq(followUpEpisodes.closedReason, 'treatment_refused'),
      ),
      orderBy: [desc(followUpEpisodes.updatedAt)],
    })
    const escalation = !!prevRefused && result.score > prevRefused.triggerScore

    const [newEp] = await db.insert(followUpEpisodes).values({
      childKey: body.childKey,
      schoolId: body.schoolId,
      triggerSeasonId: body.seasonId,
      triggerScreeningId: body.id,
      triggerLevel: result.level,
      triggerScore: result.score,
      status: 'flagged',
      escalationFlag: escalation,
      previousEpisodeId: openEp?.id ?? null,
      updatedById: 'system',
    }).returning()

    await emitEvent(db, newEp, null, 'flagged', 'system', escalation ? 'escalated_after_refusal' : null)

    // Legacy write for backward compat while Phase C rolls out.
    await db.insert(followUps).values({
      childKey: body.childKey,
      schoolId: body.schoolId,
      status: 'flagged',
      updatedById: screenedById,
      version: 1,
    }).onConflictDoNothing()
  }

  return db.query.screenings.findFirst({ where: eq(screenings.id, body.id), ...withChildren })
}
