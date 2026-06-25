import type { ChildScreeningSummary } from '@pinequest/types'

// Build a parent screening-summary email and open the user's mail client.
// SCREENING-not-diagnosis: hedged, versioned copy; no banned clinical words.
// No server email infra — mailto opens the staff member's own mail app.

const LEVEL_MN: Record<string, string> = {
  green: 'Аюулын шинж илрээгүй',
  yellow: 'Хяналт зөвлөж байна',
  red: 'Яаралтай хяналт зөвлөж байна',
}

const STAGE_MN: Record<string, string> = {
  primary: 'сүүн шүдний нас',
  mixed: 'холимог шүдний нас',
  permanent: 'байнгын шүдний нас',
}

export const buildParentEmailBody = (childName: string, s: ChildScreeningSummary): string => {
  const lines = [
    `Эрхэм эцэг эх,`,
    ``,
    `${childName}-ийн шүдний урьдчилсан скринингийн дүн (${new Date(s.capturedAt).toLocaleDateString('mn-MN')}):`,
    ``,
    `• Дүгнэлт: ${LEVEL_MN[s.effectiveLevel] ?? s.effectiveLevel}`,
    `• ${s.headline}`,
    `• Шүдний эмчээр шалгуулахаар тэмдэглэгдсэн хэсэг: ${s.flaggedAreas}`,
    s.symptoms.length ? `• Илэрхий шинж тэмдэг бүртгэгдсэн (${s.symptoms.length})` : '',
    `• Нас: ${s.ageYears} (${STAGE_MN[s.dentitionStage] ?? ''})`,
    ``,
    `Гэртээ хийх зөвлөмж:`,
    ...s.homeSteps.map((step) => `  – ${step}`),
    ``,
    `АНХААР: Энэ бол урьдчилсан скрининг бөгөөд ОНОШ БИШ. Эцсийн дүгнэлтийг шүдний эмч баталгаажуулна.`,
    ``,
    `Хүндэтгэсэн,`,
    `Screener баг`,
    `(контент хувилбар: ${s.contentVersion})`,
  ]
  return lines.filter((l) => l !== '').join('\n')
}

export const openParentEmail = (
  childName: string,
  toEmail: string | null,
  s: ChildScreeningSummary,
): void => {
  const subject = `Шүдний скринингийн дүн — ${childName}`
  const body = buildParentEmailBody(childName, s)
  const href = `mailto:${toEmail ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = href
}
