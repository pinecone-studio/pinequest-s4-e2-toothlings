'use client'

import {
  overallProgress,
  quadrantProgress,
  surfaceProgress,
  zoneStatus,
  type CoverageState,
  type ZoneStatus,
} from '@/lib/brush/coverage'
import {
  brushLabelMn,
  quadrantLabelMn,
  surfaceLabelMn,
  QUADRANTS,
  SURFACES,
  type BrushQuadrant,
} from '@/lib/brush/zones'
import type { BrushModelStatus, BrushLivePred } from '@/hooks/useBrushRecognizer'

const STATUS_BAR: Record<ZoneStatus, string> = {
  clean: 'bg-emerald-500',
  partial: 'bg-amber-400',
  missed: 'bg-slate-300',
}

const STATUS_TEXT: Record<ZoneStatus, string> = {
  clean: 'text-emerald-600',
  partial: 'text-amber-600',
  missed: 'text-slate-400',
}

const MODEL_BADGE: Record<BrushModelStatus, { label: string; tone: string }> = {
  loading: { label: 'Загвар ачаалж байна…', tone: 'bg-slate-100 text-slate-500' },
  model: { label: 'ML загвар идэвхтэй', tone: 'bg-emerald-100 text-emerald-700' },
  heuristic: { label: 'Чиглэлийн heuristic (загвар сургаагүй)', tone: 'bg-amber-100 text-amber-700' },
  error: { label: 'Загвар ачаалахад алдаа — heuristic', tone: 'bg-red-100 text-red-700' },
}

type Props = {
  coverage: CoverageState
  currentZone: string
  modelStatus: BrushModelStatus
  livePred: BrushLivePred | null
}

const SurfaceRow = ({
  coverage,
  quadrant,
  surface,
  active,
}: {
  coverage: CoverageState
  quadrant: BrushQuadrant
  surface: (typeof SURFACES)[number]
  active: boolean
}) => {
  const progress = surfaceProgress(coverage, quadrant, surface)
  const status = zoneStatus(progress)
  return (
    <div className="flex items-center gap-2">
      <span className={`w-12 text-[11px] ${active ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
        {surfaceLabelMn(surface)}
      </span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0EBE3]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${STATUS_BAR[status]} ${
            active ? 'ring-2 ring-[#F3B900] ring-offset-1' : ''
          }`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <span className={`w-8 text-right font-mono text-[11px] ${STATUS_TEXT[status]}`}>
        {Math.round(progress * 100)}
      </span>
    </div>
  )
}

const QuadrantCard = ({
  coverage,
  quadrant,
  currentZone,
}: {
  coverage: CoverageState
  quadrant: BrushQuadrant
  currentZone: string
}) => {
  const qProgress = quadrantProgress(coverage, quadrant)
  const isActiveQuadrant = currentZone.startsWith(`${quadrant}-`)
  return (
    <div
      className={`rounded-2xl border p-3 transition ${
        isActiveQuadrant ? 'border-[#F3B900] bg-[#F3B900]/5' : 'border-[#E8E4DA] bg-white'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-slate-900">{quadrantLabelMn(quadrant)}</p>
        <p className="font-mono text-[12px] font-bold text-slate-500">{Math.round(qProgress * 100)}%</p>
      </div>
      <div className="space-y-1.5">
        {SURFACES.map((s) => (
          <SurfaceRow
            key={s}
            coverage={coverage}
            quadrant={quadrant}
            surface={s}
            active={currentZone === `${quadrant}-${s}`}
          />
        ))}
      </div>
    </div>
  )
}

export const BrushZoneCoverage = ({ coverage, currentZone, modelStatus, livePred }: Props) => {
  const overall = overallProgress(coverage)
  const badge = MODEL_BADGE[modelStatus]

  return (
    <div className="warm-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Бүсийн хамралт
          </p>
          <p className="mt-0.5 text-[13px] text-slate-600">
            Одоо угааж буй:{' '}
            <span className="font-semibold text-slate-900">{brushLabelMn(currentZone)}</span>
            {livePred && livePred.source === 'model' && (
              <span className="ml-1 text-[11px] text-slate-400">
                ({Math.round(livePred.confidence * 100)}%)
              </span>
            )}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.tone}`}>
          {badge.label}
        </span>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0EBE3]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${overall}%` }}
          />
        </div>
        <span className="font-mono text-[14px] font-bold text-slate-900">{overall}%</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {QUADRANTS.map((q) => (
          <QuadrantCard key={q} coverage={coverage} quadrant={q} currentZone={currentZone} />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Ногоон = сайн угаасан · шар = дутуу · саарал = угаагаагүй. Зөвхөн сойзоо хөдөлгөж
        (scrubbing) байгаа үед оноо нэмэгдэнэ.
      </p>
    </div>
  )
}
