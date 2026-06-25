import { prisma } from '@pinequest/db'
import type { SymptomSet, ToothFinding, TriageResult } from '@pinequest/types'

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
  contentVersionId: string
  capturedAt: string
  deviceId?: string
}

export const persistScreening = async (
  body: PersistInput,
  result: TriageResult,
  screenedById: string,
) => {
  const screening = await prisma.screening.upsert({
    where: { id: body.id },
    update: {},
    create: {
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
      contentVersionId: body.contentVersionId,
      capturedAt: new Date(body.capturedAt),
      deviceId: body.deviceId ?? null,
      syncedAt: new Date(),
      findings: {
        create: body.findings.map((f) => ({
          id: f.id,
          fdi: f.fdi ?? null,
          className: f.className,
          classId: f.classId,
          confidence: f.confidence,
          boxX1: f.box.x1,
          boxY1: f.box.y1,
          boxX2: f.box.x2,
          boxY2: f.box.y2,
          longitudinal: f.longitudinal ?? null,
        })),
      },
      images: { create: body.imageRefs.map((ref, order) => ({ ref, order })) },
      questionnaire: { create: { ...body.symptoms } },
    },
    include: { findings: true, images: true, questionnaire: true },
  })

  if (result.level !== 'green') {
    await prisma.followUp.upsert({
      where: { childKey: body.childKey },
      update: {},
      create: { childKey: body.childKey, schoolId: body.schoolId, status: 'flagged', updatedById: screenedById, version: 1 },
    })
  }

  return screening
}
