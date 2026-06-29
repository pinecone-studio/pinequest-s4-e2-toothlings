import { children, screenings, toothFindings, screeningReviews, followUpEpisodes, type DB } from '@pinequest/db/d1'
import { inChunks } from './chunk.js'

const SCHOOL = 'school-demo', CLS = 'class-demo', SCREENER = 'user-screener'
const FALL = '2025-fall', SPRING = '2026-spring'
const ago = (days: number) => new Date(Date.now() - days * 86_400_000)

// 3 children per current triage status (red / yellow / green) — kept lean on purpose.
const KIDS = [
  { slot: 1, key: 'ck-001', fn: 'Болд',     ln: 'Бат' },
  { slot: 2, key: 'ck-002', fn: 'Сараа',    ln: 'Дорж' },
  { slot: 3, key: 'ck-003', fn: 'Тэмүүлэн', ln: 'Ган' },
  { slot: 4, key: 'ck-004', fn: 'Нараа',    ln: 'Сүх' },
  { slot: 5, key: 'ck-005', fn: 'Болор',    ln: 'Цог' },
  { slot: 6, key: 'ck-006', fn: 'Анар',     ln: 'Бямба' },
  { slot: 7, key: 'ck-007', fn: 'Тэнгис',   ln: 'Лхагва' },
  { slot: 8, key: 'ck-008', fn: 'Уужин',    ln: 'Энх' },
  { slot: 9, key: 'ck-009', fn: 'Билгүүн',  ln: 'Очир' },
]

// Current season — exactly 3 red, 3 yellow, 3 green. `d` spread feeds the area chart.
const SPRING_SCR = [
  { id: 'scr-1', key: 'ck-001', season: SPRING, level: 'red',    score: 0.91, reason: 'Цооролтой 3 байнгын шүд байна.', d: 2,  fdi: 36, conf: 0.86, reviewed: false },
  { id: 'scr-2', key: 'ck-002', season: SPRING, level: 'red',    score: 0.88, reason: 'Цооролтой 1 шүд байна',             d: 5,  fdi: 46, conf: 0.80, reviewed: false },
  { id: 'scr-3', key: 'ck-003', season: SPRING, level: 'red',    score: 0.84, reason: 'Гүн цоорол',              d: 12, fdi: 26, conf: 0.78, reviewed: true  },
  { id: 'scr-4', key: 'ck-004', season: SPRING, level: 'yellow', score: 0.55, reason: 'Харьцангуй эрүүл',         d: 4,  fdi: 26, conf: 0.54, reviewed: false },
  { id: 'scr-5', key: 'ck-005', season: SPRING, level: 'yellow', score: 0.48, reason: 'Цооролтой 3 шүд байна',     d: 18, fdi: 75, conf: 0.61, reviewed: true  },
  { id: 'scr-6', key: 'ck-006', season: SPRING, level: 'yellow', score: 0.50, reason: 'Цоорлын том хөндийтэй 2 шүд байна',     d: 26, fdi: 16, conf: 0.52, reviewed: true  },
  { id: 'scr-7', key: 'ck-007', season: SPRING, level: 'green',  score: 0.08, reason: null,                       d: 9,  fdi: 0,  conf: 0,    reviewed: true  },
  { id: 'scr-8', key: 'ck-008', season: SPRING, level: 'green',  score: 0.06, reason: null,                       d: 33, fdi: 0,  conf: 0,    reviewed: true  },
  { id: 'scr-9', key: 'ck-009', season: SPRING, level: 'green',  score: 0.05, reason: null,                       d: 41, fdi: 0,  conf: 0,    reviewed: true  },
]

// 2025-fall: prior season → gives every child a 2-season trend (worsened / improved / stable).
// red now:    ck-001 green→red, ck-002 yellow→red, ck-003 red→red (chronic)
// yellow now: ck-004 green→yellow, ck-005 red→yellow (improved), ck-006 yellow→yellow (chronic)
// green now:  ck-007 yellow→green, ck-008 red→green (treated), ck-009 green→green (stable)
const FALL_SCR = [
  { id: 'scr-f1', key: 'ck-001', season: FALL, level: 'green',  score: 0.06, reason: null,                   d: 250, fdi: 0,  conf: 0,    reviewed: true },
  { id: 'scr-f2', key: 'ck-002', season: FALL, level: 'yellow', score: 0.50, reason: 'Цагаан толбо',          d: 249, fdi: 26, conf: 0.55, reviewed: true },
  { id: 'scr-f3', key: 'ck-003', season: FALL, level: 'red',    score: 0.80, reason: 'Цоорсон',       d: 248, fdi: 36, conf: 0.80, reviewed: true },
  { id: 'scr-f4', key: 'ck-004', season: FALL, level: 'green',  score: 0.09, reason: null,                   d: 246, fdi: 0,  conf: 0,    reviewed: true },
  { id: 'scr-f5', key: 'ck-005', season: FALL, level: 'red',    score: 0.82, reason: 'Цоорсон',       d: 244, fdi: 46, conf: 0.82, reviewed: true },
  { id: 'scr-f6', key: 'ck-006', season: FALL, level: 'yellow', score: 0.46, reason: 'Цоорсон',     d: 242, fdi: 75, conf: 0.60, reviewed: true },
  { id: 'scr-f7', key: 'ck-007', season: FALL, level: 'yellow', score: 0.52, reason: 'Цагаан толбо',  d: 240, fdi: 16, conf: 0.52, reviewed: true },
  { id: 'scr-f8', key: 'ck-008', season: FALL, level: 'red',    score: 0.84, reason: 'Цоорсон',       d: 238, fdi: 46, conf: 0.84, reviewed: true },
  { id: 'scr-f9', key: 'ck-009', season: FALL, level: 'green',  score: 0.04, reason: null,                   d: 236, fdi: 0,  conf: 0,    reviewed: true },
]

