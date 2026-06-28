'use client'

import { useMemo, useState } from 'react'
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { useBoardStudents, type BoardStudent } from '@/hooks/useBoard'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import StudentModal from '@/components/admin/summary/StudentModal'
import TrendColumn from '@/components/admin/trends/TrendColumn'
import { SkeletonKanban } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

type Bucket = 'worsened' | 'treated' | 'normal'

const COLS: { key: Bucket; label: string; dotCls: string; countCls: string }[] = [
  { key: 'worsened', label: 'Хүндэрсэн',  dotCls: 'bg-triage-red',   countCls: 'bg-triage-red-bg text-triage-red' },
  { key: 'treated',  label: 'Эмчлүүлсэн', dotCls: 'bg-triage-green', countCls: 'bg-triage-green-bg text-triage-green' },
  { key: 'normal',   label: 'Хэвийн',      dotCls: 'bg-border',       countCls: 'bg-surface-raised text-text-muted' },
]

const getBucket = (s: BoardStudent): Bucket => {
  const tag = s.trend?.tag
  const lv = s.latestLevel
  if (tag === 'worsened' || tag === 'deteriorating') return 'worsened'
  if (tag === 'chronic' || tag === 'volatile') return lv === 'green' ? 'normal' : 'worsened'
  if (tag === 'improved' || tag === 'improving') return 'treated'
  return lv === 'green' ? 'normal' : 'worsened'
}

const TrendsPage = () => {
  const { data: students, isLoading } = useBoardStudents()
  const [selected, setSelected] = useState<BoardStudent | null>(null)
  const [classFilter, setClassFilter] = useState('')

  useSetPageHeader({ title: 'Харьцуулалт', subtitle: 'Улирлын динамик — хүнддэсэн · эмчлүүлсэн · хэвийн' })

  const multiSeason = useMemo(
    () => (students ?? []).filter((s) => (s.seasonCount ?? 0) >= 2),
    [students],
  )
  const classes = useMemo(() => [...new Set(multiSeason.map((s) => s.className))].sort(), [multiSeason])

  const filtered = useMemo(
    () => multiSeason.filter((s) => !classFilter || s.className === classFilter),
    [multiSeason, classFilter],
  )

  const byBucket = useMemo(() => {
    const map: Record<Bucket, BoardStudent[]> = { worsened: [], treated: [], normal: [] }
    for (const s of filtered) map[getBucket(s)].push(s)
    return map
  }, [filtered])

  if (isLoading) return <SkeletonKanban />

  if (multiSeason.length === 0) {
    return <EmptyState Icon={ArrowTrendingUpIcon} title="Олон улиралын мэдээлэл алга" hint="2+ улирал шалгагдсан хүүхэд гарвал энд харагдана." />
  }

  return (
    <section className="flex flex-col gap-5">
      {classes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {['', ...classes].map((c) => (
            <button key={c || '__all'} onClick={() => setClassFilter(c)}
              className={`btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${
                classFilter === c
                  ? 'bg-primary text-text-on-primary'
                  : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'
              }`}>
              {c || 'Бүх анги'}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-5 overflow-x-auto pb-2">
        {COLS.map((col) => (
          <TrendColumn
            key={col.key}
            meta={col}
            cards={byBucket[col.key]}
            onSelect={setSelected}
          />
        ))}
      </div>

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

export default TrendsPage
