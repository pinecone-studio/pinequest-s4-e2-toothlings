'use client'

import { useState } from 'react'
import {
  Baby,
  Milk,
  Smile,
  SmilePlus,
  Sparkle,
  Star,
  Layers,
  GraduationCap,
  UserRound,
  AlarmClock,
  AlertTriangle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import {
  CariesTone,
  Stage,
  STAGES,
  CARIES_SIGNS,
  ROUTINE,
  EMERGENCY,
  SCHEDULE,
} from './DentalGuide'

/* ─────────────────────────────────────────────────────────────────
   One distinct icon per age stage so the timeline actually reads as
   a progression instead of the same face repeated nine times.
   Keyed by stage id — falls back to Smile if a new stage is added
   without updating this map.
   ───────────────────────────────────────────────────────────────── */
const STAGE_ICONS: Record<string, LucideIcon> = {
  '0-6m': Baby,
  '6-12m': Milk,
  '1-2y': Smile,
  '2-3y': SmilePlus,
  '3-6y': Sparkle,
  '6-7y': Star,
  '7-12y': Layers,
  '12-14y': GraduationCap,
  '17-25y': UserRound,
}

/* ─────────────────────────────────────────────────────────────────
   UI primitives
   ───────────────────────────────────────────────────────────────── */
function ToneBadge({ tone, children }: { tone: CariesTone; children: React.ReactNode }) {
  const map = {
    green: 'text-[var(--color-triage-green)] bg-[var(--color-triage-green-bg)]',
    yellow: 'text-[var(--color-triage-yellow)] bg-[var(--color-triage-yellow-bg)]',
    red: 'text-[var(--color-triage-red)] bg-[var(--color-triage-red-bg)]',
  } as const
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  )
}

