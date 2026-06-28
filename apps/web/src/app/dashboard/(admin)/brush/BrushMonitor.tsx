'use client'

import { useEffect, useRef, useState } from 'react'
import { BrushArchMonitor } from '@/components/consumer/BrushArchMonitor'
import Button from '@/components/ui/Button'
import {
  createBrushMlState, processSensorFrame, synthesizeSensorFrame,
  teethToCoverageMap, type BrushMlState,
} from '@/lib/brushMl'
import { getBrushSession, saveBrushSession, type BrushZone } from '@/lib/consumerState'

const ZONES: { id: BrushZone; label: string }[] = [
  { id: 'UL', label: 'Дээд зүүн' },
  { id: 'UR', label: 'Дээд баруун' },
  { id: 'LL', label: 'Доод зүүн' },
  { id: 'LR', label: 'Доод баруун' },
]

const PRESSURE_LABEL: Record<string, string> = { ok: 'Зөв', high: 'Хэт их', low: 'Дутуу' }
const PRESSURE_CLS: Record<string, string> = {
  ok:   'bg-triage-green-bg text-triage-green',
  high: 'bg-triage-red-bg text-triage-red',
  low:  'bg-triage-yellow-bg text-triage-yellow',
}

export const BrushMonitor = () => {
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
    if (saved) { setSeconds(saved.zones); setPressure(saved.pressure); if (saved.teeth) setMlState(createBrushMlState(saved.teeth)) }
  }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      tickRef.current += 1
      const r = Math.random()
      const next = r > 0.85 ? 'high' : r < 0.1 ? 'low' : 'ok' as 'low' | 'ok' | 'high'
      setPressure(next)
      setSeconds((s) => ({ ...s, [activeZone]: s[activeZone] + 1 }))
      const frame = synthesizeSensorFrame(activeZone, tickRef.current, next)
      setMlState((prev) => processSensorFrame(prev, frame))
    }, 800)
    return () => window.clearInterval(id)
  }, [running, activeZone])

  const total = Object.values(seconds).reduce((a, b) => a + b, 0)
  const stop = () => {
    setRunning(false)
    saveBrushSession({ startedAt: new Date().toISOString(), zones: secondsRef.current, pressure, teeth: teethToCoverageMap(mlRef.current.teeth), overallCoverage: mlRef.current.overallCoverage })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <BrushArchMonitor mlState={mlState} running={running} />
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-(--shadow-card)">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Бүс сонгох</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ZONES.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveZone(id)}
                className={`rounded-2xl border px-3 py-2.5 text-left transition ${activeZone === id ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-surface-raised'}`}>
                <p className="text-[11px] font-semibold text-text-muted">{label}</p>
                <p className="font-mono text-[18px] font-bold text-text-base">{seconds[id]}s</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-(--shadow-card)">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Хугацаа</p>
          <p className="mt-2 font-mono text-[42px] font-bold tabular-nums text-text-base">
            {String(Math.floor(total / 60)).padStart(2, '0')}:{String(total % 60).padStart(2, '0')}
          </p>
          <p className="text-[13px] text-text-muted">Зорилт 02:00</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (total / 120) * 100)}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-(--shadow-card)">
          <p className="text-[14px] font-semibold text-text-base">Хамралт</p>
          <p className="mt-2 text-[32px] font-bold text-text-base">{mlState.overallCoverage}%</p>
          <p className="mt-1 text-[12px] text-text-muted">32 шүд · гадна / дотор / жевхэн</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-(--shadow-card)">
          <p className="mb-3 text-[14px] font-semibold text-text-base">Сойзны даралт</p>
          <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${PRESSURE_CLS[pressure]}`}>
            {PRESSURE_LABEL[pressure]}
          </span>
        </div>

        {!running
          ? <Button size="lg" className="w-full rounded-full bg-primary text-text-on-primary hover:opacity-90" onClick={() => { tickRef.current = 0; setRunning(true) }}>Эхлэх</Button>
          : <Button size="lg" variant="secondary" className="w-full rounded-full" onClick={stop}>Дуусгах</Button>
        }
      </aside>
    </div>
  )
}
