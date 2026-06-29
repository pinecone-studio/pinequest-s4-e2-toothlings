import type { ChildScreeningSummary } from '@pinequest/types'
import type { HospitalGuide } from '@/hooks/useChildSummary'

const LEVEL_MN: Record<string, string> = {
  green: 'Дараагийн хяналтанд хамруулах',
  yellow: 'Эмчилгээ шаардлагатай',
  red: 'Яаралтай эмчилгээ шаардлагатай',
}
const STAGE_MN: Record<string, string> = {
  primary: 'сүүн шүдний нас', mixed: 'холимог шүдний нас', permanent: 'байнгын шүдний нас',
}
const SYMPTOM_MN: Record<string, string> = {
  swelling: 'Хавдар', painDisturbingSleepOrEating: 'Унтаж/идэж чадахгүй өвдөлт',
  fever: 'Халуурах', gumPimpleOrFistula: 'Буйл дээр цэврүү', trauma: 'Гэмтэл', bleedingGums: 'Буйл цус алдах',
}

export const buildParentEmailBody = (childName: string, s: ChildScreeningSummary, hospital?: HospitalGuide | null): string => {
  const lines: string[] = [
    `Эрхэм эцэг эх,`,
    ``,
    `${childName}-ийн шүдний урьдчилсан үзүүлэлтийн дүн (${new Date(s.capturedAt).toLocaleDateString('mn-MN')}):`,
    ``,
    `── Дүгнэлт ──────────────────────────────`,
    `• Дүгнэлт: ${LEVEL_MN[s.effectiveLevel] ?? s.effectiveLevel}`,
    `• ${s.headline}`,
    `• Шүдний эмчээр шалгуулах хэсэг: ${s.flaggedAreas}`,
    `• Нас: ${s.ageYears} нас (${STAGE_MN[s.dentitionStage] ?? ''})`,
    ``,
  ]

  if (s.symptoms.length) {
    lines.push(`── АЖИГЛАГДСАН ШИНЖ ТЭМДЭГ ─────────────────────`)
    for (const sym of s.symptoms) lines.push(`  ⚠ ${SYMPTOM_MN[sym] ?? sym}`)
    lines.push(``)
  }

  if (s.homeSteps.length) {
    lines.push(`── ГЭРИЙН АРЧИЛГАА ──────────────────────────────`)
    for (const step of s.homeSteps) lines.push(`  – ${step}`)
    lines.push(``)
  }

  if (hospital) {
    lines.push(`── ХАМГИЙН ОЙР ЭМНЭЛЭГ ─────────────────────────`)
    lines.push(`  ${hospital.name}`)
    lines.push(`  Хаяг: ${hospital.address}`)
    lines.push(`  Зай: ${hospital.distanceKm} км · ${hospital.travelMinutes} минут`)
    lines.push(`  Цагийн хуваарь: ${hospital.schedule}`)
    lines.push(`  Утас: ${hospital.phone}`)
    lines.push(``)
  }

  lines.push(
    `────────────────────────────────────────────────`,
    `АНХААР: Энэ бол урьдчилсан үзүүлэлт бөгөөд ОНОШ БИШ.`,
    `Эцсийн дүгнэлтийг шүдний эмч баталгаажуулна.`,
    ``,
    `Хүндэтгэсэн,`,
    `Toothlings баг`,
  )

  return lines.join('\n')
}

export const openParentEmail = (childName: string, toEmail: string | null, s: ChildScreeningSummary, hospital?: HospitalGuide | null): void => {
  const subject = `Шүдний үзүүлэлтийн дүн — ${childName}`
  const body = buildParentEmailBody(childName, s, hospital)
  window.location.href = `mailto:${toEmail ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const openParentSms = (phone: string, childName: string, s: ChildScreeningSummary): void => {
  const level = LEVEL_MN[s.effectiveLevel] ?? s.effectiveLevel
  const msg = [
    `Toothlings: ${childName}-ийн шүдний үзүүлэлт`,
    `${level}`,
    s.headline,
    s.flaggedAreas > 0 ? `${s.flaggedAreas} хэсэг анхаарал шаардлагатай.` : '',
    `АНХААР: Онош биш — эмчээр баталгаажуулна.`,
  ].filter(Boolean).join('\n')
  window.location.href = `sms:${phone}?body=${encodeURIComponent(msg)}`
}
