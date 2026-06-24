'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { BulkImportForm } from '@/components/BulkImportForm'
import { RosterTable } from '@/components/RosterTable'
import { TriageRollup } from '@/components/TriageRollup'
import { useChildren } from '@/hooks/useChildren'

const ClassRosterPage = () => {
  const classId = useParams().classId as string
  const { data: children, isLoading } = useChildren(classId)

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin" className="text-sm text-neutral-500 underline">
        ← Сургуулиуд
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Анги — ростер</h1>

      <div>
        <h2 className="mb-1 text-sm font-medium text-neutral-500">Триаж дүн</h2>
        <TriageRollup classId={classId} />
      </div>

      <BulkImportForm classId={classId} />

      {isLoading ? (
        <p className="text-neutral-500">Ачааллаж байна…</p>
      ) : (
        <RosterTable rows={children ?? []} />
      )}
    </section>
  )
}

export default ClassRosterPage
