'use client'

import { useBoardStudents } from '@/hooks/useBoard'
import ParentChildCard from '@/components/admin/child/ParentChildCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

// Parent landing — their own child(ren) only (scope-enforced server-side).
const ChildPage = () => {
  const { data: students, isLoading } = useBoardStudents()

  useSetPageHeader({ title: 'Миний хүүхэд', subtitle: 'Хүүхдийн шүдний урьдчилсан үзүүлэлтийн дүн ба зөвлөмж.' })

  return (
    <section className="flex max-w-xl flex-col gap-6">

      {isLoading ? (
        <PageSpinner />
      ) : !students?.length ? (
        <p className="rounded-xl border border-border bg-surface-raised p-4 text-sm text-text-muted">
          Холбогдсон хүүхэд алга. Бүртгэлдээ хүүхдийн кодоо холбоно уу.
        </p>
      ) : (
        students.map((s) => <ParentChildCard key={s.id} student={s} />)
      )}
    </section>
  )
}

export default ChildPage
