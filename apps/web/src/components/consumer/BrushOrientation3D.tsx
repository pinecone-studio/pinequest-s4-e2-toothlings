'use client'

import type { RefObject } from 'react'
import dynamic from 'next/dynamic'
import type { ImuReading } from '@/lib/esp32Imu'
import { inferZoneFromImu, zoneLabel, ESP32_QUATERNION_SNIPPET } from '@/lib/esp32Imu'
import type { Mpu6050Tracker } from '@/lib/mpu6050'
import type { Esp32ConnectionStatus } from '@/hooks/useEsp32Imu'
import { cn } from '@/lib/utils'

const BrushImuScene = dynamic(
  () => import('./BrushImuScene').then((m) => m.BrushImuScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center text-[13px] text-white/50">
        3D ачааллаж байна…
      </div>
    ),
  },
)

const STATUS_MN: Record<Esp32ConnectionStatus, string> = {
  idle: 'Идэвхгүй',
  connecting: 'Холбогдож байна…',
  connected: 'Холбогдсон',
  disconnected: 'Салсан',
  error: 'Алдаа',
}

const STATUS_TONE: Record<Esp32ConnectionStatus, string> = {
  idle: 'bg-slate-400',
  connecting: 'bg-triage-yellow animate-pulse',
  connected: 'bg-triage-green',
  disconnected: 'bg-slate-400',
  error: 'bg-triage-red',
}

const AXIS_META = [
  { key: 'yaw', label: 'Yaw', mn: 'Эргэлт (Z)', color: '#3b82f6' },
  { key: 'pitch', label: 'Pitch', mn: 'Хөдөлгөөн (Y)', color: '#477C61' },
  { key: 'roll', label: 'Roll', mn: 'Хээлтүүл (X)', color: '#A05A5A' },
] as const

const AxisDial = ({
  label,
  mn,
  value,
  color,
}: {
  label: string
  mn: string
  value: number | null
  color: string
}) => {
  const v = value ?? 0
  const needle = ((v % 360) + 360) % 360
  const rad = (needle * Math.PI) / 180
  const cx = 50
  const cy = 50
  const r = 36
  const nx = cx + Math.sin(rad) * r * 0.78
  const ny = cy - Math.cos(rad) * r * 0.78

  return (
    <div className="rounded-2xl bg-[#F5F5F5] px-2 py-3 dark:bg-slate-800/80">
      <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="text-center text-[9px] text-text-muted">{mn}</p>
      <svg viewBox="0 0 100 100" className="mx-auto mt-1 h-[88px] w-[88px]" aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 6} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx} y1={cy + r} x2={cx} y2={cy + r - 6} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx - r} y1={cy} x2={cx - r + 6} y2={cy} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx + r} y1={cy} x2={cx + r - 6} y2={cy} stroke="#94a3b8" strokeWidth="2" />
        <text x={cx} y={cy - r - 4} textAnchor="middle" fill="#94a3b8" fontSize="7">
          0°
        </text>
        <text x={cx + r + 6} y={cy + 3} textAnchor="start" fill="#94a3b8" fontSize="7">
          90°
        </text>
        <text x={cx} y={cy + r + 10} textAnchor="middle" fill="#94a3b8" fontSize="7">
          180°
        </text>
        <text x={cx - r - 6} y={cy + 3} textAnchor="end" fill="#94a3b8" fontSize="7">
          270°
        </text>
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity={value === null ? 0.35 : 1}
        />
        <circle cx={cx} cy={cy} r={3.5} fill={color} />
      </svg>
      <p className="text-center font-mono text-[17px] font-bold tabular-nums" style={{ color }}>
        {value !== null ? `${value.toFixed(1)}°` : '—'}
      </p>
    </div>
  )
}

const FUSION_MN: Record<ReturnType<Mpu6050Tracker['getFusionMode']>, string> = {
  'dmp+mahony': 'DMP + Mahony (бүрэн)',
  dmp: 'DMP quaternion',
  mahony: 'Mahony AHRS',
  euler: 'Euler (хязгаартай)',
}

