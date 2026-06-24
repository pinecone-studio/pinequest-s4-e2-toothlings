'use client'

import { useScreenings } from '@/hooks/useScreenings'
import { TriageBadge } from './TriageBadge'

const LEVELS = ['red', 'yellow', 'green'] as const

export const TriageRollup = ({ classId }: { classId: string }) => {
  const { data } = useScreenings({ classId })
  const counts: Record<string, number> = {}
  for (const s of data ?? []) counts[s.triageLevel] = (counts[s.triageLevel] ?? 0) + 1

  return (
    <div className="flex items-center gap-4">
      {LEVELS.map((level) => (
        <span key={level} className="flex items-center gap-1.5">
          <TriageBadge level={level} />
          <span className="text-sm tabular-nums">{counts[level] ?? 0}</span>
        </span>
      ))}
    </div>
  )
}
