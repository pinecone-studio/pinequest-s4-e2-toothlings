'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/consumer/AppShell'
import { BrushOrientation3D } from '@/components/consumer/BrushOrientation3D'
import { BrushZoneCoverage } from '@/components/consumer/BrushZoneCoverage'
import { ToothModel } from '@/components/consumer/ToothModel'
import { useEsp32Imu } from '@/hooks/useEsp32Imu'
import { useBrushRecognizer } from '@/hooks/useBrushRecognizer'
import { useBrushMl } from '@/hooks/useBrushMl'
import { BrushArchMonitor } from '@/components/consumer/BrushArchMonitor'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import Button from '@/components/ui/Button'
import { DEFAULT_ESP32_WS_URL, isValidEsp32WsUrl } from '@/lib/esp32Imu'
import {
  overallProgress,
  quadrantProgress,
  totalBrushSeconds,
} from '@/lib/brush/coverage'
import { SESSION_TARGET_SECONDS } from '@/lib/brush/config'
import {
  getBrushSession,
  saveBrushSession,
  type BrushZone,
} from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

type BrushTab = 'instructions' | 'monitor'

const TABS: { id: BrushTab; label: string }[] = [
  { id: 'instructions', label: 'Заавар' },
  { id: 'monitor', label: 'Ухаалаг хяналт' },
]

const STEPS = [
  '2 минут — нийт хугацаа',
  '4 бүс × 30 сек — дээд/доод зүүн/баруун',
  '45° өнцөг — сойзны үзүүр шүд, гуурст хүрэлцэх',
  'Гадна, дотор, жевхэн тал бүгдийг давтах',
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
      <div className="border-t border-[#E0E0E0]/60 px-5 py-4">
        <p className="text-[15px] font-semibold text-slate-900">Видео заавар</p>
        <p className="mt-1 text-[13px] text-text-muted">Bass угаалгын техник — 2 минут</p>
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

    <ol className="warm-card relative md:col-span-2 p-6">
      {STEPS.map((step, i) => {
        const [lead, detail] = step.split(' — ')
        const last = i === STEPS.length - 1
        return (
          <li key={i} className="relative flex gap-4 pb-7 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className="absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px -translate-x-1/2 bg-[#F3B900]/30"
              />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F3B900] text-[13px] font-bold text-slate-900 shadow-[0_2px_8px_rgba(243,185,0,0.35)]">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-[14px] font-semibold text-slate-900">{lead}</p>
              {detail ? <p className="mt-0.5 text-[13px] text-text-muted">{detail}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  </div>
)

const WS_URL_STORAGE_KEY = 'esp32.wsUrl'

const MonitorPanel = () => {
  const [running, setRunning] = useState(false)
  const [wsUrl, setWsUrl] = useState(DEFAULT_ESP32_WS_URL)
  const [wsReady, setWsReady] = useState(false)

  const recognizer = useBrushRecognizer()
  const { status, reading, trackerRef, fusionMode, error, reconnect, calibrate } = useEsp32Imu(
    wsUrl,
    wsReady,
    recognizer.handleSample,
  )

  const { coverage, currentZone, modelStatus, livePred } = recognizer
  const { mlState, reset: resetMl } = useBrushMl(currentZone, running)

  useEffect(() => {
    const savedUrl = localStorage.getItem(WS_URL_STORAGE_KEY)?.trim()
    if (savedUrl && isValidEsp32WsUrl(savedUrl)) setWsUrl(savedUrl)
    setWsReady(true)
  }, [])

  useEffect(() => {
    getBrushSession() // keep last session for history; live coverage starts fresh
  }, [])

  const handleWsUrlChange = (next: string) => {
    setWsUrl(next)
    if (isValidEsp32WsUrl(next)) localStorage.setItem(WS_URL_STORAGE_KEY, next.trim())
  }

  const handleCalibrate = () => {
    calibrate()
    recognizer.calibrate()
  }

  const activeSeconds = Math.round(totalBrushSeconds(coverage))
  const overall = overallProgress(coverage)

  const start = () => {
    recognizer.resetCoverage()
    resetMl()
    recognizer.setRunning(true)
    setRunning(true)
  }
  const stop = () => {
    recognizer.setRunning(false)
    setRunning(false)
    const zones: Record<BrushZone, number> = {
      UL: Math.round(quadrantProgress(coverage, 'UL') * 100),
      UR: Math.round(quadrantProgress(coverage, 'UR') * 100),
      LL: Math.round(quadrantProgress(coverage, 'LL') * 100),
      LR: Math.round(quadrantProgress(coverage, 'LR') * 100),
    }
    saveBrushSession({
      startedAt: new Date().toISOString(),
      zones,
      pressure: 'ok',
      teeth: Object.fromEntries(
        Object.entries(coverage.seconds).map(([k, v]) => [k, Math.round((v / 20) * 100)]),
      ),
      overallCoverage: overall,
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <BrushOrientation3D
          reading={reading}
          trackerRef={trackerRef}
          fusionMode={fusionMode}
          status={status}
          wsUrl={wsUrl}
          onWsUrlChange={handleWsUrlChange}
          onReconnect={reconnect}
          onCalibrate={handleCalibrate}
          error={error}
        />

        <BrushZoneCoverage
          coverage={coverage}
          currentZone={currentZone}
          modelStatus={modelStatus}
          livePred={livePred}
        />
        <BrushArchMonitor mlState={mlState} running={running} />
      </div>

      <aside className="space-y-4">
        <div className="warm-card p-6 text-center">
          <p className="warm-section-label">Идэвхтэй угаалга</p>
          <p className="mt-2 font-mono text-[42px] font-bold tabular-nums text-slate-900">
            {String(Math.floor(activeSeconds / 60)).padStart(2, '0')}:
            {String(activeSeconds % 60).padStart(2, '0')}
          </p>
          <p className="text-[13px] text-slate-500">Зорилт 02:00 (бодит хөдөлгөөн)</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8E8E8]">
            <div
              className="h-full rounded-full bg-[#F3B900] transition-all"
              style={{ width: `${Math.min(100, (activeSeconds / SESSION_TARGET_SECONDS) * 100)}%` }}
            />
          </div>
        </div>

        <div className="warm-card p-6">
          <p className="text-[14px] font-semibold text-text-base">Нийт хамралт</p>
          <p className="mt-2 text-[32px] font-bold text-text-base">{overall}%</p>
          <p className="mt-1 text-[12px] text-text-muted">12 бүс · гадна/дотор/зажлах гадаргуу</p>
        </div>

        {!running ? (
          <Button
            size="lg"
            className="w-full rounded-full bg-[#F3B900] text-slate-900 hover:bg-[#E5AD00]"
            onClick={start}
          >
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
      eyebrow="Угаалга"
      title="Шүд угаалга"
      subtitle={tab === 'instructions' ? 'Видео · 3D анимац · 45° өнцөг' : 'Хамралтын хяналт · бодит цаг'}
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
