'use client'

import type { ReactNode } from 'react'
import { CheckCircleIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid'
import type { BoardStudent } from '@/hooks/useBoard'
import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { childSummaryNarrative } from '@pinequest/core'
import { ImageGallery, EmptyQuestionnairePanel, RawQuestionnairePanel, HospitalGuidePanel, TRIAGE_BADGE, TRIAGE_LABEL } from './SummaryPanels'
import { GuidanceSections } from '@/components/consumer/caries/GuidanceSections'
import Skeleton from '@/components/ui/Skeleton'
import { formatSeason } from '@/lib/season'

type Props = {
  student: BoardStudent
  detail: ChildSummaryPayload | undefined
  isLoading: boolean
  statusSlot?: ReactNode      // follow-up status control (FollowUpEditModal only)
}

// Shared body for every student-summary modal — image, triage, questionnaire,
// contact info, AI advice, hospital. One source of truth → both modals identical.
const StudentSummaryBody = ({ student, detail, isLoading, statusSlot }: Props) => {
  const level = student.latestLevel ?? 'none'
  const summary = detail?.summary
  const date = student.screenedAt
    ? new Date(student.screenedAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'
  const name = `${student.lastName} ${student.firstName}`.trim()

  // Утсан дээр гарсан Gemini дүгнэлт. Урт текстийг өгүүлбэр бүрээр салгаж мөр болгоно (утастай ижил).
  const adviceText = detail?.advice?.trim() || ''
  const adviceConclusion = adviceText
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const guidance = detail?.guidance

  return (
    <div className="flex flex-col gap-4">
      <ImageGallery refs={detail?.imageRefs ?? []} screeningId={detail?.summary?.screeningId} />

      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${TRIAGE_BADGE[level] ?? 'border border-border bg-surface-raised text-text-muted'}`}>
          {TRIAGE_LABEL[level] ?? 'Шалгаагүй'}
        </span>
        {(detail?.screeningCount ?? 0) > 1 && (
          <span title={`${detail!.screeningCount} удаа шалгагдсан`} className="flex size-6 items-center justify-center rounded-full border border-border bg-surface-raised text-[12px] font-bold tabular-nums text-text-muted">{detail!.screeningCount}</span>
        )}
      </div>

      {isLoading && <Skeleton className="h-28 rounded-2xl" />}
      {/* Мобайл дата (questionnaireRaw) байвал утсан дээр асуусан яг хариултыг харуулна; web дээр
          5 асуулт асуудаггүй тул "Асуумж байхгүй" төлөвийг харуулна. */}
      {!isLoading && (detail?.questionnaireRaw?.length
        ? <RawQuestionnairePanel answers={detail.questionnaireRaw} />
        : <EmptyQuestionnairePanel />)}

      <div className="rounded-2xl bg-surface-raised px-4">
        {[['Хийсэн огноо', date], ['Анги', `${student.className} — ${formatSeason(student.seasonId)}`]].map(([l, v]) => (
          <div key={l} className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
            <span className="shrink-0 text-[12px] text-text-muted">{l}</span>
            <span className="text-right text-[13px] font-medium text-text-base">{v}</span>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4 border-b border-border py-2.5">
          <span className="shrink-0 text-[12px] text-text-muted">Эцэг эхийн утас</span>
          <span>{student.guardianPhone ? <a href={`tel:${student.guardianPhone}`} className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"><PhoneIcon className="size-3.5" />{student.guardianPhone}</a> : <span className="text-[13px] text-text-muted">—</span>}</span>
        </div>
        <div className="flex items-start justify-between gap-4 py-2.5">
          <span className="shrink-0 text-[12px] text-text-muted">Эцэг эхийн имэйл</span>
          <span>{student.guardianEmail ? <a href={`mailto:${student.guardianEmail}`} className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"><EnvelopeIcon className="size-3.5" />{student.guardianEmail}</a> : <span className="text-[13px] text-text-muted">—</span>}</span>
        </div>
      </div>

      {/* Дүгнэлт + зөвлөгөө — утсан дээр гарсан Gemini-ийн advice/guidance-ийг яг тэр хэвээр харуулна.
          Gemini байхгүй (offline) бол core narrative + гэрийн алхмууд руу буцна. */}
      {(adviceText || summary) && (
        <div className="rounded-2xl border border-triage-yellow/20 bg-triage-yellow-bg p-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-triage-yellow">{name}-д тохирсон зөвлөгөө</p>
          {adviceText
            ? adviceConclusion.map((line, i) => (
                <p key={i} className="mb-1.5 text-[12px] leading-relaxed text-text-muted last:mb-0">{line}</p>
              ))
            : summary && (
                <>
                  <p className="mb-2 text-[12px] leading-relaxed text-text-muted">{name}, {childSummaryNarrative(summary)}</p>
                  <p className="text-[13px] font-semibold leading-snug text-text-base">{summary.headline}</p>
                </>
              )}
          {/* Gemini guidance байхгүй (offline) үед л core-ийн гэрийн алхмуудыг энд харуулна. */}
          {!guidance && (summary?.homeSteps.length ?? 0) > 0 && (
            <>
              <p className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Гэрийн нөхцөлд авах арга хэмжээ</p>
              <ul className="flex flex-col gap-2">
                {(summary?.homeSteps ?? []).map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
                    <CheckCircleIcon className="mt-0.5 size-3.5 shrink-0 text-triage-yellow/70" />{step}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {/* Дэлгэрэнгүй зөвлөмж — скрининг дашбордтой ЯГ ИЖИЛ рендер (GuidanceSections). */}
      {guidance && <GuidanceSections guidance={guidance} />}
      {!adviceText && !summary && !isLoading && (
        <p className="rounded-2xl border border-border bg-surface-raised p-4 text-[13px] text-text-muted">Энэ сурагч шалгагдаагүй байна.</p>
      )}

      {detail?.hospital && <HospitalGuidePanel h={detail.hospital} />}

      {statusSlot}
    </div>
  )
}

export default StudentSummaryBody
