'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell, StatusPill } from '@/components/consumer/AppShell'
import { BrushArchMonitor } from '@/components/consumer/BrushArchMonitor'
import { ToothModel } from '@/components/consumer/ToothModel'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import Button from '@/components/ui/Button'
import {
  createBrushMlState,
  processSensorFrame,
  synthesizeSensorFrame,
  teethToCoverageMap,
  type BrushMlState,
} from '@/lib/brushMl'
import {
  getBrushSession,
  saveBrushSession,
  type BrushZone,
} from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

type BrushTab = 'instructions' | 'monitor'

const TABS: { id: BrushTab; label: string }[] = [
  { id: 'instructions', label: 'Заавар' },
  { id: 'monitor', label: 'Smart Monitor' },
]

const STEPS = [
  '2 минут — нийт хугацаа',
  '4 бүс × 30 сек — дээд/доод зүүн/баруун',
  '45° өнцөг — сойзны үзүүр шүд, гуурст хүрэлцэх',
  'Гадна, дотор, жевхэн тал бүгдийг давтах',
]

const ZONES: { id: BrushZone; label: string }[] = [
  { id: 'UL', label: 'Дээд зүүн' },
  { id: 'UR', label: 'Дээд баруун' },
  { id: 'LL', label: 'Доод зүүн' },
  { id: 'LR', label: 'Доод баруун' },
]

const BRUSH_VIDEO_ID = 'gAODutgIIVQ'

