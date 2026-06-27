// Static demo dataset (no DB imports). Insertion logic lives in seedDemo.ts.
// Two schools, two seasons → cohort + longitudinal + every follow-up state.

export type Kid = {
  slot: number; key: string; fn: string; ln: string; g: 'male' | 'female'
  email: string; phone: string; school: string; cls: string; by: number
}
export type Finding = { fdi: number; cls: 'caries' | 'cavity' | 'crack'; conf: number }
export type Q = {
  painPresent?: boolean; cold?: boolean; hot?: boolean; biting?: boolean
  spontaneous?: boolean; night?: boolean; onset?: 'yesterday' | '2_3_days' | '5_plus_days'
  swelling?: boolean; fever?: boolean; gum?: boolean; trauma?: boolean
}
export type Scr = {
  id: string; key: string; level: 'green' | 'yellow' | 'red'; score: number
  reason: string | null; d: number; season: string; cls: string; school: string
  reviewed: boolean; confirmed?: 'green' | 'yellow' | 'red'
  findings?: Finding[]; q?: Q; imgs?: number
}
export type Fu = { key: string; school: string; status: string; appt?: number }

const S1 = 'school-demo', S2 = 'school-kharkhorin'
const C1 = 'class-demo', C1F = 'class-demo-fall', C2 = 'class-khr'
const SPR = '2026-spring', FALL = '2025-fall'

export const KIDS: Kid[] = [
  { slot: 1, key: 'ck-001', fn: 'Болд', ln: 'Бат', g: 'male', email: 'bat.family@gmail.com', phone: '99001122', school: S1, cls: C1, by: 2016 },
  { slot: 2, key: 'ck-002', fn: 'Сараа', ln: 'Дорж', g: 'female', email: 'dorj.family@gmail.com', phone: '99112233', school: S1, cls: C1, by: 2016 },
  { slot: 3, key: 'ck-003', fn: 'Тэмүүлэн', ln: 'Ган', g: 'male', email: 'gan.family@gmail.com', phone: '88223344', school: S1, cls: C1, by: 2016 },
  { slot: 4, key: 'ck-004', fn: 'Нараа', ln: 'Сүх', g: 'female', email: 'sukh.family@gmail.com', phone: '88334455', school: S1, cls: C1, by: 2017 },
  { slot: 5, key: 'ck-005', fn: 'Болор', ln: 'Цог', g: 'female', email: 'tsog.family@gmail.com', phone: '99445566', school: S1, cls: C1, by: 2016 },
  { slot: 6, key: 'ck-006', fn: 'Анар', ln: 'Бямба', g: 'male', email: 'byamba.family@gmail.com', phone: '77556677', school: S1, cls: C1, by: 2017 },
  { slot: 1, key: 'ck-101', fn: 'Мөнх', ln: 'Пүрэв', g: 'male', email: 'purev.family@gmail.com', phone: '95110022', school: S2, cls: C2, by: 2017 },
  { slot: 2, key: 'ck-102', fn: 'Номин', ln: 'Лхагва', g: 'female', email: 'lhagva.family@gmail.com', phone: '95220033', school: S2, cls: C2, by: 2017 },
  { slot: 3, key: 'ck-103', fn: 'Очир', ln: 'Нямдорж', g: 'male', email: 'nyamdorj.family@gmail.com', phone: '94330044', school: S2, cls: C2, by: 2017 },
  { slot: 4, key: 'ck-104', fn: 'Цэцэг', ln: 'Отгон', g: 'female', email: 'otgon.family@gmail.com', phone: '94440055', school: S2, cls: C2, by: 2018 },
  { slot: 5, key: 'ck-105', fn: 'Батбаяр', ln: 'Дамдин', g: 'male', email: 'damdin.family@gmail.com', phone: '91550066', school: S2, cls: C2, by: 2017 },
  { slot: 6, key: 'ck-106', fn: 'Дэлгэрмаа', ln: 'Чулуун', g: 'female', email: 'chuluun.family@gmail.com', phone: '91660077', school: S2, cls: C2, by: 2018 },
]

