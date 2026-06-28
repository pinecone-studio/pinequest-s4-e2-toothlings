'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import type { TriageLevel } from '@pinequest/types'
import { BulkImportForm } from '@/components/admin/classes/BulkImportForm'
import { RosterTable } from '@/components/admin/classes/RosterTable'
import { TriageRollup } from '@/components/admin/classes/TriageRollup'
import { useChildren } from '@/hooks/useChildren'
import { useScreenings } from '@/hooks/useScreenings'
import { PageSpinner } from '@/components/ui/Spinner'

const ClassRosterPage = () => {
  const classId = useParams().classId as string
  const { data: children, isLoading } = useChildren(classId)
  const { data: screenings } = useScreenings({ classId })

  // childKey → latest triage level (screenings come back newest-first)
  const levelByKey = useMemo(() => {
    const map: Record<string, TriageLevel> = {}
    for (const s of screenings ?? []) if (!map[s.childKey]) map[s.childKey] = s.triageLevel
    return map
  }, [screenings])

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dashboard" className="btn inline-flex w-fit items-center gap-1 text-sm text-primary transition-all duration-150 hover:underline">
        Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">Анги — ростер</h1>

      <div className="blob border border-border bg-surface p-4 shadow-(--shadow-card)">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Триаж дүн</h2>
        <TriageRollup classId={classId} />
      </div>

      <div className="blob border border-border bg-surface p-4 shadow-(--shadow-card)">
        <h2 className="mb-3 text-sm font-medium text-text-muted">Ростер импорт</h2>
        <BulkImportForm classId={classId} />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <RosterTable rows={children ?? []} levelByKey={levelByKey} />
      )}
    </section>
  )
}

export default ClassRosterPage
