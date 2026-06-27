import { eq, desc, count, asc } from 'drizzle-orm'
import { buildChildSummary } from '@pinequest/core'
import { children, screenings, screeningImages, type DB } from '@pinequest/db/d1'
import type {
  ChildScreeningSummary,
  FindingClass,
  PainDetail,
  PainOnset,
  SymptomSet,
  ToothFinding,
  TriageLevel,
} from '@pinequest/types'
import { hospitalForChild, type HospitalGuide } from './hospitals.js'

export type QuestionnaireAnswers = {
  swelling: boolean
  painDisturbingSleepOrEating: boolean
  fever: boolean
  gumPimpleOrFistula: boolean
  trauma: boolean
  bleedingGums: boolean | null
  painPresent: boolean
  painCold: boolean
  painHot: boolean
  painBiting: boolean
  painSpontaneous: boolean
  painNight: boolean
  painOnset: PainOnset | null
}

/** Roster-side child fields the board may show (PII stays server-scoped). */
export type ChildSummaryPayload = {
  child: {
    id: string
    firstName: string
    lastName: string
    birthYear: number
    gender: string | null
    guardianPhone: string | null
    guardianEmail: string | null
  }
  summary: ChildScreeningSummary | null
  screeningCount: number
  imageRefs: string[]
  questionnaire: QuestionnaireAnswers | null
  hospital: HospitalGuide | null
}

const toFinding = (f: {
  id: string; fdi: number | null; className: string; classId: number
  confidence: number; boxX1: number; boxY1: number; boxX2: number; boxY2: number
}): ToothFinding => ({
  id: f.id,
  fdi: f.fdi ?? undefined,
  className: f.className as FindingClass,
  classId: f.classId,
  confidence: f.confidence,
  box: { x1: f.boxX1, y1: f.boxY1, x2: f.boxX2, y2: f.boxY2 },
})

const toSymptoms = (q: {
  swelling: boolean | null; painDisturbingSleepOrEating: boolean | null
  fever: boolean | null; gumPimpleOrFistula: boolean | null; trauma: boolean | null
} | null | undefined): SymptomSet => ({
  swelling: q?.swelling ?? false,
  painDisturbingSleepOrEating: q?.painDisturbingSleepOrEating ?? false,
  fever: q?.fever ?? false,
  gumPimpleOrFistula: q?.gumPimpleOrFistula ?? false,
  trauma: q?.trauma ?? false,
})

const toPain = (q: {
  painPresent: boolean | null; painCold: boolean | null; painHot: boolean | null
  painBiting: boolean | null; painSpontaneous: boolean | null; painNight: boolean | null
  painOnset: string | null
} | null | undefined): PainDetail => ({
  present: q?.painPresent ?? false,
  cold: q?.painCold ?? false,
  hot: q?.painHot ?? false,
  biting: q?.painBiting ?? false,
  spontaneous: q?.painSpontaneous ?? false,
  night: q?.painNight ?? false,
  onset: (q?.painOnset as PainOnset | null) ?? null,
})

export const loadChildSummary = async (db: DB, id: string): Promise<ChildSummaryPayload | null> => {
  const child = await db.query.children.findFirst({ where: eq(children.id, id) })
  if (!child) return null

  const [latest, cnt] = await Promise.all([
    db.query.screenings.findFirst({
      where: eq(screenings.childKey, child.childKey),
      orderBy: desc(screenings.capturedAt),
      with: { findings: true, questionnaire: true, review: true, images: { orderBy: asc(screeningImages.order) } },
    }),
    db.select({ c: count() }).from(screenings).where(eq(screenings.childKey, child.childKey)),
  ])

  const summary = latest
    ? buildChildSummary({
        screeningId: latest.id,
        seasonId: latest.seasonId,
        capturedAt: latest.capturedAt.toISOString(),
        birthYear: child.birthYear,
        findings: latest.findings.map(toFinding),
        symptoms: toSymptoms(latest.questionnaire),
        pain: toPain(latest.questionnaire),
        aiLevel: latest.triageLevel as TriageLevel,
        confidentWording: latest.triageConfidentWording,
        reviewedLevel: (latest.review?.confirmedLevel as TriageLevel | undefined) ?? undefined,
      })
    : null

  return {
    child: {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      birthYear: child.birthYear,
      gender: child.gender,
      guardianPhone: child.guardianPhone,
      guardianEmail: child.guardianEmail,
    },
    summary,
    screeningCount: cnt[0]?.c ?? 0,
    imageRefs: latest?.images?.map((i) => i.ref) ?? [],
    questionnaire: latest?.questionnaire
      ? {
          swelling: latest.questionnaire.swelling ?? false,
          painDisturbingSleepOrEating: latest.questionnaire.painDisturbingSleepOrEating ?? false,
          fever: latest.questionnaire.fever ?? false,
          gumPimpleOrFistula: latest.questionnaire.gumPimpleOrFistula ?? false,
          trauma: latest.questionnaire.trauma ?? false,
          bleedingGums: latest.questionnaire.bleedingGums ?? null,
          painPresent: latest.questionnaire.painPresent ?? false,
          painCold: latest.questionnaire.painCold ?? false,
          painHot: latest.questionnaire.painHot ?? false,
          painBiting: latest.questionnaire.painBiting ?? false,
          painSpontaneous: latest.questionnaire.painSpontaneous ?? false,
          painNight: latest.questionnaire.painNight ?? false,
          painOnset: (latest.questionnaire.painOnset as PainOnset | null) ?? null,
        }
      : null,
    hospital: summary ? hospitalForChild(child.schoolId, summary.effectiveLevel) : null,
  }
}
