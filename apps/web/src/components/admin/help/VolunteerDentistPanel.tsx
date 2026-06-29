'use client'

import { useState } from 'react'
import { DentistPanelCard } from './DentistPanelCard'
import ScheduleDentistModal from './ScheduleDentistModal'
import { useAllVolunteerDentists, type VolunteerDentist } from '@/hooks/useHelp'
import { PageSpinner } from '@/components/ui/Spinner'

type Props = { student: { childKey: string; name: string } | null }

// Right-side panel: lists volunteer dentists as profile cards. Pick one for the
// selected red-status student to schedule a video call.
const VolunteerDentistPanel = ({ student }: Props) => {
  const { data: dentists = [], isLoading } = useAllVolunteerDentists()
  const [picked, setPicked] = useState<VolunteerDentist | null>(null)

  return (
    <aside className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-4">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-text-base">Сайн дурын эмч</h3>
        <p className="mt-0.5 text-[12px] text-text-muted">
          {student ? `${student.name} — эмч сонгож видео дуудлага товлоно уу` : 'Зүүн талаас хүүхэд сонгоно уу'}
        </p>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : dentists.length > 0 ? (
        <div className="flex flex-col gap-3">
          {dentists.map((d) => (
            <DentistPanelCard
              key={d.id}
              dentist={d}
              selected={picked?.id === d.id}
              onPick={() => student && setPicked(d)}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[12px] text-text-muted">
          Бүртгэлтэй сайн дурын эмч алга.
        </p>
      )}

      {!student && dentists.length > 0 && (
        <p className="text-[11px] text-text-muted">Эмч товлохын тулд эхлээд хүүхэд сонгоно уу.</p>
      )}

      {picked && student && (
        <ScheduleDentistModal dentist={picked} student={student} onClose={() => setPicked(null)} />
      )}
    </aside>
  )
}

export default VolunteerDentistPanel
