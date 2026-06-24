'use client'

import type { FollowUpStatus } from '@pinequest/types'
import { useUpdateFollowUp, type FollowUpRow as Row } from '@/hooks/useFollowUps'

const STATUSES: FollowUpStatus[] = [
  'flagged',
  'contacted',
  'referred',
  'treatment_completed',
  'verified_resolved',
  'lost_to_follow_up',
]

const labels: Record<FollowUpStatus, string> = {
  flagged: 'Тэмдэглэсэн',
  contacted: 'Холбогдсон',
  referred: 'Илгээсэн',
  treatment_completed: 'Эмчилгээ дууссан',
  verified_resolved: 'Баталгаажсан',
  lost_to_follow_up: 'Алдагдсан',
}

export const FollowUpRow = ({ row }: { row: Row }) => {
  const update = useUpdateFollowUp()
  return (
    <tr className="border-b border-neutral-100">
      <td className="py-2">{row.childName ?? row.childKey}</td>
      <td>{row.guardianPhone ?? '—'}</td>
      <td>
        <select
          value={row.status}
          disabled={update.isPending}
          onChange={(e) =>
            update.mutate({
              childKey: row.childKey,
              status: e.target.value as FollowUpStatus,
              version: row.version,
            })
          }
          className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}
