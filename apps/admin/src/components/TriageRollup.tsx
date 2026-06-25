'use client'

import { useRouter } from 'next/navigation'
import { useScreenings } from '@/hooks/useScreenings'
import TriageDistributionBar from './dashboard/TriageDistributionBar'

export const TriageRollup = ({ classId }: { classId: string }) => {
  const router = useRouter()
  const { data } = useScreenings({ classId })
  const counts: Record<string, number> = {}
  for (const s of data ?? []) counts[s.triageLevel] = (counts[s.triageLevel] ?? 0) + 1

  const green = counts.green ?? 0
  const yellow = counts.yellow ?? 0
  const red = counts.red ?? 0
  const total = green + yellow + red

  return (
    <div className="flex flex-col gap-2">
      <TriageDistributionBar
        green={green}
        yellow={yellow}
        red={red}
        onSegmentClick={(level) => router.push(`/admin/classes/${classId}?triage=${level}`)}
      />
      <p className="text-xs text-text-muted">
        Нийт: {total} — Улаан: {red} · Шар: {yellow} · Ногоон: {green}
      </p>
    </div>
  )
}
