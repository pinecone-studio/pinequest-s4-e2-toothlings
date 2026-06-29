'use client'

import { useState } from 'react'
import type { BoardStudent } from '@/hooks/useBoard'
import { useAllVolunteerDentists, type VolunteerDentist } from '@/hooks/useHelp'
import { DentistRosterCard } from './DentistRosterCard'
import ScheduleDentistModal from './ScheduleDentistModal'
import { PageSpinner } from '@/components/ui/Spinner'

type Props = { students: BoardStudent[] }

// Board right-panel: roster of volunteer dentists. Pick a flagged student, then an
// available dentist, to schedule a video call (Jitsi). Mirrors the reference layout.
const BoardDentistPanel = ({ students }: Props) => {
  const { data: dentists = [], isLoading } = useAllVolunteerDentists()
  const [childKey, setChildKey] = useState('')
  const [picked, setPicked] = useState<VolunteerDentist | null>(null)

  // Volunteer-dentist calls are for RED (emergency) students only.
  const redStudents = students.filter((s) => s.latestLevel === 'red')
  const selected = redStudents.find((s) => s.childKey === childKey) ?? null
  const availableCount = dentists.filter((d) => d.isAvailable).length
  const student = selected ? { childKey: selected.childKey, name: `${selected.lastName} ${selected.firstName}` } : null

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 self-start rounded-2xl border border-border bg-surface-raised p-4 lg:w-[340px]">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-text-base">
          Холбогдох боломжтой шүдний эмч <span className="text-text-muted">({availableCount})</span>
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">Эмч сонгоод шууд дуудах эсвэл цаг товлоно уу</p>
      </div>

      <select
        value={childKey}
        onChange={(e) => setChildKey(e.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text-base focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Улаан сурагч сонгох…</option>
        {redStudents.map((s) => (
          <option key={s.childKey} value={s.childKey}>{s.lastName} {s.firstName} · {s.className}</option>
        ))}
      </select>

      {isLoading ? (
        <PageSpinner />
      ) : dentists.length > 0 ? (
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-0.5">
          {dentists.map((d) => (
            <DentistRosterCard key={d.id} dentist={d} onPick={() => setPicked(d)} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[12px] text-text-muted">
          Бүртгэлтэй сайн дурын эмч алга.
        </p>
      )}

      {!student && dentists.length > 0 && (
        <p className="text-[11px] text-text-muted">Шууд дуудахад сурагч шаардлагагүй. Цаг товлоход зүүн талаас сурагч сонгоно уу.</p>
      )}

      {picked && (
        <ScheduleDentistModal dentist={picked} student={student} level="red" onClose={() => setPicked(null)} />
      )}
    </aside>
  )
}

export default BoardDentistPanel
