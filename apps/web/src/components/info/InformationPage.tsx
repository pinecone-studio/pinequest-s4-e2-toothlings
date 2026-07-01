'use client'

import { useRef, useState } from 'react'
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
  CalendarClock,
  Eye,
  HeartHandshake,
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

let sharedAudioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return null
    sharedAudioCtx = new Ctx()
  }
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume()
  return sharedAudioCtx
}

function playStagePop() {
  const ctx = getAudioCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(640, now)
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.11)

  gain.gain.setValueAtTime(0.00008, now)
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.00008, now + 0.18)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.19)
}

function ToneBadge({ tone, children }: { tone: CariesTone; children: React.ReactNode }) {
  const map = {
    green: 'text-[var(--color-triage-green)] bg-[var(--color-triage-green-bg)]',
    yellow: 'text-[var(--color-triage-yellow)] bg-[var(--color-triage-yellow-bg)]',
    red: 'text-[var(--color-triage-red)] bg-[var(--color-triage-red-bg)]',
  } as const
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${map[tone]}`}
    >
      {children}
    </span>
  )
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-sm">
        <Icon size={16} strokeWidth={2.25} />
      </span>
      <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-text-muted">{children}</h2>
    </div>
  )
}

const RAIL_ITEM_WIDTH = 72

function StageRail({
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
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const centerPx = (i: number) => (i + 0.5) * RAIL_ITEM_WIDTH
  const trackLeft = centerPx(0)
  const trackWidth = centerPx(length - 1) - trackLeft
  const fillWidth = activeIndex === 0 ? 0 : centerPx(activeIndex) - trackLeft

  const handleSelect = (id: string) => {
    playStagePop()
    onSelect(id)
    setTimeout(
      () =>
        itemRefs.current[id]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        }),
      0,
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative" style={{ width: length * RAIL_ITEM_WIDTH }}>
          <div
            className="pointer-events-none absolute top-[17px] h-[2.5px] rounded-full bg-[var(--color-border)]"
            style={{ left: trackLeft, width: trackWidth }}
          />
          <div
            className="pointer-events-none absolute top-[17px] h-[2.5px] rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] transition-all duration-300 ease-out"
            style={{ left: trackLeft, width: fillWidth }}
          />

          <div className="flex">
            {stages.map((s, i) => {
              const active = s.id === activeId
              const done = i < activeIndex
              const Icon = STAGE_ICONS[s.id] ?? Smile
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    itemRefs.current[s.id] = el
                  }}
                  type="button"
                  onClick={() => handleSelect(s.id)}
                  aria-pressed={active}
                  style={{ width: RAIL_ITEM_WIDTH }}
                  className="btn group relative z-10 flex shrink-0 flex-col items-center gap-2.5 pt-1 transition-all"
                >
                  <span
                    className={`flex h-[36px] w-[36px] items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                      active
                        ? 'scale-110 border-[var(--color-primary)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-[0_8px_16px_rgba(0,0,0,0.12)]'
                        : done
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-text-muted group-hover:border-[var(--color-primary-subtle)] group-hover:bg-[var(--color-surface-raised)] group-hover:text-text-base'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <span
                    className={`max-w-full truncate text-center text-[9px] font-semibold leading-tight transition-colors duration-200 ${
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
      </div>
    </div>
  )
}

function StageDetail({ stage }: { stage: Stage }) {
  const Icon = STAGE_ICONS[stage.id] ?? Smile
  return (
    <div
      key={stage.id}
      className="relative rounded-2xl border border-[var(--color-border)] bg-transparent p-6 sm:p-7 shadow-sm transition-all"
    >
      {stage.highlight && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/5 via-transparent to-transparent" />
      )}
      <div className="relative">
        <div className="mb-6 flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${
              stage.highlight
                ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-[0_8px_16px_rgba(0,0,0,0.12)]'
                : 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
            }`}
          >
            <Icon size={24} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {stage.range}
            </p>
            <h3 className="mt-1 text-xl font-bold leading-snug text-text-base">{stage.title}</h3>
          </div>
          {stage.highlight && (
            <div className="shrink-0 pt-1">
              <ToneBadge tone="yellow">Чухал үе</ToneBadge>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Eye size={15} className="text-[var(--color-chart-3)]" />
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Хүлээгдэх байдал
              </p>
            </div>
            <ul className="space-y-3 pl-1">
              {stage.expect.map((t, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed text-text-secondary dark:text-[#AEAEB2]"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-chart-3)]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border-muted pt-6">
            <div className="flex items-center gap-2.5">
              <HeartHandshake size={15} className="text-[var(--color-primary)]" />
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Асран хамгаалагч юу хийх вэ
              </p>
            </div>
            <ul className="mt-3 space-y-3 pl-1">
              {stage.care.map((t, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed text-text-secondary dark:text-[#AEAEB2]"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-primary)]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoutineCard({ r }: { r: (typeof ROUTINE)[number] }) {
  return (
    <div className="border-l-2 border-l-[var(--color-primary)] py-4 pl-4 transition-all hover:border-l-[var(--color-primary)]">
      <p className="mb-3 text-base font-bold text-text-base">{r.age}</p>
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="inline-block min-w-fit rounded-full bg-[var(--color-primary-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
            Сойзны хэмжээ
          </span>
          <p className="text-sm text-text-base font-medium">{r.brush}</p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="inline-block min-w-fit rounded-full bg-[var(--color-chart-3)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-chart-3)]">
            Ооны хэмжээ
          </span>
          <p className="text-sm text-text-base font-medium">{r.paste}</p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="inline-block min-w-fit rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600">
            Угаах удаа
          </span>
          <p className="text-sm text-text-base font-medium">{r.freq}</p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="inline-block min-w-fit rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600">
            Тусламж
          </span>
          <p className="text-sm text-text-base font-medium">{r.help}</p>
        </div>
      </div>
    </div>
  )
}

export default function InformationPage() {
  const [activeStageId, setActiveStageId] = useState<string>(
    STAGES.find((s) => s.highlight)?.id ?? STAGES[0].id,
  )
  const activeStage = STAGES.find((s) => s.id === activeStageId) ?? STAGES[0]

  return (
    <div className="page-in-wrap flex flex-col bg-transparent md:h-[100dvh] md:overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border-muted bg-transparent px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
        <div className="mx-auto max-w-7xl">
          <div className="mb-1.5 flex items-baseline gap-2">
            <h1 className="text-3xl font-bold text-text-base">Мэдээлэл</h1>
          </div>
          <p className="text-sm text-text-muted">
            Хүүхдийн шүдний хөгжил ба асран хамгаалагчдад зориулсан гарын авлага
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-0 overflow-hidden md:flex-row">
        {/* Left: Age selector and detail */}
        <section className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto border-b border-border-muted px-4 py-5 sm:px-6 md:border-b-0 md:border-r md:px-8 md:py-6">
          <div className="sticky top-0 z-10 -mx-4 -my-5 space-y-4 bg-transparent px-4 py-5 sm:px-6 md:-mx-8 md:-my-6 md:px-8 md:py-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                <Baby size={16} strokeWidth={2.25} />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-text-muted">
                Насны үе шат сонгох
              </h2>
            </div>
            <StageRail stages={STAGES} activeId={activeStageId} onSelect={setActiveStageId} />
          </div>

          <div className="flex-1 pr-1">
            <StageDetail stage={activeStage} />
          </div>
        </section>

        {/* Right: Reference material */}
        <section className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-6">
          {/* Caries signs */}
          <div>
            <SectionLabel icon={AlertTriangle}>Цооролтын онцгой шинж</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-3">
              {CARIES_SIGNS.map((c) => (
                <div
                  key={c.label}
                  className="group rounded-xl border border-[var(--color-border)] bg-transparent p-4 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-border-muted)]"
                >
                  <ToneBadge tone={c.tone}>{c.label}</ToneBadge>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary dark:text-[#AEAEB2]">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Routine */}
          <div>
            <SectionLabel icon={Milk}>Гэрийн тогтмол дэглэм</SectionLabel>
            <div className="divide-y divide-border-muted rounded-lg border border-border-muted">
              {ROUTINE.map((r, idx) => (
                <div key={r.age} className={idx === 0 ? '' : ''}>
                  <RoutineCard r={r} />
                </div>
              ))}
            </div>
          </div>

          {/* Emergency */}
          <div>
            <SectionLabel icon={AlarmClock}>Хэзээ яаралтай эмчид хандах вэ</SectionLabel>
            <ul className="space-y-2.5">
              {EMERGENCY.map((e, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-[var(--color-triage-red-bg)] bg-[var(--color-triage-red-bg)] px-4 py-3 text-sm text-[var(--color-triage-red)] transition-all hover:shadow-sm"
                >
                  <AlarmClock size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Schedule */}
          <div className="pb-2">
            <SectionLabel icon={CalendarClock}>Шүдний эмчид үзүүлэх хуваарь</SectionLabel>
            <ul className="space-y-3">
              {SCHEDULE.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3.5 transition-all hover:shadow-md hover:border-[var(--color-border-muted)]"
                >
                  <s.icon size={17} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-text-base">{s.title}</p>
                    <p className="text-sm text-text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-muted bg-transparent px-4 py-4 sm:px-6 md:px-8">
        <p className="mx-auto max-w-7xl text-center text-xs text-text-muted">
          Энэхүү мэдээлэл нь ерөнхий зааварчилгаа бөгөөд таны хүүхдийн бие даасан онцлогоос хамааран
          эмчийн зөвлөгөө ялгаатай байж болно. Эргэлзээтэй тохиолдолд шүдний эмчид хандана уу.
        </p>
      </div>
    </div>
  )
}
