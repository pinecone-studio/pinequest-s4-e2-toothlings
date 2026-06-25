'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FlowCard, StatusPill } from '@/components/consumer/AppShell'
import { MiniLineChart } from '@/components/consumer/MiniChart'
import { HOME_FEATURES, ROUTES } from '@/lib/routes'
import {
  getAppointment,
  getLast7BrushLogs,
  getLastScanResult,
  isQuestionnaireComplete,
} from '@/lib/consumerState'

const HomePage = () => {
  const [ready, setReady] = useState(false)
  const [questionnaireDone, setQuestionnaireDone] = useState(false)
  const [lastScan, setLastScan] = useState(getLastScanResult())
  const [brushChart, setBrushChart] = useState<{ label: string; value: number }[]>([])
  const [appointment, setAppointment] = useState(getAppointment())

  useEffect(() => {
    setQuestionnaireDone(isQuestionnaireComplete())
    setLastScan(getLastScanResult())
    const logs = getLast7BrushLogs()
    setBrushChart(
      logs.map((l) => ({
        label: new Date(l.date).toLocaleDateString('mn-MN', { weekday: 'short' }),
        value: l.score,
      })),
    )
    setAppointment(getAppointment())
    setReady(true)
  }, [])

  const triageTone = lastScan?.triage === 'red' ? 'red' : lastScan?.triage === 'yellow' ? 'yellow' : 'green'

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="warm-section-label mb-2">Overview</p>
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="mt-2 text-[15px] text-slate-500">Таны үйл ажиллагааны төв цэг</p>
        </div>
        <Link
          href={questionnaireDone ? ROUTES.scan.camera : ROUTES.scan.questionnaire}
          className="rounded-full bg-[#F3B900] px-6 py-3 text-[14px] font-semibold text-slate-900 shadow-[0_2px_8px_rgba(243,185,0,0.25)] transition-all hover:bg-[#E5AD00]"
        >
          {questionnaireDone ? 'Scan эхлүүлэх' : 'Асуумж бөглөх'}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Snapshot + chart row */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="warm-card overflow-hidden p-0">
              <div className="border-b border-border px-6 py-4">
                <p className="text-[14px] font-semibold">Сүүлийн оношлогооны snapshot</p>
              </div>
              <div className="p-6">
                {ready && lastScan ? (
                  <>
                    <div className="relative mb-4 overflow-hidden rounded-2xl bg-surface-raised">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lastScan.imageUrl} alt="Last scan" className="h-40 w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusPill
                        label={lastScan.urgent ? 'Яаралтай' : lastScan.triage === 'yellow' ? 'Анхаарал хэрэгтэй' : 'Хэвийн'}
                        tone={triageTone}
                      />
                      <span className="text-[12px] text-text-muted">
                        {new Date(lastScan.createdAt).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-text-muted line-clamp-2">{lastScan.advice}</p>
                  </>
                ) : (
                  <p className="text-[14px] text-text-muted">Scan хийгээгүй байна — эхний оношлогоогоо эхлүүлээрэй.</p>
                )}
              </div>
            </div>

            {ready ? (
              <MiniLineChart data={brushChart} title="Угаалтын зуршил" subtitle="Сүүлийн 7 хоног (%)" />
            ) : (
              <div className="warm-card h-[280px] animate-pulse bg-surface-raised" />
            )}
          </div>

          {/* Quick access */}
          <div>
            <p className="mb-4 text-[14px] font-semibold">Түргэн хандах</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {HOME_FEATURES.map(({ href, label, desc, emoji }, i) => (
                <FlowCard key={href} href={href} emoji={emoji} title={label} desc={desc} accent={i === 0 ? 'gold' : 'default'} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: appointment */}
        <aside className="space-y-4">
          <div className="warm-card p-6">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">Дараагийн үзлэг</p>
            <p className="mt-3 text-[20px] font-bold">{appointment.doctorName}</p>
            <p className="text-[13px] text-text-muted">{appointment.clinic}</p>
            <p className="mt-4 rounded-2xl bg-primary-subtle px-4 py-3 text-[14px] font-semibold">
              {new Date(appointment.datetime).toLocaleString('mn-MN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-2 text-[12px] text-text-muted">{appointment.address}</p>
            <Link href={ROUTES.doctor.root} className="mt-4 inline-block text-[13px] font-semibold text-primary">
              Эмч захиалах →
            </Link>
          </div>

          <div className="warm-card border border-amber-100 bg-amber-50/50 p-5 text-[12px] leading-relaxed text-slate-600">
            <strong>Анхааруулга:</strong> Screening систем — эмчийн онош биш.
          </div>
        </aside>
      </div>
    </div>
  )
}

export default HomePage
