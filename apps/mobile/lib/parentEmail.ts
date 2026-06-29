import { Linking } from 'react-native'
import type { ChildScreeningSummary } from '@pinequest/types'

// Parent screening-summary email via a `mailto:` deep link (no server email infra).
// SCREENING-not-diagnosis: hedged, versioned copy from buildChildSummary; no banned words.

const LEVEL_MN: Record<string, string> = {
  green: 'Дараагийн хяналтанд хамруулах',
  yellow: 'Эмчилгээ шаардлагатай',
  red: 'Яаралтай эмчилгээ шаардлагатай',
}

const buildBody = (childName: string, s: ChildScreeningSummary): string =>
  [
    'Эрхэм эцэг эх,',
    '',
    `${childName}-ийн шүдний урьдчилсан дүгнэлт (${new Date(s.capturedAt).toLocaleDateString('mn-MN')}):`,
    '',
    `• Дүгнэлт: ${LEVEL_MN[s.effectiveLevel] ?? s.effectiveLevel}`,
    `• ${s.headline}`,
    `• Шүдний эмчээр шалгуулахаар тэмдэглэгдсэн хэсэг: ${s.flaggedAreas}`,
    '',
    'Гэртээ хийх зөвлөмж:',
    ...s.homeSteps.map((step) => `  – ${step}`),
    '',
    'АНХААР: Энэ бол урьдчилсан скрининг бөгөөд ОНОШ БИШ. Эцсийн дүгнэлтийг шүдний эмч баталгаажуулна.',
    '',
    'Хүндэтгэсэн,',
    'Screener баг',
  ].join('\n')

export const openParentEmail = (childName: string, toEmail: string | null, s: ChildScreeningSummary): void => {
  const subject = `Шүдний дүгнэлт - ${childName}`
  const body = encodeURIComponent(buildBody(childName, s))
  void Linking.openURL(`mailto:${toEmail ?? ''}?subject=${encodeURIComponent(subject)}&body=${body}`)
}
