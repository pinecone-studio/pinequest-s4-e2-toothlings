'use client'

import { useMemo } from 'react'
import Modal from '@/components/ui/Modal'
import { buildSlots } from '@/lib/appointmentSlots'
import { useMyBlocks, useToggleBlock } from '@/hooks/useAppointments'

const key = (d: Date) => d.toDateString()
const hh = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:00`
const dayLabel = (d: Date) => {
  const now = new Date(); const t = new Date(now); t.setDate(now.getDate() + 1)
  return d.toDateString() === now.toDateString() ? 'Өнөөдөр' : d.toDateString() === t.toDateString() ? 'Маргааш' : `${d.getMonth() + 1}/${d.getDate()}`
}

// Dentist blocks their own time slots — blocked slots can't be booked or shown free.
const DentistAvailabilityModal = ({ onClose }: { onClose: () => void }) => {
  const slots = useMemo(() => buildSlots(), [])
  const { data: blocks = [] } = useMyBlocks()
  const toggle = useToggleBlock()
  const blocked = new Set(blocks)

  const days = useMemo(() => {
    const map = new Map<string, Date[]>()
    for (const s of slots) map.set(key(s), [...(map.get(key(s)) ?? []), s])
    return [...map.values()]
  }, [slots])

  return (
    <Modal open onClose={onClose} title="Боломжит цаг тохируулах" subtitle="Блоклосон цагт сурагч захиалах боломжгүй" size="lg">
      <div className="flex flex-col gap-4">
        {days.map((ds) => {
          const allBlocked = ds.every((d) => blocked.has(d.getTime()))
          return (
            <div key={key(ds[0])}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-text-base">{dayLabel(ds[0])}</p>
                <button
                  onClick={() => ds.forEach((d) => toggle.mutate({ blockedAt: d.getTime(), block: !allBlocked }))}
                  className="btn rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary-subtle"
                >
                  {allBlocked ? 'Өдрийг нээх' : 'Өдрийг блоклох'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ds.map((d) => {
                  const isBlocked = blocked.has(d.getTime())
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => toggle.mutate({ blockedAt: d.getTime(), block: !isBlocked })}
                      className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
                        isBlocked ? 'border-triage-red/40 bg-triage-red-bg text-triage-red line-through' : 'border-border bg-surface text-text-base hover:border-primary'
                      }`}
                    >
                      {hh(d)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        <p className="text-[11px] text-text-muted">Улаанаар тэмдэглэгдсэн цаг блоклогдсон — сурагч захиалах боломжгүй.</p>
      </div>
    </Modal>
  )
}

export default DentistAvailabilityModal
