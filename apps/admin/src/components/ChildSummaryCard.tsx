'use client'

import { EnvelopeIcon, ExclamationTriangleIcon, MagnifyingGlassCircleIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import type { ChildScreeningSummary } from '@pinequest/types'
import { openParentEmail } from '@/lib/parentEmail'

type Props = { childName: string; guardianEmail: string | null; summary: ChildScreeningSummary }

const TINT: Record<string, string> = {
  green: 'border-triage-green/30 bg-triage-green-bg',
  yellow: 'border-triage-yellow/30 bg-triage-yellow-bg',
  red: 'border-triage-red/30 bg-triage-red-bg',
}
const DOT: Record<string, string> = { green: 'bg-triage-green', yellow: 'bg-triage-yellow', red: 'bg-triage-red' }
const TXT: Record<string, string> = { green: 'text-triage-green', yellow: 'text-triage-yellow', red: 'text-triage-red' }
const LABEL: Record<string, string> = { green: 'Аюулын шинж илрээгүй', yellow: 'Хяналт зөвлөв', red: 'Яаралтай хяналт' }
const STAGE: Record<string, string> = { primary: 'Сүүн шүд', mixed: 'Холимог шүд', permanent: 'Байнгын шүд' }
const SYMPTOM: Record<string, string> = {
  swelling: 'Хавдар', painDisturbingSleepOrEating: 'Нойр/хоолонд саад болсон өвдөлт',
  fever: 'Халуурах', gumPimpleOrFistula: 'Буйлны цэр', trauma: 'Гэмтэл',
}

const ChildSummaryCard = ({ childName, guardianEmail, summary: s }: Props) => {
  const lvl = s.effectiveLevel
  return (
    <div className={`rounded-2xl border p-5 shadow-(--shadow-card) ${TINT[lvl] ?? 'border-border bg-surface'}`}>
      {/* Status header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`flex size-9 items-center justify-center rounded-full ${DOT[lvl]}`}>
            <span className="text-[13px] font-bold text-white">AI</span>
          </span>
          <div>
            <p className={`text-[15px] font-semibold ${TXT[lvl]}`}>{LABEL[lvl] ?? lvl}</p>
            <p className="text-[11px] text-text-muted">
              {s.reviewedLevel ? 'Эмч баталгаажуулсан' : 'AI урьдчилсан · эмч хараахан хянаагүй'}
            </p>
          </div>
        </div>
        <button
          onClick={() => openParentEmail(childName, guardianEmail, s)}
          className="btn flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-primary-hover"
        >
          <EnvelopeIcon className="size-4" /> Эцэг эхэд илгээх
        </button>
      </div>

      {/* Hedged headline */}
      <p className="mb-4 text-[13px] leading-relaxed text-text-base">{s.headline}</p>

      {/* Signal tiles */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-border bg-surface p-3">
          <MagnifyingGlassCircleIcon className="mb-1 size-4 text-text-muted" />
          <p className="text-[18px] font-bold text-text-base">{s.flaggedAreas}</p>
          <p className="text-[10px] leading-tight text-text-muted">Шалгуулах хэсэг</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <ExclamationTriangleIcon className="mb-1 size-4 text-text-muted" />
          <p className="text-[18px] font-bold text-text-base">{s.symptoms.length}</p>
          <p className="text-[10px] leading-tight text-text-muted">Шинж тэмдэг</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <FaceSmileIcon className="mb-1 size-4 text-text-muted" />
          <p className="text-[18px] font-bold text-text-base">{s.ageYears}</p>
          <p className="text-[10px] leading-tight text-text-muted">{STAGE[s.dentitionStage]}</p>
        </div>
      </div>

      {/* Reported symptoms */}
      {s.symptoms.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {s.symptoms.map((k) => (
            <span key={k} className="rounded-full bg-triage-red-bg px-2.5 py-1 text-[11px] font-medium text-triage-red">
              {SYMPTOM[k] ?? k}
            </span>
          ))}
        </div>
      )}

      {/* Home steps */}
      <div className="rounded-xl border border-border bg-surface p-3.5">
        <p className="mb-2 text-[12px] font-semibold text-text-base">Гэртээ хийх зөвлөмж</p>
        <ul className="flex flex-col gap-1.5">
          {s.homeSteps.map((step, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-text-muted">
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${DOT[lvl]}`} />
              {step}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-text-muted">
        Энэ бол урьдчилсан скрининг — онош биш. Эцсийн дүгнэлтийг шүдний эмч баталгаажуулна.
        <span className="ml-1 font-mono">({s.contentVersion})</span>
      </p>
    </div>
  )
}

export default ChildSummaryCard
