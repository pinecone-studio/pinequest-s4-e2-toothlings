'use client'

import { useState, useEffect } from 'react'
import { VideoCameraIcon, CheckCircleIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { childSummaryNarrative } from '@pinequest/core'
import { ImageGallery, QuestionnairePanel, TRIAGE_BADGE, TRIAGE_LABEL } from '@/components/admin/summary/SummaryPanels'
import { useAppointmentSummary, useUpdateAppointmentNote, type AppointmentRow } from '@/hooks/useAppointments'
import { useCall } from '@/context/IncomingCallContext'
import { useToast } from '@/components/ui/Toast'
import Skeleton from '@/components/ui/Skeleton'

const fmt = (ms: number) => new Date(ms).toLocaleString('mn-MN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const countdown = (ms: number) => {
  const diff = ms - Date.now()
  if (diff <= 0) return { soon: true, text: 'Товлосон цаг болсон' }
  const h = Math.floor(diff / 3.6e6), mn = Math.round((diff % 3.6e6) / 6e4)
  if (diff < 3.6e6) return { soon: true, text: `${mn} минутын дараа` }
  if (h < 24) return { soon: false, text: `${h} цаг ${mn} минутын дараа` }
  return { soon: false, text: `${Math.round(h / 24)} өдрийн дараа` }
}

const TABS = [['summary', 'Дүгнэлт'], ['survey', 'Асуумж'], ['note', 'Зөвлөмж']] as const
type Tab = (typeof TABS)[number][0]

const CallDetailPanel = ({ appt }: { appt: AppointmentRow | null }) => {
  const { data: detail, isLoading } = useAppointmentSummary(appt?.id ?? null)
  const update = useUpdateAppointmentNote()
  const { startCall } = useCall()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('summary')
  const [note, setNote] = useState('')

  useEffect(() => { setNote(appt?.note ?? ''); setTab('summary') }, [appt?.id, appt?.note])

  if (!appt) return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center shadow-(--shadow-card)">
      <UserCircleIcon className="size-12 text-text-muted/40" />
      <p className="text-[14px] font-semibold text-text-base">Сурагч сонгоно уу</p>
      <p className="max-w-[220px] text-[12.5px] text-text-muted">Зүүн талын жагсаалтаас дуудлага сонгоход эмнэлгийн дэлгэрэнгүй энд харагдана.</p>
    </div>
  )

  const name = appt.childName ?? appt.childKey.slice(0, 8)
  const summary = detail?.summary
  const done = appt.status === 'completed'
  const cd = countdown(appt.scheduledAt)
  const save = () => update.mutate({ id: appt.id, note: note.trim() }, { onSuccess: () => toast.success('Зөвлөмж хадгалагдлаа') })

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-(--shadow-card)">
      <ImageGallery refs={detail?.imageRefs ?? []} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[18px] font-bold text-text-base">{name}</p>
          <p className="text-[12px] text-text-muted">{fmt(appt.scheduledAt)}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${TRIAGE_BADGE[appt.level]}`}>{TRIAGE_LABEL[appt.level]}</span>
      </div>

      {done ? (
        <div className="flex items-center gap-2 rounded-2xl bg-triage-green-bg px-3.5 py-2.5 text-[12.5px] font-medium text-triage-green">
          <CheckCircleIcon className="size-4 shrink-0" />
          <span>Дуудлага хийгдсэн</span>
        </div>
      ) : (
        <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[12.5px] font-medium ${cd.soon ? 'bg-primary-subtle text-primary' : 'bg-surface-raised text-text-secondary'}`}>
          <VideoCameraIcon className="size-4 shrink-0" />
          <span>Видео дуудлага {cd.text}</span>
        </div>
      )}

      <div className="flex gap-1 rounded-full bg-surface-raised p-1">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`btn flex-1 rounded-full py-1.5 text-[12.5px] font-semibold transition ${tab === key ? 'bg-surface text-text-base shadow-(--shadow-card)' : 'text-text-muted hover:text-text-base'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[140px] flex-1">
        {isLoading && <Skeleton className="h-32 rounded-2xl" />}
        {!isLoading && tab === 'summary' && (summary ? (
          <div className="rounded-2xl border border-triage-yellow/20 bg-triage-yellow-bg p-4">
            <p className="mb-2 text-[12px] leading-relaxed text-text-muted">{name}, {childSummaryNarrative(summary)}</p>
            <p className="text-[13px] font-semibold leading-snug text-text-base">{summary.headline}</p>
            {summary.homeSteps.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {summary.homeSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted"><CheckCircleIcon className="mt-0.5 size-3.5 shrink-0 text-triage-yellow/70" />{step}</li>
                ))}
              </ul>
            )}
          </div>
        ) : <p className="rounded-2xl border border-border bg-surface-raised p-4 text-[13px] text-text-muted">Энэ сурагч шалгагдаагүй байна.</p>)}

        {!isLoading && tab === 'survey' && (detail?.questionnaire
          ? <QuestionnairePanel q={detail.questionnaire} />
          : <p className="rounded-2xl border border-border bg-surface-raised p-4 text-[13px] text-text-muted">Асуумжийн мэдээлэл алга.</p>)}

        {tab === 'note' && (
          <div className="flex flex-col gap-2">
            <p className="text-[12px] text-text-muted">Дуудлага дууссаны дараа дараагийн алхмын зөвлөмжөө бичнэ үү.</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
              placeholder="Жишээ: 36-р шүдийг 2 долоо хоногт эмчлүүлэх, фтор түрхэх…"
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={save} disabled={update.isPending} className="btn self-end rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
              {update.isPending ? 'Хадгалж байна…' : 'Зөвлөмж хадгалах'}
            </button>
          </div>
        )}
      </div>

      <button onClick={() => startCall(appt.createdById, appt.childName ?? 'Сурагч')}
        className="btn flex w-full items-center justify-center gap-2 rounded-full bg-triage-red py-3 text-[14px] font-bold text-white transition hover:opacity-90">
        <VideoCameraIcon className="size-5" /> Видео дуудлага хийх
      </button>
    </div>
  )
}

export default CallDetailPanel