function StageSelector({
  stages,
  activeId,
  onSelect,
}: {
  stages: Stage[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const length = stages.length
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.id === activeId),
  )

  // Dots sit at the center of each equal-width grid column, i.e. at
  // ((i + 0.5) / length) * 100% along the row. Anchoring the track to
  // the first and last dot centers (not arbitrary px) keeps it aligned
  // no matter how many stages there are or how wide the container is.
  const centerPct = (i: number) => ((i + 0.5) / length) * 100
  const trackLeft = centerPct(0)
  const trackWidth = centerPct(length - 1) - trackLeft
  const fillWidth = activeIndex === 0 ? 0 : centerPct(activeIndex) - trackLeft

  return (
    <div className="relative">
      {/* track — spans exactly from the first dot's center to the last dot's center */}
      <div
        className="pointer-events-none absolute top-[19px] h-[3px] rounded-full bg-[var(--color-border)]"
        style={{ left: `${trackLeft}%`, width: `${trackWidth}%` }}
      />
      {/* filled progress — same anchor, grows to the active dot's center */}
      <div
        className="pointer-events-none absolute top-[19px] h-[3px] rounded-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
        style={{ left: `${trackLeft}%`, width: `${fillWidth}%` }}
      />

      <div
        className="grid w-full pb-2"
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      >
        {stages.map((s, i) => {
          const active = s.id === activeId
          const done = i < activeIndex
          const Icon = STAGE_ICONS[s.id] ?? Smile
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
              className="btn group relative z-10 flex flex-col items-center gap-2 px-1 pt-1"
            >
              <span
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  active
                    ? 'scale-110 border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-[var(--shadow-glow-gold)]'
                    : done
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-text-muted group-hover:border-[var(--color-primary)] group-hover:text-text-base'
                }`}
              >
                <Icon size={16} strokeWidth={2.25} />
              </span>
              <span
                className={`max-w-full truncate text-center text-[10px] font-semibold leading-tight transition-colors sm:text-[11px] ${
                  active ? 'text-text-base' : 'text-text-muted group-hover:text-text-secondary'
                }`}
              >
                {s.range}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StageDetail({ stage }: { stage: Stage }) {
  const Icon = STAGE_ICONS[stage.id] ?? Smile
  return (
    <div key={stage.id} className="warm-card list-in p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            stage.highlight
              ? 'bg-[var(--color-primary)] text-[var(--color-text-on-primary)]'
              : 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] dark:text-[#AEAEB2]'
          }`}
        >
          <Icon size={20} strokeWidth={2.25} />
        </span>
        <div>
          <p className="warm-section-label">{stage.range}</p>
          <h3 className="text-lg font-bold text-text-base">{stage.title}</h3>
        </div>
        {stage.highlight && <ToneBadge tone="yellow">Чухал үе</ToneBadge>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Хүлээгдэх байдал
          </p>
          <ul className="space-y-2">
            {stage.expect.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary dark:text-[#AEAEB2]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-chart-3)]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Асран хамгаалагч юу хийх вэ
          </p>
          <ul className="space-y-2">
            {stage.care.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary dark:text-[#AEAEB2]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────── */
export default function InformationPage() {
  const [activeStageId, setActiveStageId] = useState<string>(
    STAGES.find((s) => s.highlight)?.id ?? STAGES[0].id,
  )
  const activeStage = STAGES.find((s) => s.id === activeStageId) ?? STAGES[0]

  return (
    <div className="page-in-wrap mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-base">Мэдээлэл</h1>
        <p className="mt-1 text-sm text-text-muted">
          Хүүхдийн шүдний хөгжил ба асран хамгаалагчдад зориулсан гарын авлага
        </p>
      </div>

      {/* Stage selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Baby size={18} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Насны үе шат сонгох
          </h2>
        </div>
        <StageSelector stages={STAGES} activeId={activeStageId} onSelect={setActiveStageId} />
        <StageDetail stage={activeStage} />
      </section>

      {/* Caries signs */}
      <section className="warm-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
          Цооролтын тухай онцгой анхаарах зүйл
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CARIES_SIGNS.map((c) => (
            <div key={c.label} className="warm-inset p-4">
              <ToneBadge tone={c.tone}>{c.label}</ToneBadge>
              <p className="mt-3 text-sm text-text-secondary dark:text-[#AEAEB2]">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Routine table */}
      <section className="warm-card overflow-hidden">
        <h2 className="px-5 pt-5 text-sm font-semibold uppercase tracking-wide text-text-muted">
          Гэрийн тогтмол дэглэм
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3 font-semibold">Нас</th>
                <th className="px-3 py-3 font-semibold">Сойзны хэмжээ</th>
                <th className="px-3 py-3 font-semibold">Ооны хэмжээ</th>
                <th className="px-3 py-3 font-semibold">Угаах удаа</th>
                <th className="px-3 py-3 font-semibold">Насанд хүрэгчдийн тусламж</th>
              </tr>
            </thead>
            <tbody>
              {ROUTINE.map((r) => (
                <tr key={r.age} className="row-hover border-b border-border-muted last:border-0">
                  <td className="px-5 py-3 font-medium text-text-base">{r.age}</td>
                  <td className="px-3 py-3 text-text-secondary dark:text-[#AEAEB2]">{r.brush}</td>
                  <td className="px-3 py-3 text-text-secondary dark:text-[#AEAEB2]">{r.paste}</td>
                  <td className="px-3 py-3 text-text-secondary dark:text-[#AEAEB2]">{r.freq}</td>
                  <td className="px-3 py-3 text-text-secondary dark:text-[#AEAEB2]">{r.help}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-5" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Emergency */}
        <section className="warm-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-[var(--color-triage-red)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Хэзээ яаралтай эмчид хандах вэ
            </h2>
          </div>
          <ul className="space-y-2.5">
            {EMERGENCY.map((e, i) => (
              <li
                key={i}
                className="flex gap-2.5 rounded-xl bg-[var(--color-triage-red-bg)] px-3 py-2.5 text-sm text-text-secondary dark:text-[#AEAEB2]"
              >
                <AlarmClock size={16} className="mt-0.5 shrink-0 text-[var(--color-triage-red)]" />
                {e}
              </li>
            ))}
          </ul>
        </section>

        {/* Schedule */}
        <section className="warm-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Шүдний эмчид үзүүлэх хуваарь
            </h2>
          </div>
          <ul className="space-y-3">
            {SCHEDULE.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl bg-[var(--color-surface-raised)] px-3 py-3"
              >
                <s.icon size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-text-base">{s.title}</p>
                  <p className="text-sm text-text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-center text-xs text-text-muted">
        Энэхүү мэдээлэл нь ерөнхий зааварчилгаа бөгөөд таны хүүхдийн бие даасан онцлогоос хамааран
        эмчийн зөвлөгөө ялгаатай байж болно. Эргэлзээтэй тохиолдолд шүдний эмчид хандана уу.
      </p>
    </div>
  )
}
