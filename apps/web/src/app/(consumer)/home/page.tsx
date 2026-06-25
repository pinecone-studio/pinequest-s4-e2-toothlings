'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MiniLineChart } from '@/components/consumer/MiniChart'
import {
  ChildrenTabRow,
  GreetingHeader,
  LastScreeningCard,
  QuickActionGrid,
  ScanHeroCard,
} from '@/components/consumer/MobilePatterns'
import { useMe } from '@/hooks/useMe'
import { ROUTES } from '@/lib/routes'
import {
  getAppointment,
  getLast7BrushLogs,
  getLastScanResult,
  isQuestionnaireComplete,
} from '@/lib/consumerState'

const MOCK_CHILDREN = ['Болд', 'Сарнай', 'Энхбаяр']

const QUICK_ACTIONS = [
  { href: ROUTES.profile.history, icon: '📋', label: 'Шалгалтын\nтүүх' },
  { href: ROUTES.brush.root, icon: '📖', label: 'Заавар' },
  { href: ROUTES.doctor.map, icon: '📍', label: 'Ойрын\nэмнэлэг' },
  { href: ROUTES.profile.export, icon: '↗', label: 'Хуваалцах' },
]

const HomePage = () => {
  const { data: me } = useMe()
  const [ready, setReady] = useState(false)
  const [activeChild, setActiveChild] = useState(MOCK_CHILDREN[0])
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

  const scanHref = questionnaireDone ? ROUTES.scan.camera : ROUTES.scan.questionnaire
  const displayName = me?.name ?? 'Хэрэглэгч'

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 lg:max-w-4xl">
      <GreetingHeader name={displayName} />
      <ChildrenTabRow names={MOCK_CHILDREN} active={activeChild} onSelect={setActiveChild} />
      <ScanHeroCard href={scanHref} />

      {ready && lastScan ? (
        <LastScreeningCard
          date={new Date(lastScan.createdAt).toLocaleDateString('mn-MN')}
          triage={lastScan.triage}
          summary={lastScan.advice}
          href={ROUTES.scan.result}
        />
      ) : (
        <div className="warm-card p-4 text-[14px] text-slate-500">
          Scan хийгээгүй байна — эхний шалгалтаа эхлүүлээрэй.
        </div>
      )}

      <QuickActionGrid actions={QUICK_ACTIONS} />

      <div className="hidden gap-6 pt-2 lg:grid lg:grid-cols-2">
        {ready ? (
          <MiniLineChart data={brushChart} title="Угаалтын зуршил" subtitle="Сүүлийн 7 хоног (%)" />
        ) : (
          <div className="warm-card h-[280px] animate-pulse bg-[#F0EBE3]" />
        )}

        <div className="warm-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Дараагийн үзлэг</p>
          <p className="mt-3 text-[20px] font-bold text-slate-900">{appointment.doctorName}</p>
          <p className="text-[13px] text-slate-500">{appointment.clinic}</p>
          <p className="mt-4 rounded-2xl bg-[#F3B900]/12 px-4 py-3 text-[14px] font-semibold text-slate-900">
            {new Date(appointment.datetime).toLocaleString('mn-MN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="mt-2 text-[12px] text-slate-500">{appointment.address}</p>
          <Link href={ROUTES.doctor.root} className="mt-4 inline-block text-[13px] font-semibold text-[#B8860B]">
            Эмч захиалах →
          </Link>
        </div>
      </div>

      <p className="pb-2 text-center text-[11px] leading-relaxed text-slate-400 lg:text-left">
        Screening систем — эмчийн онош биш.
      </p>
    </div>
  )
}

export default HomePage
