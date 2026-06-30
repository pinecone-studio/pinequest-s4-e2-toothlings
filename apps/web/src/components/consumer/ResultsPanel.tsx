'use client'

import Link from 'next/link'
import { Video, MapPin, AlertTriangle } from '@/lib/icons'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { TriageHeroCard } from '@/components/consumer/MobilePatterns'
import { ScheduleAppointmentModal } from '@/components/consumer/ScheduleAppointmentModal'
import { useState } from 'react'
import { ROUTES } from '@/lib/routes'
import { getMeta, LOTTIE_SRC } from './types'
import type { ScanResult, ScanDetection } from '@/lib/consumerState'

const DetectionItem = ({ d }: { d: ScanDetection }) => {
  const meta = getMeta(d)
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-raised px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="text-base leading-none">{meta.emoji}</span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-text-base">{meta.label}</p>
          {meta.description && (
            <p className="truncate text-[12px] text-text-muted">{meta.description}</p>
          )}
        </div>
      </div>
      <span className="shrink-0 text-[13px] font-bold tabular-nums text-text-base">
        {(d.confidence * 100).toFixed(1)}%
      </span>
    </div>
  )
}

export const ResultsPanel = ({ result }: { result: ScanResult }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const triageLevel =
    result.triage === 'red' ? 'red' : result.triage === 'yellow' ? 'yellow' : 'green'
  const triageLabel =
    triageLevel === 'red'
      ? 'Яаралтай эмчилгээ хийлгэх'
      : triageLevel === 'yellow'
        ? 'Анхаарал шаардлагатай'
        : 'Хэвийн байдалтай'

  const problemDetections = result.detections.filter((d) => d.label !== 'Healthy')
  const healthyDetections = result.detections.filter((d) => d.label === 'Healthy')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-text-base">Үр дүн</h2>
        <p className="mt-1 text-[13px] text-text-muted">
          Шинжилгээ: Gemini AI Vision (судалгаа / демо)
        </p>
      </div>

      <TriageHeroCard level={triageLevel} label={triageLabel} summary={result.advice} />

      {triageLevel === 'green' && (
        <FlatCard className="p-6">
          <p className="text-[12px] font-bold uppercase tracking-wide text-text-muted">Зөвлөмж</p>
          <p className="mt-4 text-[15px] leading-relaxed text-text-base">{result.advice}</p>
        </FlatCard>
      )}

      {problemDetections.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-text-muted">
            Илрүүлсэн асуудал ({problemDetections.length})
          </p>
          <div className="space-y-2">
            {problemDetections.map((d, i) => (
              <DetectionItem key={i} d={d} />
            ))}
          </div>
        </div>
      )}

      {healthyDetections.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-text-muted">
            Эрүүл хэсэг ({healthyDetections.length})
          </p>
          <div className="space-y-2">
            {healthyDetections.map((d, i) => (
              <DetectionItem key={i} d={d} />
            ))}
          </div>
        </div>
      )}

      {result.detections.length === 0 && (
        <p className="text-[14px] text-text-muted">Илрүүлсэн зүйл байхгүй байна.</p>
      )}

      {triageLevel === 'red' && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Video className="size-5" strokeWidth={2} />
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-text-base">
            Шүдний эмчтэй видео дуудлага хийж зөвөлгөө авах
          </p>
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="btn shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover"
          >
            Цаг авах
          </button>
        </div>
      )}

      {(triageLevel === 'red' || triageLevel === 'yellow') && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-muted">
            <MapPin className="size-5" strokeWidth={2} />
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-text-base">
            Санал болгох хамгийн ойр шүдний эмнэлэг
          </p>
          <Link
            href={ROUTES.doctor.map}
            className="btn shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-base transition hover:border-primary"
          >
            Харах
          </Link>
        </div>
      )}

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        Бид зурагт үндэслэсэн дүгнэлт гаргаж амны хөндийн байдлыг үнэлэн чиглүүлэх зорилготой.
      </p>

      <ScheduleAppointmentModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </div>
  )
}

// ── Үр дүн гараагүй үед placeholder ─────────────────────────────────────────

export const ResultsPlaceholder = ({ analyzing }: { analyzing: boolean }) => (
  <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center">
    {analyzing ? (
      <>
        <DotLottieReact src={LOTTIE_SRC} loop autoplay style={{ width: 120, height: 120 }} />
        <p className="mt-4 text-[15px] font-semibold text-text-base">AI шинжилж байна…</p>
        <p className="mt-1 text-[13px] text-text-muted">Хэдэн секунд хүлээнэ үү</p>
      </>
    ) : (
      <>
        <p className="text-[17px] font-bold text-text-base">Дүгнэлт энд харагдана</p>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-text-muted">
          Зураг оруулсны дараа эхлэх товчийг дарна уу.
        </p>
      </>
    )}
  </div>
)