export const BrushOrientation3D = ({
  reading,
  trackerRef,
  fusionMode,
  status,
  wsUrl,
  onWsUrlChange,
  onReconnect,
  onCalibrate,
  error,
}: {
  reading: ImuReading | null
  trackerRef: RefObject<Mpu6050Tracker>
  fusionMode: ReturnType<Mpu6050Tracker['getFusionMode']>
  status: Esp32ConnectionStatus
  wsUrl: string
  onWsUrlChange: (url: string) => void
  onReconnect: () => void
  onCalibrate: () => void
  error: string | null
}) => {
  const yaw = reading?.yaw ?? 0
  const pitch = reading?.pitch ?? 0
  const roll = reading?.roll ?? 0
  const zone = reading ? inferZoneFromImu(reading) : null
  const hasRaw = Boolean(reading?.gyro && reading?.accel)
  const hasQuaternion = Boolean(reading?.quaternion)

  const axisValues: Record<(typeof AXIS_META)[number]['key'], number | null> = {
    yaw: reading ? yaw : null,
    pitch: reading ? pitch : null,
    roll: reading ? roll : null,
  }

  return (
    <div className="warm-card overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E0E0E0]/60 px-5 py-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
            ESP32 · MPU6050
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-text-base">Сойзны чиглэл (бодит цаг)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('size-2.5 rounded-full', STATUS_TONE[status])} />
          <span className="text-[12px] font-medium text-text-muted">{STATUS_MN[status]}</span>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[1fr_240px]">
        <div className="border-b border-[#E0E0E0]/60 xl:border-b-0 xl:border-r">
          <div className="relative h-[min(52vh,420px)] min-h-[360px] w-full">
            <BrushImuScene trackerRef={trackerRef} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-3 pt-8 text-center text-[11px] text-white/70">
              Чирж эргүүлэх · Улаан цэг = үзүүр · «Тэгшлэх» = одоогийн байрлалыг 0°
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-4 pb-2">
            <p className="text-[11px] text-text-muted">
              Fusion: <span className="font-semibold text-triage-green">{FUSION_MN[fusionMode]}</span>
            </p>
            <button
              type="button"
              onClick={onCalibrate}
              className="rounded-full border border-[#E0E0E0] bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 transition hover:bg-[#F5F5F5]"
            >
              Тэгшлэх (0°)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4">
            {AXIS_META.map(({ key, label, mn, color }) => (
              <AxisDial key={key} label={label} mn={mn} value={axisValues[key]} color={color} />
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {zone ? (
            <div className="rounded-2xl bg-[#F3B900]/12 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold text-text-muted">Одоогийн бүс</p>
              <p className="mt-1 text-[15px] font-bold text-text-base">{zoneLabel(zone)}</p>
            </div>
          ) : (
            <p className="text-center text-[12px] text-text-muted">ESP32-оос өгөгдөл хүлээж байна…</p>
          )}

          <div className="rounded-2xl bg-[#F5F5F5] px-3 py-3 dark:bg-slate-800/80">
            <p className="mb-2 text-[11px] font-semibold text-text-muted">Тэнхлэгийн тайлбар</p>
            <ul className="space-y-1.5 text-[11px] leading-relaxed text-text-muted">
              <li>
                <span className="font-semibold text-blue-600">Z · Yaw</span> — цагийн зүүний эргэлт
              </li>
              <li>
                <span className="font-semibold text-triage-green">Y · Pitch</span> — урд/хойд хөдөлгөөн
              </li>
              <li>
                <span className="font-semibold text-triage-red">X · Roll</span> — хажуу тийш хээлтүүл
              </li>
            </ul>
            {reading && (!hasQuaternion || !hasRaw) ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-[11px] font-semibold text-triage-yellow">
                  Илүү сайн дагах — ESP32 код (DMP + gyro/accel)
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-2xl bg-slate-900 p-2 text-[9px] leading-relaxed text-emerald-300">
                  {ESP32_QUATERNION_SNIPPET}
                </pre>
              </details>
            ) : (
              <p className="mt-2 text-[10px] font-medium text-triage-green">
                I2Cdevlib DMP + Mahony идэвхтэй
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-text-muted">WebSocket хаяг</label>
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => onWsUrlChange(e.target.value)}
              placeholder="ws://172.27.221.251:81"
              className="w-full rounded-xl border border-[#E0E0E0] bg-white px-3 py-2 font-mono text-[11px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#F3B900]"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={onReconnect}
              className="w-full rounded-full border border-[#E0E0E0] bg-white py-2 text-[12px] font-semibold text-slate-900 transition hover:bg-[#F5F5F5]"
            >
              Дахин холбох
            </button>
            {error ? (
              <p className="text-[11px] leading-relaxed text-triage-red">{error}</p>
            ) : (
              <p className="text-[11px] leading-relaxed text-text-muted">
                ESP32 «Redmi 13c» Wi‑Fi-д холбогдсон. Компьютерыг тэр сүлжээнд оруулна уу.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
