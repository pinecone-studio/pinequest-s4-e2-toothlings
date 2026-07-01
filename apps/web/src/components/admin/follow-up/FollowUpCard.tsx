'use client'

import {
  EnvelopeIcon, ArrowsPointingOutIcon,
  ExclamationTriangleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/solid'
import type { ComponentType, SVGProps } from 'react'
import type { FollowUpStatus } from '@pinequest/types'
import type { BoardStudent } from '@/hooks/useBoard'
import StatusPicker from '@/components/ui/StatusPicker'
import IconButton from '@/components/ui/IconButton'
import SeasonDotRail from '@/components/admin/summary/SeasonDotRail'
import { effectiveFollowUpStatus } from '@/lib/followUp'

// Triage is a STATUS accent ONLY — dot + icon + label + avatar initial. The
// card surface itself stays neutral in BOTH themes; we never tint the whole
// card. Soft tint is confined to the small avatar square.
type Triage = { text: string; dot: string; soft: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; label: string }
const TRIAGE: Record<string, Triage> = {
  red:    { text: 'text-triage-red',    dot: 'bg-triage-red',    soft: 'bg-triage-red-bg',    Icon: ExclamationTriangleIcon, label: 'Яаралтай эмчилгээ шаардлагатай' },
  yellow: { text: 'text-triage-yellow', dot: 'bg-triage-yellow', soft: 'bg-triage-yellow-bg', Icon: ExclamationCircleIcon,   label: 'Эмчилгээ шаардлагатай' },
}
const FALLBACK: Triage = { text: 'text-text-muted', dot: 'bg-border', soft: 'bg-surface-raised', Icon: ExclamationCircleIcon, label: 'Шалгаагүй' }

const GripDots = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/>
    <circle cx="2.5" cy="7" r="1.5"/><circle cx="7.5" cy="7" r="1.5"/>
    <circle cx="2.5" cy="11.5" r="1.5"/><circle cx="7.5" cy="11.5" r="1.5"/>
  </svg>
)

type Props = {
  student: BoardStudent
  onSend?: () => void
  onStatus: (s: FollowUpStatus) => void
  onEdit: () => void
  dragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

const FollowUpCard = ({ student: s, onSend, onStatus, onEdit, dragging, onDragStart, onDragEnd }: Props) => {
  const t = TRIAGE[s.latestLevel ?? ''] ?? FALLBACK
  const date = s.screenedAt
    ? new Date(s.screenedAt).toLocaleDateString('mn-MN', { month: 'numeric', day: 'numeric' })
    : '—'

  // Stop card-level click (open modal) when interacting with a control.
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

  return (
    // Clicking the card opens the child's summary modal; only the grip drags.
    <div onClick={onEdit} role="button" tabIndex={0}
      className={`group relative flex cursor-pointer flex-col gap-4 blob border border-border bg-surface p-5
      shadow-(--shadow-card) transition-all duration-200
      hover:-translate-y-1 hover:shadow-(--shadow-card-lg)
      ${dragging ? 'scale-95 opacity-40' : ''}`}
    >
      {/* grip handle — the only draggable element */}
      <div
        draggable
        onClick={stop}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 cursor-grab p-2 text-text-muted/25 transition-colors hover:text-text-muted/60 active:cursor-grabbing"
        title="Чирж зөөх"
      >
        <GripDots />
      </div>

      {/* doc button — top right */}
      <div className="absolute right-4 top-4">
        <IconButton Icon={ArrowsPointingOutIcon} tone="plain" size="sm" label="Дэлгэрэнгүй харах" onClick={onEdit} />
      </div>

      {/* avatar + name (avatar carries the soft status tint) */}
      <div className="flex items-center gap-3 pl-5 pr-10">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-[17px] font-black ${t.soft} ${t.text}`}>
          {s.lastName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight text-text-base">{s.lastName} {s.firstName}</p>
          <p className="mt-0.5 text-[11px] font-medium text-text-muted">{s.className} · {date}</p>
        </div>
      </div>

      {/* status — the ONLY coloured element: icon + label */}
      <div className="flex items-start gap-2 pl-5">
        <t.Icon className={`mt-px size-4.5 shrink-0 ${t.text}`} />
        <p className={`text-[14px] font-bold leading-snug ${t.text}`}>{t.label}</p>
      </div>

      {/* escalation: prior treatment missed, now worsened */}
      {s.escalationFlag && (
        <div className="flex items-center gap-2 rounded-2xl bg-triage-red-bg px-3 py-2">
          <ExclamationTriangleIcon className="size-3.5 shrink-0 text-triage-red" />
          <span className="text-[11px] font-semibold text-triage-red">Өмнөх эмчилгээ хийгдээгүй, одоо хүндэрсэн</span>
        </div>
      )}

      <SeasonDotRail history={s.seasonHistory ?? []} trend={s.trend ?? null} />

      {/* action row — clicks here change status / send, never open the modal */}
      <div className="flex items-center gap-2" onClick={stop}>
        <StatusPicker value={effectiveFollowUpStatus(s)} onChange={onStatus} />
        {onSend && <IconButton Icon={EnvelopeIcon} tone="plain" size="sm" label="Эцэг эхэд илгээх" onClick={onSend} />}
      </div>
    </div>
  )
}

export default FollowUpCard
