'use client'

import { useState } from 'react'
import { CalendarDaysIcon, PhoneIcon, UsersIcon, BellAlertIcon } from '@heroicons/react/24/solid'
import type { SchoolClassRow } from '@pinequest/types'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import CoverageBar from '@/components/admin/schools/CoverageBar'
import { downloadICS } from '@/lib/calendar'
import { formatSeason } from '@/lib/season'

type Vars = { newSeasonId: string; newName: string; scheduledAt: string | null; reminderPhone: string | null }
type Props = {
  open: boolean
  onClose: () => void
  source: SchoolClassRow | null
  schoolName: string
  submitting: boolean
  onSubmit: (vars: Vars) => Promise<void>
}

const inp = 'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-shadow'

/** "2026-spring" → "2027-spring" */
const nextSeason = (s?: string) =>
  s ? s.replace(/^(\d{4})/, (_, y) => String(Number(y) + 1)) : ''

const CarryForwardModal = ({ open, onClose, source, schoolName, submitting, onSubmit }: Props) => {
  const [seasonId, setSeasonId] = useState('')
  const [name, setName] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [phone, setPhone] = useState('')
  const [wantReminder, setWantReminder] = useState(true)

  // seed fields when the modal opens for a class
  const [seededFor, setSeededFor] = useState<string | null>(null)
  if (open && source && seededFor !== source.id) {
    setSeededFor(source.id)
    setSeasonId(nextSeason(source.seasonId))
    setName(source.name)
    setScheduledAt('')
    setPhone(source.reminderPhone ?? '')
    setWantReminder(true)
  }

  if (!source) return null

  const handleSubmit = async () => {
    if (!seasonId.trim()) return
    await onSubmit({
      newSeasonId: seasonId.trim(),
      newName: name.trim() || source.name,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      reminderPhone: phone.trim() || null,
    })
    if (wantReminder && scheduledAt) {
      downloadICS({
        title: `Шүдний үзүүлэлт — ${schoolName} · ${name || source.name}`,
        description: `${formatSeason(seasonId)} улирлын үзүүлэлт айлчлал. Хамрагдах сурагч: ${source.enrolled}.`,
        start: new Date(scheduledAt),
        remindMinBefore: 1440,
      })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Дараа улирал төлөвлөх"
      subtitle={`${source.name} · ${formatSeason(source.seasonId)} → шинэ улирал`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Болих</Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={!seasonId.trim()}>
            Төлөвлөх
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Enrollment summary */}
        <div className="rounded-2xl border border-border bg-surface-raised p-3.5">
          <div className="mb-2 flex items-center gap-2 text-text-base">
            <UsersIcon className="size-4 text-primary" />
            <span className="text-[13px] font-semibold">{source.enrolled} сурагч элссэн</span>
            <span className="ml-auto text-[12px] text-text-muted">{source.screened}/{source.enrolled} хамрагдсан</span>
          </div>
          <CoverageBar screened={source.screened} total={source.enrolled} />
          <p className="mt-2 text-[11px] text-text-muted">
            Эдгээр {source.enrolled} сурагч шинэ улирлын ангид шилжинэ.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-text-base">Шинэ улирлын нэр</span>
          <input value={seasonId} onChange={(e) => setSeasonId(e.target.value)} placeholder="2027-spring" className={inp} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-text-base">Ангийн нэр</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={source.name} className={inp} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-base">
            <CalendarDaysIcon className="size-4 text-text-muted" /> Айлчлалын огноо ба цаг
          </span>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inp} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-base">
            <PhoneIcon className="size-4 text-text-muted" /> Сануулгын утас (заавал биш)
          </span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9911xxxx" inputMode="tel" className={inp} />
        </label>

        <button
          type="button"
          onClick={() => setWantReminder((v) => !v)}
          className="btn flex items-center gap-2.5 rounded-full border border-border p-3 text-left transition-all duration-150 hover:border-primary"
        >
          <span className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${wantReminder ? 'border-primary bg-primary text-text-on-primary' : 'border-border bg-surface'}`}>
            {wantReminder && <BellAlertIcon className="size-3.5" />}
          </span>
          <span className="flex flex-col">
            <span className="text-[12px] font-medium text-text-base">Утсанд календарь сануулга нэмэх</span>
            <span className="text-[11px] text-text-muted">Огноо сонгосон үед .ics файл татагдаж, утасны хуанлид сануулга үүснэ.</span>
          </span>
        </button>
      </div>
    </Modal>
  )
}

export default CarryForwardModal