const ALL_SCR = [...SPRING_SCR, ...FALL_SCR]

// Prior-season episodes (closed) — only for children continuing into an open episode.
const PRIOR_EPISODES = [
  { id: 'ep-ck003-fall25', childKey: 'ck-003', season: FALL, scrId: 'scr-f3', level: 'red',    score: 0.80, status: 'treatment_done', escalation: false, closedAt: ago(185) },
  { id: 'ep-ck005-fall25', childKey: 'ck-005', season: FALL, scrId: 'scr-f5', level: 'red',    score: 0.82, status: 'treatment_done', escalation: false, closedAt: ago(180) },
  { id: 'ep-ck006-fall25', childKey: 'ck-006', season: FALL, scrId: 'scr-f6', level: 'yellow', score: 0.46, status: 'treatment_done', escalation: false, closedAt: ago(178) },
]

// Open episodes for current spring (the Kanban board) — 2 per column: Шинэ / Хяналтад / Шийдвэрлэсэн.
const OPEN_EPISODES = [
  { id: 'ep-ck001-sp26', childKey: 'ck-001', season: SPRING, scrId: 'scr-1', level: 'red',    score: 0.91, status: 'flagged',        escalation: true,  prevId: null },
  { id: 'ep-ck004-sp26', childKey: 'ck-004', season: SPRING, scrId: 'scr-4', level: 'yellow', score: 0.55, status: 'flagged',        escalation: false, prevId: null },
  { id: 'ep-ck002-sp26', childKey: 'ck-002', season: SPRING, scrId: 'scr-2', level: 'red',    score: 0.88, status: 'contacted',      escalation: false, prevId: null },
  { id: 'ep-ck005-sp26', childKey: 'ck-005', season: SPRING, scrId: 'scr-5', level: 'yellow', score: 0.48, status: 'contacted',      escalation: false, prevId: 'ep-ck005-fall25' },
  { id: 'ep-ck003-sp26', childKey: 'ck-003', season: SPRING, scrId: 'scr-3', level: 'red',    score: 0.84, status: 'treatment_done', escalation: false, prevId: 'ep-ck003-fall25' },
  { id: 'ep-ck006-sp26', childKey: 'ck-006', season: SPRING, scrId: 'scr-6', level: 'yellow', score: 0.50, status: 'treatment_done', escalation: false, prevId: 'ep-ck006-fall25' },
]

export const seedDemo = async (db: DB, adminId: string) => {
  await inChunks(KIDS.map((k) => ({
    id: `child-${k.slot}`, classId: CLS, schoolId: SCHOOL, childKey: k.key,
    firstName: k.fn, lastName: k.ln, birthYear: 2016, rosterSlot: k.slot, guardianPhone: '99001122',
  })), (b) => db.insert(children).values(b).onConflictDoNothing())

  await inChunks(ALL_SCR.map((s) => ({
    id: s.id, childKey: s.key, classId: CLS, schoolId: SCHOOL, seasonId: s.season, screenedById: SCREENER,
    triageLevel: s.level, triageScore: s.score, triageConfidentWording: s.level !== 'yellow',
    triageReason: s.reason, modelName: 'yolov8',
    capturedAt: ago(s.d), syncedAt: ago(s.d),
  })), (b) => db.insert(screenings).values(b).onConflictDoNothing())

  const findings = ALL_SCR.filter((s) => s.fdi > 0).map((s) => ({
    id: `tf-${s.id}`, screeningId: s.id, fdi: s.fdi, className: 'caries', classId: 1,
    confidence: s.conf, boxX1: 0.2, boxY1: 0.2, boxX2: 0.4, boxY2: 0.4,
  }))
  await inChunks(findings, (b) => db.insert(toothFindings).values(b).onConflictDoNothing())

  const reviews = ALL_SCR.filter((s) => s.reviewed).map((s) => ({
    id: `rev-${s.id}`, screeningId: s.id, reviewedById: adminId, confirmedLevel: s.level,
  }))
  await inChunks(reviews, (b) => db.insert(screeningReviews).values(b).onConflictDoNothing())

  await inChunks(PRIOR_EPISODES.map((e) => ({
    id: e.id, childKey: e.childKey, schoolId: SCHOOL,
    triggerSeasonId: e.season, triggerScreeningId: e.scrId,
    triggerLevel: e.level, triggerScore: e.score,
    status: e.status, escalationFlag: e.escalation,
    closedAt: e.closedAt, closedReason: 'season_closed',
    updatedById: SCREENER,
  })), (b) => db.insert(followUpEpisodes).values(b).onConflictDoNothing())

  await inChunks(OPEN_EPISODES.map((e) => ({
    id: e.id, childKey: e.childKey, schoolId: SCHOOL,
    triggerSeasonId: e.season, triggerScreeningId: e.scrId,
    triggerLevel: e.level, triggerScore: e.score,
    status: e.status, escalationFlag: e.escalation,
    previousEpisodeId: e.prevId,
    updatedById: SCREENER,
  })), (b) => db.insert(followUpEpisodes).values(b).onConflictDoNothing())
}
