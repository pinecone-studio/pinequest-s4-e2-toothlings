'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowLeftIcon, CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useMe } from '@/hooks/useMe'
import { useStats } from '@/hooks/useStats'
import { useFollowUps } from '@/hooks/useFollowUps'
import { useScreenings } from '@/hooks/useScreenings'
import { useSchools, useCreateSchool } from '@/hooks/useSchools'
import TriageCard from '@/components/dashboard/TriageCard'
import ScreeningBarChart from '@/components/dashboard/ScreeningBarChart'
import StatsSummaryCard from '@/components/dashboard/StatsSummaryCard'
import FollowUpSummaryCard from '@/components/dashboard/FollowUpSummaryCard'
import RecentScreeningsTable from '@/components/dashboard/RecentScreeningsTable'

const AdminDashboardPage = () => {
  const { data: me } = useMe()
  const { data: stats } = useStats()
  const { data: followUps } = useFollowUps()
  const { data: screenings } = useScreenings({ limit: 5 })
  const { data: schools } = useSchools()
  const createSchool = useCreateSchool()

  const [showAdd, setShowAdd] = useState(false)
  const [schoolName, setSchoolName] = useState('')

  const today = new Date().toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!schoolName.trim()) return
    createSchool.mutate({ name: schoolName.trim() })
    setSchoolName('')
    setShowAdd(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting header — matches "← Hello, Naiem" from reference */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="rounded-full p-1.5 text-text-muted hover:bg-surface hover:text-text-base transition-colors">
            <ArrowLeftIcon className="size-4" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-text-base">
              Сайн байна уу, {me?.name ?? 'Админ'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range chip */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-[12px] text-text-muted shadow-(--shadow-card)">
            <CalendarDaysIcon className="size-3.5 shrink-0" />
            <span>{today}</span>
          </div>
          {/* Add button */}
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-[12px] font-semibold text-text-base shadow-(--shadow-card) transition-colors hover:border-primary hover:text-primary"
          >
            <PlusIcon className="size-3.5" />
            Сургууль нэмэх
          </button>
        </div>
      </div>

      {/* Inline add-school form */}
      {showAdd && (
        <form onSubmit={onAdd} className="flex gap-2">
          <input
            autoFocus
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Сургуулийн нэр"
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            Нэмэх
          </button>
          <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:text-text-base">
            Болих
          </button>
        </form>
      )}

      {/* 3-column dashboard grid — [left ~280px] [center flex] [right ~280px] */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr_280px]">
        {/* Left: triage card + recent screenings */}
        <div className="flex flex-col gap-5">
          <TriageCard stats={stats} />
          <RecentScreeningsTable screenings={screenings} />
        </div>

        {/* Center: bar chart — takes all remaining width */}
        <ScreeningBarChart stats={stats} />

        {/* Right: stats summary + follow-up card */}
        <div className="flex flex-col gap-5">
          <StatsSummaryCard stats={stats} />
          <FollowUpSummaryCard followUps={followUps} />
        </div>
      </div>

      {/* Schools grid below */}
      {schools && schools.length > 0 && (
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-text-muted">
            Сургуулиуд
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {schools.map((s) => (
              <Link
                key={s.id}
                href={`/admin/schools/${s.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-(--shadow-card) transition-colors hover:border-primary"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-[11px] font-bold text-primary">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="flex-1 truncate text-[13px] font-medium text-text-base">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
