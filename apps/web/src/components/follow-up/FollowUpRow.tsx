'use client'

import type { FollowUpStatus } from '@pinequest/types'
import { useUpdateFollowUp, useNotify, type FollowUpRow as Row } from '@/hooks/useFollowUps'

const STATUSES: FollowUpStatus[] = ['flagged', 'contacted', 'doctor_connected', 'treatment_done', 'treatment_refused', 'unclear']

const STATUS_LABEL: Record<FollowUpStatus, string> = {
  flagged:           'Тэмдэглэсэн',
  contacted:         'Холбогдсон',
  doctor_connected:  'Эмчтэй холбосон',
  treatment_done:    'Эмчилгээ хийлгэсэн',
  treatment_refused: 'Эмчилгээ хийлгээгүй',
  unclear:           'Тодорхойгүй',
  superseded:        'Шинэ улиралд шилжсэн',
  season_cleared:    'Ногоон болсон',
}

const STATUS_CLS: Record<FollowUpStatus, string> = {
  flagged:           'bg-surface-raised text-text-muted',
  contacted:         'bg-blue-50 text-blue-600',
  doctor_connected:  'bg-violet-50 text-violet-600',
  treatment_done:    'bg-triage-green-bg text-triage-green',
  treatment_refused: 'bg-triage-red-bg text-triage-red',
  unclear:           'bg-triage-yellow-bg text-triage-yellow',
  superseded:        'bg-surface-raised text-text-muted',
  season_cleared:    'bg-triage-green-bg text-triage-green',
}

export const FollowUpRow = ({ row }: { row: Row }) => {
  const update = useUpdateFollowUp()
  const notify = useNotify()

  const onSms = () => {
    if (!row.guardianPhone) return
    const body = encodeURIComponent(`Шүдний шалгалт: хүүхдийнх нь дүн хянагдаж байна. Холбогдоно уу.`)
    window.open(`sms:${row.guardianPhone}?body=${body}`, '_blank')
    notify.mutate({ childKey: row.childKey, channel: 'sms' })
  }

  const st = (row.status as FollowUpStatus) ?? 'flagged'

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-text-base">{row.childName ?? row.childKey}</td>
      <td className="px-4 py-3 text-sm">
        {row.guardianPhone ? (
          <button onClick={onSms} disabled={notify.isPending} className="font-mono text-xs text-primary hover:underline disabled:opacity-50">
            {row.guardianPhone}
          </button>
        ) : <span className="text-text-muted">—</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLS[st] ?? 'bg-surface-raised text-text-muted'}`}>
          {STATUS_LABEL[st] ?? row.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <select
          value={row.status}
          disabled={update.isPending}
          onChange={(e) => update.mutate({ childKey: row.childKey, status: e.target.value as FollowUpStatus, version: row.version })}
          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-base focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </td>
    </tr>
  )
}