export const SCR: Scr[] = [
  { id: 'scr-1', key: 'ck-001', level: 'red', score: 0.92, reason: 'Олон цэгт цоорлын сэжиг', d: 2, season: SPR, cls: C1, school: S1, reviewed: true, confirmed: 'red', imgs: 2, findings: [{ fdi: 36, cls: 'caries', conf: 0.86 }, { fdi: 46, cls: 'cavity', conf: 0.81 }, { fdi: 16, cls: 'caries', conf: 0.62 }], q: { painPresent: true, cold: true, biting: true, onset: '2_3_days' } },
  { id: 'scr-2', key: 'ck-002', level: 'yellow', score: 0.55, reason: 'Өнгө өөрчлөгдсөн', d: 4, season: SPR, cls: C1, school: S1, reviewed: false, imgs: 1, findings: [{ fdi: 26, cls: 'caries', conf: 0.54 }], q: { painPresent: true, cold: true, onset: '5_plus_days' } },
  { id: 'scr-3', key: 'ck-003', level: 'red', score: 0.90, reason: 'Буйлны хаван + цоорол', d: 5, season: SPR, cls: C1, school: S1, reviewed: true, confirmed: 'red', imgs: 2, findings: [{ fdi: 85, cls: 'cavity', conf: 0.88 }, { fdi: 75, cls: 'caries', conf: 0.70 }], q: { painPresent: true, spontaneous: true, night: true, onset: '5_plus_days', swelling: true, fever: true } },
  { id: 'scr-4', key: 'ck-004', level: 'yellow', score: 0.48, reason: 'Бага зэргийн толбо', d: 8, season: SPR, cls: C1, school: S1, reviewed: true, confirmed: 'yellow', imgs: 1, findings: [{ fdi: 55, cls: 'caries', conf: 0.49 }], q: { painPresent: false } },
  { id: 'scr-5', key: 'ck-005', level: 'green', score: 0.06, reason: null, d: 12, season: SPR, cls: C1, school: S1, reviewed: true, imgs: 1, q: { painPresent: false } },
  { id: 'scr-6', key: 'ck-006', level: 'green', score: 0.05, reason: null, d: 20, season: SPR, cls: C1, school: S1, reviewed: true, q: { painPresent: false } },
  { id: 'scr-7', key: 'ck-101', level: 'red', score: 0.84, reason: 'Цоорлын хөндий', d: 3, season: SPR, cls: C2, school: S2, reviewed: false, imgs: 2, findings: [{ fdi: 84, cls: 'cavity', conf: 0.84 }], q: { painPresent: true, hot: true, biting: true, onset: '2_3_days' } },
  { id: 'scr-8', key: 'ck-102', level: 'yellow', score: 0.50, reason: 'Дахин шалгах', d: 6, season: SPR, cls: C2, school: S2, reviewed: false, imgs: 1, findings: [{ fdi: 74, cls: 'caries', conf: 0.57 }], q: { painPresent: false } },
  { id: 'scr-9', key: 'ck-103', level: 'green', score: 0.07, reason: null, d: 11, season: SPR, cls: C2, school: S2, reviewed: true, q: { painPresent: false } },
  { id: 'scr-10', key: 'ck-104', level: 'yellow', score: 0.46, reason: 'Толбо — эмч улаан болгов', d: 15, season: SPR, cls: C2, school: S2, reviewed: true, confirmed: 'red', imgs: 1, findings: [{ fdi: 64, cls: 'caries', conf: 0.47 }], q: { painPresent: true, biting: true, onset: 'yesterday' } },
  { id: 'scr-11', key: 'ck-105', level: 'red', score: 0.88, reason: 'Цоорол + өвдөлт', d: 9, season: SPR, cls: C2, school: S2, reviewed: true, confirmed: 'red', imgs: 2, findings: [{ fdi: 36, cls: 'cavity', conf: 0.83 }, { fdi: 46, cls: 'caries', conf: 0.66 }], q: { painPresent: true, cold: true, hot: true, biting: true, spontaneous: true, onset: '5_plus_days' } },
  { id: 'scr-12', key: 'ck-106', level: 'green', score: 0.04, reason: null, d: 18, season: SPR, cls: C2, school: S2, reviewed: true },
  // Prior season (2025-fall) — longitudinal: ck-001 & ck-003 worsened, ck-002 emerged.
  { id: 'scr-f1', key: 'ck-001', level: 'yellow', score: 0.50, reason: 'Толбо', d: 150, season: FALL, cls: C1F, school: S1, reviewed: true, confirmed: 'yellow', imgs: 1, findings: [{ fdi: 36, cls: 'caries', conf: 0.55 }], q: { painPresent: false } },
  { id: 'scr-f2', key: 'ck-003', level: 'yellow', score: 0.52, reason: 'Толбо', d: 160, season: FALL, cls: C1F, school: S1, reviewed: true, confirmed: 'yellow', imgs: 1, findings: [{ fdi: 85, cls: 'caries', conf: 0.51 }], q: { painPresent: false } },
  { id: 'scr-f3', key: 'ck-002', level: 'green', score: 0.08, reason: null, d: 170, season: FALL, cls: C1F, school: S1, reviewed: true },
]

export const FOLLOWUPS: Fu[] = [
  { key: 'ck-001', school: S1, status: 'flagged' },
  { key: 'ck-101', school: S2, status: 'flagged' },
  { key: 'ck-002', school: S1, status: 'contacted', appt: -3 },
  { key: 'ck-104', school: S2, status: 'contacted', appt: -5 },
  { key: 'ck-003', school: S1, status: 'doctor_connected', appt: -2 },
  { key: 'ck-004', school: S1, status: 'unclear' },
  { key: 'ck-105', school: S2, status: 'treatment_done' },
  { key: 'ck-102', school: S2, status: 'treatment_refused' },
]
