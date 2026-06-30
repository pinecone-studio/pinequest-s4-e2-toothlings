'use client'

import { useState, useEffect } from 'react'
import { EnvelopeIcon, PhoneIcon, DocumentTextIcon } from '@heroicons/react/24/solid'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StudentSummaryBody from './StudentSummaryBody'
import ChildHistoryTab from './ChildHistoryTab'
import LongitudinalDeltaBar from './LongitudinalDeltaBar'
import { useChildSummary } from '@/hooks/useChildSummary'
import { useChildHistory } from '@/hooks/useChildHistory'
import { openParentEmail, openParentSms } from '@/lib/parentEmail'
import { printChildSummary } from '@/lib/parentPdf'
import type { BoardStudent } from '@/hooks/useBoard'
import { formatSeason } from '@/lib/season'

type Tab = 'latest' | 'history' | 'chart'
const TAB_LABELS: Record<Tab, string> = { latest: 'Сүүлийн дүгнэлт', history: 'Өмнөх дүгнэлтүүд', chart: 'Динамик өөрчлөлтүүд' }

const StudentModal = ({ student, onClose }: { student: BoardStudent | null; onClose: () => void }) => {
  const [tab, setTab] = useState<Tab>('latest')
  useEffect(() => { setTab('latest') }, [student?.childKey])

  const { data: detail, isLoading } = useChildSummary(student?.id ?? null)
  const { data: history, isLoading: histLoading } = useChildHistory(
    student?.childKey ?? null,
    tab === 'history',
  )
  if (!student) return null

  const hasHistory = (student.seasonCount ?? 0) >= 2
  const name = `${student.lastName} ${student.firstName}`
  const summary = detail?.summary
  const hasEmail = !!student.guardianEmail
  const hasPhone = !!student.guardianPhone

  return (
    <Modal
      open onClose={onClose} title={name}
      subtitle={`${student.className} · ${formatSeason(student.seasonId)}`}
      size="lg"
      footer={
        <div className="flex w-full items-center gap-2">
          <button
            type="button" disabled={!summary}
            onClick={() => summary && printChildSummary(name, summary, detail?.imageRefs ?? [], detail?.hospital)}
            title="PDF үзэх/хэвлэх"
            className="btn flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          ><DocumentTextIcon className="size-4" /></button>
          <button
            type="button" disabled={!summary || !hasPhone}
            onClick={() => summary && hasPhone && openParentSms(student.guardianPhone!, name, summary)}
            title={hasPhone ? 'SMS илгээх' : 'Утасны дугаар байхгүй'}
            className="btn flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          ><PhoneIcon className="size-4" /></button>
          <button
            type="button" disabled={!summary || !hasEmail}
            onClick={() => summary && hasEmail && openParentEmail(name, student.guardianEmail, summary, detail?.hospital)}
            title={hasEmail ? 'И-мэйл илгээх' : 'И-мэйл хаяг байхгүй'}
            className="btn flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors hover:border-primary hover:text-text-base disabled:cursor-not-allowed disabled:opacity-40"
          ><EnvelopeIcon className="size-4" /></button>
          <span className="flex-1" />
          <Button variant="secondary" onClick={onClose}>Хаах</Button>
        </div>
      }
    >
      {hasHistory && (
        <div className="-mx-6 mb-4 flex border-b border-border px-6">
          {(['latest', 'history', 'chart'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-[13px] font-semibold transition-colors ${
                tab === t ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-base'
              }`}
            >{TAB_LABELS[t]}</button>
          ))}
        </div>
      )}
      {(tab === 'latest' || !hasHistory) && (() => {
        const prior = hasHistory ? student.seasonHistory.at(-2) : undefined
        const current = hasHistory ? student.seasonHistory.at(-1) : undefined
        return (
          <>
            {tab === 'latest' && prior && current && (
              <LongitudinalDeltaBar
                priorLevel={prior.effectiveLevel}
                currentLevel={current.effectiveLevel}
                priorSeasonId={prior.seasonId}
              />
            )}
            <StudentSummaryBody student={student} detail={detail} isLoading={isLoading} />
          </>
        )
      })()}
      {tab === 'history' && hasHistory && (
        histLoading
          ? <p className="py-8 text-center text-sm text-text-muted">Уншиж байна…</p>
          : <ChildHistoryTab seasons={history?.seasons ?? []} />
      )}
      {tab === 'chart' && <p className="py-12 text-center text-sm text-text-muted">Динамик өөрчлөлт үүсээгүй байна.</p>}
    </Modal>
  )
}

export default StudentModal
