'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { SchoolClassRow } from '@pinequest/types'
import { useCarryForward, useClasses, useCreateClass } from '@/hooks/useClasses'
import { useSchool } from '@/hooks/useSchools'
import { useStats } from '@/hooks/useStats'
import Button from '@/components/ui/Button'
import CoverageBar from '@/components/admin/schools/CoverageBar'
import ClassListRow from '@/components/admin/schools/ClassListRow'
import CarryForwardModal from '@/components/admin/schools/CarryForwardModal'
import { PageSpinner } from '@/components/ui/Spinner'

const inp = 'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

const TRIAGE = [
  { k: 'green' as const, label: 'Аюулгүй', cls: 'border-triage-green bg-triage-green-bg text-triage-green' },
  { k: 'yellow' as const, label: 'Шалгуулах', cls: 'border-triage-yellow bg-triage-yellow-bg text-triage-yellow' },
  { k: 'red' as const, label: 'Яаралтай', cls: 'border-triage-red bg-triage-red-bg text-triage-red' },
]

const SchoolClassesPage = () => {
  const schoolId = useParams().schoolId as string
  const { data: school } = useSchool(schoolId)
  const { data: classes, isLoading } = useClasses(schoolId)
  const { data: stats } = useStats({ schoolId })
  const createClass = useCreateClass(schoolId)
  const carryForward = useCarryForward(schoolId)

  const [name, setName] = useState('')
  const [seasonId, setSeasonId] = useState('2026-spring')
  const [modalSource, setModalSource] = useState<SchoolClassRow | null>(null)

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createClass.mutate({ name: name.trim(), seasonId })
    setName('')
  }

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dashboard" className="btn inline-flex w-fit items-center gap-1 text-sm text-primary transition-all duration-150 hover:underline">
        Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">
        {school?.name ?? '…'}
        {school?.district && <span className="ml-2 text-base font-normal text-text-muted">{school.district}</span>}
      </h1>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {TRIAGE.map(({ k, label, cls }, i) => (
            <div key={k} style={{ animationDelay: `${i * 70}ms` }} className={`blob pop-in grow border p-4 text-center hover:shadow-(--shadow-card-lg) ${cls}`}>
              <p className="stat-rise text-2xl font-bold tabular-nums">{stats.triage[k]}</p>
              <p className="text-xs opacity-80">{label}</p>
            </div>
          ))}
          <div className="blob col-span-3 border border-border bg-surface p-4 shadow-(--shadow-card)">
            <p className="mb-2 text-xs font-medium text-text-muted">Хамрагдалт</p>
            <CoverageBar screened={stats.coverage.screened} total={stats.coverage.total} />
          </div>
        </div>
      )}

      <form onSubmit={onAdd} className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ангийн нэр (ж: 3А)" className={inp} />
        <input value={seasonId} onChange={(e) => setSeasonId(e.target.value)} placeholder="Улирал" className={inp} />
        <Button type="submit" disabled={createClass.isPending}>Нэмэх</Button>
      </form>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <ul className="flex flex-col gap-2">
          {classes?.map((c) => (
            <ClassListRow key={c.id} row={c} onSchedule={setModalSource} />
          ))}
        </ul>
      )}

      <CarryForwardModal
        open={modalSource !== null}
        onClose={() => setModalSource(null)}
        source={modalSource}
        schoolName={school?.name ?? ''}
        submitting={carryForward.isPending}
        onSubmit={async (vars) => {
          if (!modalSource) return
          await carryForward.mutateAsync({ classId: modalSource.id, ...vars })
        }}
      />
    </section>
  )
}

export default SchoolClassesPage
