'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { SchoolClassRow } from '@pinequest/types'
import { useCarryForward, useClasses, useCreateClass } from '@/hooks/useClasses'
import { useSchool } from '@/hooks/useSchools'
import { useStats } from '@/hooks/useStats'
import CoverageBar from '@/components/CoverageBar'
import ClassListRow from '@/components/ClassListRow'
import CarryForwardModal from '@/components/CarryForwardModal'

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
      <Link href="/admin" className="btn inline-flex w-fit items-center gap-1 text-sm text-primary transition-all duration-150 hover:underline">
        <ArrowLeftIcon className="size-4" /> Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">
        {school?.name ?? '…'}
        {school?.district && <span className="ml-2 text-base font-normal text-text-muted">{school.district}</span>}
      </h1>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {TRIAGE.map(({ k, label, cls }) => (
            <div key={k} className={`rounded-xl border p-3 text-center ${cls}`}>
              <p className="text-2xl font-bold">{stats.triage[k]}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          ))}
          <div className="col-span-3 rounded-xl border border-border bg-surface p-3">
            <p className="mb-2 text-xs font-medium text-text-muted">Хамрагдалт</p>
            <CoverageBar screened={stats.coverage.screened} total={stats.coverage.total} />
          </div>
        </div>
      )}

      <form onSubmit={onAdd} className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ангийн нэр (ж: 3А)" className={inp} />
        <input value={seasonId} onChange={(e) => setSeasonId(e.target.value)} placeholder="Улирал" className={inp} />
        <button className="btn rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-on-primary transition-all duration-150 hover:bg-primary-hover">
          Нэмэх
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
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
