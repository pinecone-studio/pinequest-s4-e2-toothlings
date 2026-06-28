'use client'

import { useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import type { FollowUpStatus } from '@pinequest/types'
import type { BoardStudent, FollowUpUpdateVars } from '@/hooks/useBoard'
import { useChildSummary } from '@/hooks/useChildSummary'
import { useSetFollowUpStatus, useSendToParent } from '@/hooks/useBoard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StatusPicker from '@/components/ui/StatusPicker'
import StudentSummaryBody from '@/components/admin/summary/StudentSummaryBody'
import LongitudinalDeltaBar from '@/components/admin/summary/LongitudinalDeltaBar'
import { VolunteerDentistSection } from '@/components/admin/help/VolunteerDentistSection'

type Channel = 'sms' | 'call' | 'in_person'
const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'sms', label: 'SMS' },
  { value: 'call', label: 'Утсаар' },
  { value: 'in_person', label: 'Биечлэн' },
]

type Props = { student: BoardStudent | null; onClose: () => void }

const FollowUpEditModal = ({ student, onClose }: Props) => {
  const setStatus = useSetFollowUpStatus()
  const send = useSendToParent()
  const { data: detail, isLoading } = useChildSummary(student?.id ?? null)

  const [localStatus, setLocalStatus] = useState<FollowUpStatus>(student?.followUpStatus ?? 'flagged')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [channel, setChannel] = useState<Channel | ''>('')
  const [notes, setNotes] = useState('')

  if (!student) return null

  const handleSave = () => {
    const vars: FollowUpUpdateVars = {
      childKey: student.childKey,
      status: localStatus,
      ...(appointmentDate && { appointmentAt: new Date(appointmentDate).toISOString() }),
      ...(channel && { notificationChannel: channel }),
      ...(notes.trim() && { notes: notes.trim() }),
    }
    setStatus.mutate(vars)
    onClose()
  }

  return (
    <Modal
      open onClose={onClose}
      title={`${student.lastName} ${student.firstName}`}
      subtitle={`${student.className} · ${student.seasonId}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Хаах</Button>
          <Button
            variant="secondary"
            onClick={() => { void send(student).catch(() => {}); onClose() }}
            disabled={!student.guardianEmail && !student.guardianPhone}
          >
            <EnvelopeIcon className="size-4" />Мсж илгээх
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={setStatus.isPending}>
            Хадгалах
          </Button>
        </>
      }
    >
      {student.seasonCount >= 2 && (() => {
        const prior = student.seasonHistory.at(-2)
        const current = student.seasonHistory.at(-1)
        return prior && current ? (
          <LongitudinalDeltaBar
            priorLevel={prior.effectiveLevel}
            currentLevel={current.effectiveLevel}
            priorSeasonId={prior.seasonId}
          />
        ) : null
      })()}
      {student.latestLevel === 'red' && (
        <VolunteerDentistSection student={student} detail={detail ?? undefined} />
      )}
      <StudentSummaryBody
        student={student}
        detail={detail}
        isLoading={isLoading}
        statusSlot={
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">Хяналтын төлөв</p>
              <StatusPicker value={localStatus} onChange={setLocalStatus} />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">Цаг товлох</p>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">Холбоо барих хэлбэр</p>
              <div className="flex gap-4">
                {CHANNELS.map((c) => (
                  <label key={c.value} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="fu-channel"
                      value={c.value}
                      checked={channel === c.value}
                      onChange={() => setChannel(c.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">Тэмдэглэл</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Тэмдэглэл..."
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
          </div>
        }
      />
    </Modal>
  )
}

export default FollowUpEditModal
