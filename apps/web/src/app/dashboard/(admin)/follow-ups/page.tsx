'use client'

import { useMemo, useState } from 'react'
import type { FollowUpStatus } from '@pinequest/types'
import {
  useBoardStudents,
  useSendToParent,
  useSetFollowUpStatus,
  type BoardStudent,
} from '@/hooks/useBoard'
import KanbanColumn from '@/components/admin/follow-up/KanbanColumn'
import FollowUpEditModal from '@/components/admin/follow-up/FollowUpEditModal'
import BoardDentistPanel from '@/components/admin/help/BoardDentistPanel'
import { useSeason } from '@/components/shared/SeasonProvider'
import { scopeStudentsToSeason } from '@/lib/seasonScope'
import { improvedFromRed, effectiveFollowUpStatus } from '@/lib/followUp'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonKanban } from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

type Column = {
  status: FollowUpStatus
  label: string
  dot: string
  count: string
  statuses: FollowUpStatus[]
}
const COLUMNS: Column[] = [
  {
    status: 'contacted',
    label: 'Эмчтэй цаг товлосон',
    dot: 'bg-fu-contacted',
    count: 'bg-fu-contacted-bg text-fu-contacted',
    statuses: ['flagged', 'contacted', 'doctor_connected', 'unclear'],
  },
  {
    status: 'treatment_done',
    label: 'Холбогдсон',
    dot: 'bg-fu-done',
    count: 'bg-fu-done-bg text-fu-done',
    statuses: ['treatment_done', 'treatment_refused'],
  },
]
const columnFor = (st: FollowUpStatus): Column =>
  COLUMNS.find((c) => c.statuses.includes(st)) ?? COLUMNS[0]

const PAGE_SIZE = 5
const inp =
  'rounded-full border border-border bg-surface px-3 py-2 text-[13px] text-text-base placeholder:text-text-muted/60 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30'
const URGENCY: Record<string, number> = { red: 0, yellow: 1 }
const byUrgency = (a: BoardStudent, b: BoardStudent) => {
  const u = (URGENCY[a.latestLevel ?? ''] ?? 9) - (URGENCY[b.latestLevel ?? ''] ?? 9)
  return u !== 0 ? u : new Date(b.screenedAt ?? 0).getTime() - new Date(a.screenedAt ?? 0).getTime()
}

const FollowUpBoard = () => {
  const { data: students, isLoading } = useBoardStudents()
  const { seasonId, seasons } = useSeason()
  const send = useSendToParent()
  const setStatus = useSetFollowUpStatus()
  const [editing, setEditing] = useState<BoardStudent | null>(null)
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<FollowUpStatus | null>(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [colPages, setColPages] = useState<Record<string, number>>(() =>
    Object.fromEntries(COLUMNS.map((c) => [c.status, PAGE_SIZE])),
  )

  // Хяналт нь ЗӨВХӨН улаан (яаралтай) хүүхдэд зориулагдана. Улирлын хэсэгчилэлээр
  // тухайн улирлын улаан хүүхдийг харуулна; нэмээд өмнө улаан байгаад одоо сайжирсан
  // (эмчлүүлсэн) хүүхдийг амжилтын түүх болгон "хийгдсэн" баганад харуулна. Хэзээ ч
  // улаан байгаагүй, зүгээр шар хүүхэд энд ОРОХГҮЙ.
  const flagged = useMemo(
    () =>
      scopeStudentsToSeason(students, seasonId, true).filter(
        (s) => s.latestLevel === 'red' || improvedFromRed(s),
      ),
    [students, seasonId],
  )
  const classes = useMemo(() => [...new Set(flagged.map((s) => s.className))].sort(), [flagged])

  const filtered = useMemo(
    () =>
      flagged.filter((s) => {
        if (search && !`${s.lastName} ${s.firstName}`.toLowerCase().includes(search.toLowerCase()))
          return false
        if (classFilter && s.className !== classFilter) return false
        return true
      }),
    [flagged, search, classFilter],
  )

  const byStatus = useMemo(() => {
    const map: Record<string, BoardStudent[]> = {}
    for (const col of COLUMNS) map[col.status] = []
    for (const s of filtered) map[columnFor(effectiveFollowUpStatus(s)).status].push(s)
    for (const col of COLUMNS) map[col.status].sort(byUrgency)
    return map
  }, [filtered])

  const onDrop = (targetStatus: FollowUpStatus) => {
    if (draggingKey) setStatus.mutate({ childKey: draggingKey, status: targetStatus })
    setDraggingKey(null)
    setDragOverCol(null)
  }

  useSetPageHeader({
    title: 'Хяналт',
    subtitle: 'Яаралтай эмчилгээ шаардлагатай хүүхдийн нэрийг сонгох эмчтэй цаг товлоно уу.',
  })

  return (
    <section className="flex min-h-0 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Нэрээр хайх…"
            className={`${inp} w-52 pl-9`}
          />
        </div>

        {/* Class pills */}
        {classes.length > 1 && (
          <>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => setClassFilter('')}
              className={`btn rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${classFilter === '' ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'}`}
            >
              Бүх анги
            </button>
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => setClassFilter(c === classFilter ? '' : c)}
                className={`btn rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${classFilter === c ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'}`}
              >
                {c}
              </button>
            ))}
          </>
        )}

        {(search || classFilter) && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Цэвэрлэх"
            onClick={() => {
              setSearch('')
              setClassFilter('')
            }}
          >
            <TrashIcon className="size-4" />
          </Button>
        )}
      </div>

      {isLoading || (seasons.length > 0 && !seasonId) ? (
        <SkeletonKanban />
      ) : flagged.length === 0 ? (
        <EmptyState
          Icon={ClipboardDocumentListIcon}
          title="Хяналт шаардлагатай сурагч алга"
          hint="Улаан (яаралтай) төлөвтэй сурагч гарвал энд харагдана."
        />
      ) : (
        <div className="flex min-h-0 flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 gap-5 overflow-x-auto px-0.5 pb-2">
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
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null)
                }}
                onDrop={() => onDrop(col.status)}
                onSend={(s) => {
                  void send(s).catch(() => {})
                }}
                onStatus={(childKey, st) => setStatus.mutate({ childKey, status: st })}
                onEdit={setEditing}
                onDragStart={setDraggingKey}
                onDragEnd={() => {
                  setDraggingKey(null)
                  setDragOverCol(null)
                }}
                onShowMore={() =>
                  setColPages((p) => ({
                    ...p,
                    [col.status]: (p[col.status] ?? PAGE_SIZE) + PAGE_SIZE,
                  }))
                }
                onCollapse={() => setColPages((p) => ({ ...p, [col.status]: PAGE_SIZE }))}
              />
            ))}
          </div>
          <BoardDentistPanel students={flagged} />
        </div>
      )}

      <FollowUpEditModal student={editing} onClose={() => setEditing(null)} />
    </section>
  )
}

export default FollowUpBoard