const InstructionsPanel = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <div className="warm-card overflow-hidden p-0">
      <div className="aspect-video w-full bg-slate-900">
        <iframe
          src={`https://www.youtube.com/embed/${BRUSH_VIDEO_ID}`}
          title="Шүд угаах заавар"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
      <div className="border-t border-[#E8E4DA]/60 px-5 py-4">
        <p className="text-[15px] font-semibold text-slate-900">Видео заавар</p>
        <p className="mt-1 text-[13px] text-slate-500">Bass &amp; Supervise техник — 2 минут</p>
        <a
          href={`https://youtu.be/${BRUSH_VIDEO_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[12px] font-semibold text-[#B8860B] hover:underline"
        >
          YouTube дээр нээх →
        </a>
      </div>
    </div>

    <div className="flex flex-col items-center">
      <ToothModel zoneScores={{ UL: 25, UR: 25, LL: 20, LR: 18 }} />
      <p className="mt-6 text-[14px] font-semibold text-slate-900">3D анимац — зөв угаалгын чиглэл</p>
      <p className="mt-2 text-center text-[13px] text-slate-500">45° өнцөг, бүс бүр 30 секунд</p>
    </div>

    <ol className="grid gap-3 md:col-span-2 md:grid-cols-2">
      {STEPS.map((step, i) => (
        <li key={i} className="warm-card flex gap-4 p-5 text-[14px] text-slate-700">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#F3B900]/15 text-[13px] font-bold text-[#B8860B]">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  </div>
)

const MonitorPanel = () => {
  const [activeZone, setActiveZone] = useState<BrushZone>('UL')
  const [seconds, setSeconds] = useState<Record<BrushZone, number>>({ UL: 0, UR: 0, LL: 0, LR: 0 })
  const [pressure, setPressure] = useState<'low' | 'ok' | 'high'>('ok')
  const [running, setRunning] = useState(false)
  const [mlState, setMlState] = useState<BrushMlState>(() => createBrushMlState())
  const tickRef = useRef(0)
  const mlRef = useRef(mlState)
  const secondsRef = useRef(seconds)

  mlRef.current = mlState
  secondsRef.current = seconds

  useEffect(() => {
    const saved = getBrushSession()
    if (saved) {
      setSeconds(saved.zones)
      setPressure(saved.pressure)
      if (saved.teeth) setMlState(createBrushMlState(saved.teeth))
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      tickRef.current += 1
      const r = Math.random()
      const nextPressure = r > 0.85 ? 'high' : r < 0.1 ? 'low' : 'ok'
      setPressure(nextPressure)
      setSeconds((s) => ({ ...s, [activeZone]: s[activeZone] + 1 }))

      const frame = synthesizeSensorFrame(activeZone, tickRef.current, nextPressure)
      setMlState((prev) => processSensorFrame(prev, frame))
    }, 800)
    return () => window.clearInterval(id)
  }, [running, activeZone])

  const total = Object.values(seconds).reduce((a, b) => a + b, 0)
  const start = () => {
    tickRef.current = 0
    setRunning(true)
  }
  const stop = () => {
    setRunning(false)
    saveBrushSession({
      startedAt: new Date().toISOString(),
      zones: secondsRef.current,
      pressure,
      teeth: teethToCoverageMap(mlRef.current.teeth),
      overallCoverage: mlRef.current.overallCoverage,
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <BrushArchMonitor mlState={mlState} running={running} />

        <div className="warm-card p-4">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            ML pipeline · ESP32 → IMU + даралт
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ZONES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveZone(id)}
                className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                  activeZone === id
                    ? 'border-[#F3B900] bg-[#F3B900]/10'
                    : 'border-[#E8E4DA] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-600">{label}</p>
                <p className="font-mono text-[18px] font-bold text-slate-900">{seconds[id]}s</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-slate-500">
            Бодит холболтод ESP32 WebSocket frame ирж ML model шүд бүр дээр coverage шинэчилнэ.
          </p>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="warm-card p-6 text-center">
          <p className="warm-section-label">Duration</p>
          <p className="mt-2 font-mono text-[42px] font-bold tabular-nums text-slate-900">
            {String(Math.floor(total / 60)).padStart(2, '0')}:{String(total % 60).padStart(2, '0')}
          </p>
          <p className="text-[13px] text-slate-500">Зорилт 02:00</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0EBE3]">
            <div
              className="h-full rounded-full bg-[#F3B900] transition-all"
              style={{ width: `${Math.min(100, (total / 120) * 100)}%` }}
            />
          </div>
        </div>

        <div className="warm-card p-6">
          <p className="text-[14px] font-semibold text-slate-900">ML coverage</p>
          <p className="mt-2 text-[32px] font-bold text-slate-900">{mlState.overallCoverage}%</p>
          <p className="mt-1 text-[12px] text-slate-500">32 шүд · гадна/дотор/жевхэн гадаргуу</p>
        </div>

        <div className="warm-card p-6">
          <p className="text-[14px] font-semibold text-slate-900">Сойзны даралт</p>
          <div className="mt-3">
            <StatusPill
              label={pressure === 'ok' ? 'Зөв' : pressure === 'high' ? 'Хэт их' : 'Дутуу'}
              tone={pressure === 'ok' ? 'green' : 'red'}
            />
          </div>
        </div>

        {!running ? (
          <Button size="lg" className="w-full rounded-full bg-[#F3B900] text-slate-900 hover:bg-[#E5AD00]" onClick={start}>
            Эхлэх
          </Button>
        ) : (
          <Button size="lg" variant="secondary" className="w-full rounded-full" onClick={stop}>
            Дуусгах
          </Button>
        )}

        <Link
          href={ROUTES.profile.history}
          className="block text-center text-[12px] font-semibold text-[#B8860B] hover:underline"
        >
          Түүх →
        </Link>
      </aside>
    </div>
  )
}

const BrushPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: BrushTab = tabParam === 'monitor' ? 'monitor' : 'instructions'

  const setTab = (next: BrushTab) => {
    router.replace(next === 'instructions' ? ROUTES.brush.root : `${ROUTES.brush.root}?tab=monitor`, { scroll: false })
  }

  return (
    <AppShell
      eyebrow="Smart brush"
      title="Brush"
      subtitle={tab === 'instructions' ? 'Видео · 3D анимац · 45° өнцөг' : 'ML coverage · realtime · ESP32 smart brush'}
    >
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <FilterPill key={id} label={label} active={tab === id} onClick={() => setTab(id)} />
        ))}
      </div>

      {tab === 'instructions' ? <InstructionsPanel /> : <MonitorPanel />}
    </AppShell>
  )
}

const BrushPage = () => (
  <Suspense fallback={<div className="py-12 text-center text-slate-500">Ачааллаж байна…</div>}>
    <BrushPageContent />
  </Suspense>
)

export default BrushPage
