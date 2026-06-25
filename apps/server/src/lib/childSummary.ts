import { buildChildSummary } from '@pinequest/core'
import { prisma } from '@pinequest/db'
import type {
  ChildScreeningSummary,
  FindingClass,
  SymptomSet,
  ToothFinding,
  TriageLevel,
} from '@pinequest/types'

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
} | null): SymptomSet => ({
  swelling: q?.swelling ?? false,
  painDisturbingSleepOrEating: q?.painDisturbingSleepOrEating ?? false,
  fever: q?.fever ?? false,
  gumPimpleOrFistula: q?.gumPimpleOrFistula ?? false,
  trauma: q?.trauma ?? false,
})

export const loadChildSummary = async (id: string): Promise<ChildSummaryPayload | null> => {
  const child = await prisma.child.findUnique({ where: { id } })
  if (!child) return null

  const [latest, screeningCount] = await Promise.all([
    prisma.screening.findFirst({
      where: { childKey: child.childKey },
      orderBy: { capturedAt: 'desc' },
      include: { findings: true, questionnaire: true, review: true },
    }),
    prisma.screening.count({ where: { childKey: child.childKey } }),
  ])

  const summary = latest
    ? buildChildSummary({
        screeningId: latest.id,
        seasonId: latest.seasonId,
        capturedAt: latest.capturedAt.toISOString(),
        birthYear: child.birthYear,
        findings: latest.findings.map(toFinding),
        symptoms: toSymptoms(latest.questionnaire),
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
    screeningCount,
  }
}
