'use client'

import { useEffect, useState } from 'react'
import { BrushOrientation3D } from '@/components/consumer/BrushOrientation3D'
import { BrushZoneCoverage } from '@/components/consumer/BrushZoneCoverage'
import Button from '@/components/ui/Button'
import { useEsp32Imu } from '@/hooks/useEsp32Imu'
import { useBrushRecognizer } from '@/hooks/useBrushRecognizer'
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

const WS_URL_STORAGE_KEY = 'esp32.wsUrl'

export const BrushMonitor = () => {
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

  useEffect(() => {
    const savedUrl = localStorage.getItem(WS_URL_STORAGE_KEY)?.trim()
    if (savedUrl && isValidEsp32WsUrl(savedUrl)) setWsUrl(savedUrl)
    setWsReady(true)
  }, [])

  useEffect(() => {
    getBrushSession()
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
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-(--shadow-card)">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Бүс сонгох</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ZONES.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveZone(id)}
                className={`rounded-full border px-3 py-2.5 text-left transition ${activeZone === id ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-surface-raised'}`}>
                <p className="text-[11px] font-semibold text-text-muted">{label}</p>
                <p className="font-mono text-[18px] font-bold text-text-base">{seconds[id]}s</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-(--shadow-card)">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Идэвхтэй угаалга
          </p>
          <p className="mt-2 font-mono text-[42px] font-bold tabular-nums text-text-base">
            {String(Math.floor(activeSeconds / 60)).padStart(2, '0')}:
            {String(activeSeconds % 60).padStart(2, '0')}
          </p>
          <p className="text-[13px] text-text-muted">Зорилт 02:00 (бодит хөдөлгөөн)</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (activeSeconds / SESSION_TARGET_SECONDS) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-(--shadow-card)">
          <p className="text-[14px] font-semibold text-text-base">Нийт хамралт</p>
          <p className="mt-2 text-[32px] font-bold text-text-base">{overall}%</p>
          <p className="mt-1 text-[12px] text-text-muted">12 бүс · гадна/дотор/зажлах гадаргуу</p>
        </div>

        {!running ? (
          <Button
            size="lg"
            className="w-full rounded-full bg-primary text-text-on-primary hover:opacity-90"
            onClick={start}
          >
            Эхлэх
          </Button>
        ) : (
          <Button size="lg" variant="secondary" className="w-full rounded-full" onClick={stop}>
            Дуусгах
          </Button>
        )}
      </aside>
    </div>
  )
}
