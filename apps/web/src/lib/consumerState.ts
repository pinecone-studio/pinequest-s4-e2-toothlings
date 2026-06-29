const QUESTIONNAIRE_KEY = 'screener.questionnaire.v1'
const BRUSH_SESSION_KEY = 'screener.brushSession.v1'
const SCAN_RESULT_KEY = 'screener.lastScanResult.v1'
const SCAN_HISTORY_KEY = 'screener.scanHistory.v1'
const BRUSH_LOGS_KEY = 'screener.brushLogs.v1'
const APPOINTMENT_KEY = 'screener.appointment.v1'
const CHILD_NAMES_KEY = 'screener.childNames.v1'

export type PainWhen = 'cold' | 'hot' | 'spontaneous' | 'night' | 'pressure'
export type PainSince = 'yesterday' | '2days' | '4days'

export type QuestionnaireAnswers = {
  childName: string
  age: string
  lastDentalVisit: string
  /** Өвддөг шүд байгаа эсэх */
  hasPainfulTooth: 'yes' | 'no'
  /** hasPainfulTooth === 'yes' үед л бөглөнө */
  painWhen?: PainWhen
  painSince?: PainSince
  feverSwelling?: 'yes' | 'no'
  filledAt: string
}

export type TriageLevel = 'green' | 'yellow' | 'red'

export type ScanDetection = {
  label: string
  confidence: number
  box: { x: number; y: number; w: number; h: number }
}

export type ScanResult = {
  id: string
  imageUrl: string
  triage: TriageLevel
  urgent: boolean
  needsDoctor: boolean
  detections: ScanDetection[]
  advice: string
  createdAt: string
}

export type BrushZone = 'UL' | 'UR' | 'LL' | 'LR'

export type BrushSession = {
  startedAt: string
  zones: Record<BrushZone, number>
  pressure: 'low' | 'ok' | 'high'
  /** Per-tooth ML coverage 0–100 (FDI-style ids from brushMl). */
  teeth?: Record<string, number>
  overallCoverage?: number
}

export type BrushDayLog = {
  date: string
  score: number
}

export type Appointment = {
  doctorName: string
  clinic: string
  datetime: string
  address: string
}

const read = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const write = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const isQuestionnaireComplete = (): boolean => {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem(QUESTIONNAIRE_KEY))
}

export const getQuestionnaire = (): QuestionnaireAnswers | null => {
  const raw = read<QuestionnaireAnswers & { hasPain?: 'yes' | 'no' }>(QUESTIONNAIRE_KEY)
  if (!raw) return null
  if ('hasPainfulTooth' in raw && raw.hasPainfulTooth) return raw as QuestionnaireAnswers
  return {
    childName: raw.childName,
    age: raw.age,
    lastDentalVisit: raw.lastDentalVisit,
    hasPainfulTooth: raw.hasPain ?? 'no',
    filledAt: raw.filledAt,
  }
}

/** Questionnaire → triage symptom flags for AI analyze. */
export const questionnaireSymptoms = (q: QuestionnaireAnswers | null) => {
  if (!q || q.hasPainfulTooth !== 'yes') {
    return { painDisturbingSleepOrEating: false, fever: false, swelling: false }
  }
  const feverSwelling = q.feverSwelling === 'yes'
  return {
    painDisturbingSleepOrEating: q.painWhen === 'night' || q.painWhen === 'spontaneous',
    fever: feverSwelling,
    swelling: feverSwelling,
  }
}

export const saveQuestionnaire = (answers: Omit<QuestionnaireAnswers, 'filledAt'>): void => {
  write(QUESTIONNAIRE_KEY, { ...answers, filledAt: new Date().toISOString() })
}

export const clearQuestionnaire = (): void => {
  localStorage.removeItem(QUESTIONNAIRE_KEY)
}

export const getBrushSession = (): BrushSession | null => read(BRUSH_SESSION_KEY)

export const saveBrushSession = (session: BrushSession): void => {
  write(BRUSH_SESSION_KEY, session)
  appendBrushLog(session)
}

const appendBrushLog = (session: BrushSession) => {
  const total = Object.values(session.zones).reduce((a, b) => a + b, 0)
  const score =
    session.overallCoverage ?? Math.min(100, Math.round((total / 120) * 100))
  const date = new Date().toISOString().slice(0, 10)
  const logs = getBrushLogs().filter((l) => l.date !== date)
  logs.push({ date, score })
  write(BRUSH_LOGS_KEY, logs.slice(-30))
}

export const getBrushLogs = (): BrushDayLog[] => read(BRUSH_LOGS_KEY) ?? []

export const getLast7BrushLogs = (): BrushDayLog[] => {
  const logs = getBrushLogs()
  const days: BrushDayLog[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const found = logs.find((l) => l.date === date)
    days.push(found ?? { date, score: 0 })
  }
  return days
}

export const saveScanResult = (result: ScanResult): void => {
  write(SCAN_RESULT_KEY, result)
  const history = getScanHistory()
  history.unshift(result)
  write(SCAN_HISTORY_KEY, history.slice(0, 20))
}

export const getLastScanResult = (): ScanResult | null => read(SCAN_RESULT_KEY)

export const getScanHistory = (): ScanResult[] => read(SCAN_HISTORY_KEY) ?? []

/** Child names the user has added, by name (no age/PII). Persisted locally. */
export const getChildNames = (): string[] => read<string[]>(CHILD_NAMES_KEY) ?? []

export const addChildName = (name: string): string[] => {
  const trimmed = name.trim()
  const names = getChildNames()
  if (!trimmed || names.includes(trimmed)) return names
  const next = [...names, trimmed]
  write(CHILD_NAMES_KEY, next)
  return next
}

export const removeChildName = (name: string): string[] => {
  const next = getChildNames().filter((n) => n !== name)
  write(CHILD_NAMES_KEY, next)
  return next
}

export const getAppointment = (): Appointment =>
  read(APPOINTMENT_KEY) ?? {
    doctorName: 'Dr. Batbold',
    clinic: 'Smile Dental',
    datetime: new Date(Date.now() + 3 * 86400000).toISOString(),
    address: 'БЗД, 15-р хороо, Smile Dental',
  }

/** Parent self-books a visit time (infra-free; no server). Last write wins. */
export const saveAppointment = (appt: Appointment): void => write(APPOINTMENT_KEY, appt)

export const DEMO_SCAN_RESULT = (imageUrl: string): ScanResult => ({
  id: `scan-${Date.now()}`,
  imageUrl,
  triage: 'yellow',
  urgent: true,
  needsDoctor: true,
  detections: [
    { label: 'Caries', confidence: 0.764, box: { x: 28, y: 35, w: 18, h: 14 } },
    { label: 'Cavity', confidence: 0.124, box: { x: 55, y: 42, w: 12, h: 10 } },
  ],
  advice:
    'Шүдний гадаргуу дээр кариесийн шинж илэрсэн. 2 долоо хоногийн дотор эмчид үзүүлэхийг зөвлөж байна. Өдөрт 2 удаа зөв угаалга хий.',
  createdAt: new Date().toISOString(),
})
