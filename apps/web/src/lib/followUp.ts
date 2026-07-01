import type { FollowUpStatus } from '@pinequest/types'
import type { BoardStudent } from '@/hooks/useBoard'

/**
 * Хүүхэд ӨМНӨ улаан (яаралтай) байгаад одоо улаанаас сайжирсан эсэх — улирлын түүхийн
 * хамгийн сүүлийн үзүүлэлт улаан биш, өмнөх улиралд нь улаан байсан бол эмчилгээ үр дүнгээ
 * өгсөн (эмчлүүлсэн) гэж үзнэ.
 */
export const improvedFromRed = (s: BoardStudent): boolean => {
  const hist = [...s.seasonHistory].sort(
    (a, b) => new Date(a.screenedAt).getTime() - new Date(b.screenedAt).getTime(),
  )
  if (hist.length < 2) return false
  const latest = hist[hist.length - 1].effectiveLevel
  return latest !== 'red' && hist.slice(0, -1).some((h) => h.effectiveLevel === 'red')
}

/**
 * Дэлгэц дээр харуулах дагалтын төлөв. Улаанаас сайжирсан хүүхдийн төлөв гараар
 * тэмдэглээгүй ч автоматаар "Эмчилгээ хийлгэсэн" болно — эмчилгээ хийгдсэнийг илэрхийлнэ.
 */
export const effectiveFollowUpStatus = (s: BoardStudent): FollowUpStatus =>
  improvedFromRed(s) ? 'treatment_done' : (s.followUpStatus ?? 'flagged')
