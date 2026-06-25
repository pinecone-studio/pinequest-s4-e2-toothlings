'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell, StatusPill } from '@/components/consumer/AppShell'
import { ToothModel } from '@/components/consumer/ToothModel'
import Button from '@/components/ui/Button'
import {
  getBrushSession,
  saveBrushSession,
  type BrushZone,
} from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'

const ZONES: { id: BrushZone; label: string }[] = [
  { id: 'UL', label: 'Дээд зүүн' },
  { id: 'UR', label: 'Дээд баруун' },
  { id: 'LL', label: 'Доод зүүн' },
  { id: 'LR', label: 'Доод баруун' },
]

const BrushMonitorPage = () => {
  const [active, setActive] = useState<BrushZone>('UL')
  const [seconds, setSeconds] = useState<Record<BrushZone, number>>({ UL: 0, UR: 0, LL: 0, LR: 0 })
  const [pressure, setPressure] = useState<'low' | 'ok' | 'high'>('ok')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const saved = getBrushSession()
    if (saved) {
      setSeconds(saved.zones)
      setPressure(saved.pressure)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSeconds((s) => ({ ...s, [active]: s[active] + 1 }))
      const r = Math.random()
      setPressure(r > 0.85 ? 'high' : r < 0.1 ? 'low' : 'ok')
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, active])

  const total = Object.values(seconds).reduce((a, b) => a + b, 0)
  const stop = () => {
    setRunning(false)
    saveBrushSession({ startedAt: new Date().toISOString(), zones: seconds, pressure })
  }

  return (
    <AppShell title="Smart Brush Monitor" subtitle="3D макет · realtime · даралт · timer" backHref={ROUTES.brush.root}>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="warm-card flex flex-col items-center p-8">
          <ToothModel activeZone={active} zoneScores={seconds} />
          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
            {ZONES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${active === id ? 'border-primary bg-primary-subtle' : 'border-border'}`}
              >
                <p className="text-[12px] font-semibold">{label}</p>
                <p className="font-mono text-[22px] font-bold">{seconds[id]}s</p>
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="warm-card p-6 text-center">
            <p className="text-[12px] uppercase tracking-wide text-text-muted">Timer</p>
            <p className="mt-2 text-[48px] font-bold tabular-nums">{total}s</p>
            <p className="text-[13px] text-text-muted">Зорилт: 120s</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-raised">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (total / 120) * 100)}%` }} />
            </div>
          </div>

          <div className="warm-card p-6">
            <p className="text-[14px] font-semibold">Сойзны даралт</p>
            <div className="mt-3">
              <StatusPill
                label={pressure === 'ok' ? 'Зөв' : pressure === 'high' ? 'Хэт их' : 'Дутуу'}
                tone={pressure === 'ok' ? 'green' : 'red'}
              />
            </div>
            <p className="mt-4 text-[12px] text-text-muted">ESP32 + IMU sensor (demo simulation)</p>
          </div>

          {!running ? (
            <Button size="lg" className="w-full" onClick={() => setRunning(true)}>Эхлэх</Button>
          ) : (
            <Button size="lg" variant="secondary" className="w-full" onClick={stop}>Дуусгах</Button>
          )}

          <Link href={ROUTES.profile.history} className="block text-center text-[12px] text-primary">Түүх →</Link>
        </aside>
      </div>
    </AppShell>
  )
}

export default BrushMonitorPage
