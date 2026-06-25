import type {
  ChildScreeningSummary,
  DentitionStage,
  SymptomSet,
  ToothFinding,
  TriageLevel,
} from '@pinequest/types'

/**
 * Dentist-approved, versioned parent/teacher copy. SCREENING-not-diagnosis:
 * hedged wording, no banned clinical words (decay/caries/cavity, "эрүүл шүд",
 * "асуудалгүй"). Bump the version when the wording changes; the app pins it.
 */
export const SUMMARY_CONTENT_VERSION = 'screen-mn-v1'

const HEADLINE: Record<TriageLevel, string> = {
  green: 'Эдгээр зурагт аюулын шинж тэмдэг илрээгүй. Энэ нь онош биш — хяналтаар үргэлжлүүлээрэй.',
  yellow: 'Шүдний эмчид үзүүлэхийг зөвлөж байна (яаралтай биш).',
  red: 'Аль болох хурдан шүдний эмчид хандахыг зөвлөж байна.',
}

const BASE_STEPS = [
  'Өдөрт 2 удаа фтортой оохойгоор шүдээ угаах.',
  'Чихэрлэг хоол, ундааны хэрэглээг багасгах.',
]

const LEVEL_STEPS: Record<TriageLevel, string[]> = {
  green: ['Дараагийн хяналтын скринингт хамрагдах.'],
  yellow: ['1–2 долоо хоногийн дотор шүдний эмчид үзүүлэх цаг товлох.'],
  red: ['Өвдөлт, хавдар, эсвэл халуурвал яаралтай эмнэлэгт хандах.'],
}

const STAGE_STEP: Record<DentitionStage, string> = {
  primary: 'Бага насны хүүхдэд эцэг эх нь шүд угаахад нь туслах.',
  mixed: 'Шинээр ургаж буй байнгын араа шүдэнд онцгой анхаарах.',
  permanent: 'Шүдний цэвэрлэгээний утас өдөр бүр хэрэглэж эхлэх.',
}

/** Expected dentition stage by age (educational only — not a per-tooth claim). */
export const dentitionStageForAge = (ageYears: number): DentitionStage => {
  if (ageYears < 6) return 'primary'
  if (ageYears <= 12) return 'mixed'
  return 'permanent'
}

const symptomKeys = (s: SymptomSet): string[] =>
  (
    [
      'swelling',
      'painDisturbingSleepOrEating',
      'fever',
      'gumPimpleOrFistula',
      'trauma',
    ] as const
  ).filter((k) => s[k])

type BuildInput = {
  screeningId: string
  seasonId: string
  capturedAt: string
  birthYear: number
  findings: ToothFinding[]
  symptoms: SymptomSet
  aiLevel: TriageLevel
  confidentWording: boolean
  reviewedLevel?: TriageLevel
  /** Capture year (defaults to capturedAt's year). */
  asOfYear?: number
}

/**
 * Build a compliant per-child screening summary. Pure: same output on phone,
 * server, and board. Counts are "areas a dentist should check", never a
 * diagnosis or a decay count.
 */
export const buildChildSummary = (input: BuildInput): ChildScreeningSummary => {
  const effectiveLevel = input.reviewedLevel ?? input.aiLevel
  const year = input.asOfYear ?? new Date(input.capturedAt).getFullYear()
  const ageYears = Math.max(0, year - input.birthYear)
  const stage = dentitionStageForAge(ageYears)

  const flaggedByConfidence = { high: 0, moderate: 0, low: 0 }
  for (const f of input.findings) {
    if (f.confidence >= 0.6) flaggedByConfidence.high += 1
    else if (f.confidence >= 0.45) flaggedByConfidence.moderate += 1
    else flaggedByConfidence.low += 1
  }

  const loci = input.findings
    .map((f) => f.fdi)
    .filter((n): n is number => typeof n === 'number')

  const homeSteps = [...BASE_STEPS, ...LEVEL_STEPS[effectiveLevel], STAGE_STEP[stage]]

  return {
    screeningId: input.screeningId,
    seasonId: input.seasonId,
    capturedAt: input.capturedAt,
    aiLevel: input.aiLevel,
    reviewedLevel: input.reviewedLevel,
    effectiveLevel,
    confidentWording: input.confidentWording,
    flaggedAreas: input.findings.length,
    flaggedByConfidence,
    loci,
    symptoms: symptomKeys(input.symptoms),
    ageYears,
    dentitionStage: stage,
    headline: HEADLINE[effectiveLevel],
    homeSteps,
    contentVersion: SUMMARY_CONTENT_VERSION,
  }
}
