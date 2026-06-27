import { children, screenings, toothFindings, screeningReviews, screeningImages, questionnaires, followUps, type DB } from '@pinequest/db/d1'
import { inChunks } from './chunk.js'
import { KIDS, SCR, FOLLOWUPS } from './seedDemoData.js'

const SCREENER = 'user-screener', DENTIST = 'user-dentist'
const ago = (days: number) => new Date(Date.now() - days * 86_400_000)
const img = (n: number) => `https://placehold.co/600x450/0ea5e9/ffffff.png?text=Scan+${n}`

export const seedDemo = async (db: DB, adminId: string) => {
  // D1 caps ~100 bound params/query → insert in small chunks.
  await inChunks(KIDS.map((k) => ({
    id: `child-${k.key}`, classId: k.cls, schoolId: k.school, childKey: k.key,
    firstName: k.fn, lastName: k.ln, gender: k.g, birthYear: k.by, rosterSlot: k.slot,
    guardianPhone: k.phone, guardianEmail: k.email,
  })), (b) => db.insert(children).values(b).onConflictDoNothing())

  await inChunks(SCR.map((s) => ({
    id: s.id, childKey: s.key, classId: s.cls, schoolId: s.school, seasonId: s.season, screenedById: SCREENER,
    triageLevel: s.level, triageScore: s.score, triageConfidentWording: s.level !== 'yellow',
    triageReason: s.reason, modelName: 'yolov8', contentVersionId: 'content-v1',
    capturedAt: ago(s.d), syncedAt: ago(s.d),
  })), (b) => db.insert(screenings).values(b).onConflictDoNothing())

  const findings = SCR.flatMap((s) => (s.findings ?? []).map((f, i) => ({
    id: `tf-${s.id}-${i}`, screeningId: s.id, fdi: f.fdi, className: f.cls,
    classId: f.cls === 'caries' ? 0 : f.cls === 'cavity' ? 1 : 2,
    confidence: f.conf, boxX1: 0.18 + i * 0.12, boxY1: 0.22, boxX2: 0.34 + i * 0.12, boxY2: 0.46,
  })))
  await inChunks(findings, (b) => db.insert(toothFindings).values(b).onConflictDoNothing())

  const qs = SCR.filter((s) => s.q).map((s) => ({
    screeningId: s.id, swelling: s.q!.swelling ?? false, fever: s.q!.fever ?? false,
    gumPimpleOrFistula: s.q!.gum ?? false, trauma: s.q!.trauma ?? false,
    painDisturbingSleepOrEating: s.q!.night ?? false, painPresent: s.q!.painPresent ?? false,
    painCold: s.q!.cold ?? false, painHot: s.q!.hot ?? false, painBiting: s.q!.biting ?? false,
    painSpontaneous: s.q!.spontaneous ?? false, painNight: s.q!.night ?? false, painOnset: s.q!.onset ?? null,
  }))
  await inChunks(qs, (b) => db.insert(questionnaires).values(b).onConflictDoNothing())

  const images = SCR.flatMap((s) => Array.from({ length: s.imgs ?? 0 }, (_, n) => ({
    screeningId: s.id, ref: img(n + 1), order: n,
  })))
  await inChunks(images, (b) => db.insert(screeningImages).values(b).onConflictDoNothing())

  const reviews = SCR.filter((s) => s.reviewed).map((s) => ({
    id: `rev-${s.id}`, screeningId: s.id, reviewedById: DENTIST,
    confirmedLevel: s.confirmed ?? s.level,
    note: s.confirmed && s.confirmed !== s.level ? 'Эмчийн дүгнэлтээр түвшин өөрчлөгдсөн.' : null,
  }))
  await inChunks(reviews, (b) => db.insert(screeningReviews).values(b).onConflictDoNothing())

  await inChunks(FOLLOWUPS.map((f) => ({
    childKey: f.key, schoolId: f.school, status: f.status, updatedById: SCREENER, version: 1,
    appointmentAt: typeof f.appt === 'number' ? ago(f.appt) : null,
  })), (b) => db.insert(followUps).values(b).onConflictDoNothing())

  return { adminId }
}
