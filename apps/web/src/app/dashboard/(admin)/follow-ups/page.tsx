'use client'

import { useMemo, useState } from 'react'
import type { FollowUpStatus } from '@pinequest/types'
import { useBoardStudents, useSendToParent, useSetFollowUpStatus, type BoardStudent } from '@/hooks/useBoard'
import KanbanColumn from '@/components/admin/follow-up/KanbanColumn'
import FollowUpEditModal from '@/components/admin/follow-up/FollowUpEditModal'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonKanban } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { ClipboardDocumentListIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

type Column = { status: FollowUpStatus; label: string; dot: string; count: string; statuses: FollowUpStatus[] }
const COLUMNS: Column[] = [
  { status: 'flagged',        label: 'Шинэ',         dot: 'bg-fu-flagged',   count: 'bg-fu-flagged-bg text-fu-flagged',     statuses: ['flagged'] },
  { status: 'contacted',      label: 'Хяналтад',     dot: 'bg-fu-contacted', count: 'bg-fu-contacted-bg text-fu-contacted', statuses: ['contacted', 'doctor_connected', 'unclear'] },
  { status: 'treatment_done', label: 'Шийдвэрлэсэн', dot: 'bg-fu-done',      count: 'bg-fu-done-bg text-fu-done',           statuses: ['treatment_done', 'treatment_refused'] },
]
const columnFor = (st: FollowUpStatus): Column => COLUMNS.find((c) => c.statuses.includes(st)) ?? COLUMNS[0]

const PAGE_SIZE = 5
const inp = 'rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted/60 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30'
const LEVELS = [
  { value: '', label: 'Бүх эрэмбэ' },
  { value: 'red',    label: 'Яаралтай' },
  { value: 'yellow', label: 'Эмчилгээ' },
]
const URGENCY: Record<string, number> = { red: 0, yellow: 1 }
const byUrgency = (a: BoardStudent, b: BoardStudent) => {
  const u = (URGENCY[a.latestLevel ?? ''] ?? 9) - (URGENCY[b.latestLevel ?? ''] ?? 9)
  return u !== 0 ? u : new Date(b.screenedAt ?? 0).getTime() - new Date(a.screenedAt ?? 0).getTime()
}

const FollowUpBoard = () => {
  const { data: students, isLoading } = useBoardStudents()
  const send = useSendToParent()
  const setStatus = useSetFollowUpStatus()
  const [editing, setEditing] = useState<BoardStudent | null>(null)
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<FollowUpStatus | null>(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [colPages, setColPages] = useState<Record<string, number>>(
    () => Object.fromEntries(COLUMNS.map((c) => [c.status, PAGE_SIZE]))
  )

  const flagged = useMemo(
    () => (students ?? []).filter((s) => s.latestLevel === 'red' || s.latestLevel === 'yellow'),
    [students],
  )
  const classes = useMemo(() => [...new Set(flagged.map((s) => s.className))].sort(), [flagged])

  const filtered = useMemo(() => flagged.filter((s) => {
    if (search && !`${s.lastName} ${s.firstName}`.toLowerCase().includes(search.toLowerCase())) return false
    if (classFilter && s.className !== classFilter) return false
    if (levelFilter && s.latestLevel !== levelFilter) return false
    return true
  }), [flagged, search, classFilter, levelFilter])

  const byStatus = useMemo(() => {
    const map: Record<string, BoardStudent[]> = {}
    for (const col of COLUMNS) map[col.status] = []
    for (const s of filtered) map[columnFor(s.followUpStatus ?? 'flagged').status].push(s)
    for (const col of COLUMNS) map[col.status].sort(byUrgency)
    return map
  }, [filtered])

  const onDrop = (targetStatus: FollowUpStatus) => {
    if (draggingKey) setStatus.mutate({ childKey: draggingKey, status: targetStatus })
    setDraggingKey(null); setDragOverCol(null)
  }

  useSetPageHeader({ title: 'Хяналт', subtitle: 'Яаралтай болон эмчилгээ шаардлагатай хүүхдүүдийн жагсаалт' })

  return (
    <section className="flex min-h-0 flex-col gap-5">

      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэрээр хайх…" className={`${inp} w-52 pl-9`} />
        </div>

        {/* Class pills */}
        {classes.length > 1 && (
          <>
            <div className="h-5 w-px bg-border" />
            <button onClick={() => setClassFilter('')} className={`btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${classFilter === '' ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'}`}>
              Бүх анги
            </button>
            {classes.map((c) => (
              <button key={c} onClick={() => setClassFilter(c === classFilter ? '' : c)} className={`btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${classFilter === c ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'}`}>
                {c}
              </button>
            ))}
          </>
        )}

        {/* Level pills */}
        <div className="h-5 w-px bg-border" />
        {LEVELS.map((l) => (
          <button key={l.value} onClick={() => setLevelFilter(l.value)} className={`btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${levelFilter === l.value ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'}`}>
            {l.label}
          </button>
        ))}

        {(search || classFilter || levelFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setClassFilter(''); setLevelFilter('') }}>Цэвэрлэх</Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonKanban />
      ) : flagged.length === 0 ? (
        <EmptyState Icon={ClipboardDocumentListIcon} title="Хяналт шаардлагатай сурагч алга" hint="Улаан/шар төлөвтэй сурагч гарвал энд харагдана." />
      ) : (
        <div className="flex gap-5 overflow-x-auto px-0.5 pb-2">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              col={col}
              cards={byStatus[col.status] ?? []}
              limit={colPages[col.status] ?? PAGE_SIZE}
              pageSize={PAGE_SIZE}
              isOver={dragOverCol === col.status}
              draggingKey={draggingKey}
              onDragOver={() => setDragOverCol(col.status)}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null) }}
              onDrop={() => onDrop(col.status)}
              onSend={(s) => { void send(s).catch(() => {}) }}
              onStatus={(childKey, st) => setStatus.mutate({ childKey, status: st })}
              onEdit={setEditing}
              onDragStart={setDraggingKey}
              onDragEnd={() => { setDraggingKey(null); setDragOverCol(null) }}
              onShowMore={() => setColPages((p) => ({ ...p, [col.status]: (p[col.status] ?? PAGE_SIZE) + PAGE_SIZE }))}
              onCollapse={() => setColPages((p) => ({ ...p, [col.status]: PAGE_SIZE }))}
            />
          ))}
        </div>
      )}

      <FollowUpEditModal student={editing} onClose={() => setEditing(null)} />
    </section>
  )
}

export default FollowUpBoard
