import type {
  DentitionStage,
  PainDetail,
  SymptomSet,
  ToothFinding,
  TriageLevel,
} from '@pinequest/types'

/** Clinical inputs the board-facing narrative is woven from. */
export type NarrativeInput = {
  ageYears: number
  stage: DentitionStage
  level: TriageLevel
  findings: ToothFinding[]
  symptoms: SymptomSet
  pain?: PainDetail
}

type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar'

/** FDI code → primary/permanent + tooth type + Mongolian name (educational). */
export const describeTooth = (fdi: number): { primary: boolean; type: ToothType; mn: string } => {
  const quadrant = Math.floor(fdi / 10)
  const pos = fdi % 10
  const primary = quadrant >= 5
  const type: ToothType =
    pos <= 2 ? 'incisor' : pos === 3 ? 'canine' : !primary && pos <= 5 ? 'premolar' : 'molar'
  const base =
    type === 'incisor' ? 'үүдэн шүд' : type === 'canine' ? 'соёо шүд' : type === 'premolar' ? 'бага араа' : 'их араа'
  return { primary, type, mn: primary ? `сүүн ${base}` : base }
}

const FINDING_MN: Record<string, string> = {
  caries: 'цоорлын сэжигтэй толбо',
  cavity: 'цоорлын хөндий',
  crack: 'хагарлын шинж',
}

const ONSET_MN: Record<string, string> = {
  yesterday: 'өчигдрөөс',
  '2_3_days': '2–3 хоногийн өмнөөс',
  '5_plus_days': '5-аас олон хоногийн өмнөөс',
}

const painQualities = (p: PainDetail): string[] =>
  (
    [
      ['cold', 'хүйтэнд'],
      ['hot', 'халуунд'],
      ['biting', 'зажлахад'],
      ['spontaneous', 'аяндаа'],
      ['night', 'шөнө'],
    ] as const
  )
    .filter(([k]) => p[k])
    .map(([, mn]) => mn)

const findingClause = (f: ToothFinding): string => {
  const what = FINDING_MN[f.className] ?? 'анхаарах шинж'
  const where = typeof f.fdi === 'number' ? `${describeTooth(f.fdi).mn} (FDI ${f.fdi})` : 'нэг хэсэгт'
  const conf = f.confidence >= 0.6 ? 'тод' : f.confidence >= 0.45 ? 'дунд зэрэг' : 'бүдэг'
  return `${where} дээр ${conf} ${what}`
}

/** Board/dentist-facing narrative paragraph. Clinical audience, screening-framed. */
export const buildAssessment = (i: NarrativeInput): string => {
  const stageMn = i.stage === 'primary' ? 'сүүн шүдний нас' : i.stage === 'mixed' ? 'холимог шүдтэй' : 'байнгын шүдтэй'
  const parts = [`Хүүхэд ${i.ageYears} настай, ${stageMn}.`]

  if (i.findings.length) {
    parts.push(`Зурагт ${i.findings.map(findingClause).join(', ')} ажиглагдаж байна.`)
  } else {
    parts.push('Зурагт тодорхой анхаарах шинж ажиглагдсангүй.')
  }

  if (i.pain?.present) {
    const q = painQualities(i.pain)
    const onset = i.pain.onset ? ` Өвдөлт ${ONSET_MN[i.pain.onset] ?? ''} эхэлсэн.` : ''
    parts.push(q.length ? `Асуумжид ${q.join(', ')} өвддөг гэж мэдээлсэн.${onset}` : `Өвдөлттэй гэж мэдээлсэн.${onset}`)
  }

  const danger = [i.symptoms.swelling && 'нүүр орчмын хаван', i.symptoms.fever && 'халууралт'].filter(Boolean)
  if (danger.length) parts.push(`Аюулын шинж: ${danger.join(', ')} — яаралтай анхаарал шаардлагатай.`)

  const verdict =
    i.level === 'red'
      ? 'Улаан статус: аль болох хурдан шүдний эмчид үзүүлэхийг зөвлөж байна.'
      : i.level === 'yellow'
        ? 'Шар статус: ойрын хугацаанд шүдний эмчид үзүүлэх шаардлагатай.'
        : 'Ногоон статус: энэ зурагт аюулын шинж илрээгүй — дараагийн хяналтаар үргэлжлүүлнэ.'
  parts.push(`${verdict} Эцсийн дүгнэлтийг шүдний эмч баталгаажуулна.`)
  return parts.join(' ')
}

/** Referral-side next steps for the dentist, keyed to findings + age. */
export const buildDentistActions = (i: NarrativeInput): string[] => {
  const actions: string[] = []
  for (const f of i.findings) {
    if (typeof f.fdi !== 'number') continue
    const t = describeTooth(f.fdi)
    if (t.primary && t.type === 'molar') actions.push(`Сүүн араа (FDI ${f.fdi}) шүдийг ломбодуулах эсэхийг эмчээр шийдүүлэх.`)
    else if (!t.primary && t.type === 'molar') actions.push(`Байнгын их араа (FDI ${f.fdi}) шүдэнд ховил битүүлэх (sealant) хийлгэх талаар лавлах.`)
    else actions.push(`${t.mn} (FDI ${f.fdi})-ийг эмчийн үзлэгээр нягтлах.`)
  }
  if (i.level === 'red') actions.unshift('Аль болох энэ сард аймаг/сумын шүдний кабинетэд үзүүлэх.')
  if (!actions.length) actions.push('Дараагийн хяналтын скринингт хамруулах.')
  return actions
}
