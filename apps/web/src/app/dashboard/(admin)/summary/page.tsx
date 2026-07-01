'use client'

import { useMemo, useState } from 'react'
import { UsersIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useBoardStudents, useSendToParent, useDeleteChild, useSetFollowUpStatus, type BoardStudent } from '@/hooks/useBoard'
import { useToast } from '@/components/ui/Toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import StudentGrid from '@/components/admin/summary/StudentGrid'
import StudentModal from '@/components/admin/summary/StudentModal'
import StudentEditModal from '@/components/admin/summary/StudentEditModal'
import SummaryFilterBar, { SECTION_LETTERS, SECTION_OTHER } from '@/components/admin/summary/SummaryFilterBar'
import EmptyState from '@/components/ui/EmptyState'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { useSeason } from '@/components/shared/SeasonProvider'
import { scopeStudentsToSeason } from '@/lib/seasonScope'

const TRIAGE_GROUPS = [
  { level: 'red',    label: 'Яаралтай эмчилгээ шаардлагатай', dot: 'bg-triage-red',    pill: 'bg-triage-red-bg text-triage-red' },
  { level: 'yellow', label: 'Эмчилгээ шаардлагатай',           dot: 'bg-triage-yellow', pill: 'bg-triage-yellow-bg text-triage-yellow' },
  { level: 'green',  label: 'Дараагийн хяналтанд хамруулах',   dot: 'bg-triage-green',  pill: 'bg-triage-green-bg text-triage-green' },
  { level: 'none',   label: 'Шалгаагүй',                       dot: 'bg-border',        pill: 'bg-surface-raised text-text-muted' },
]

// Ангийн нэр = анги + бүлэг (ж: "3А") — түүнийг задлан шүүлтэд тааруулна.
const gradeOf = (name: string) => name.match(/\d+/)?.[0] ?? ''
const sectionOf = (name: string) => name.replace(/\d+/, '').trim()
// "Бусад" = А-Н-д багтахгүй (эсвэл хоосон) бүлэг бүхий анги.
const matchesSection = (name: string, section: string) => {
  if (!section) return true
  const sec = sectionOf(name)
  return section === SECTION_OTHER ? !SECTION_LETTERS.includes(sec) : sec === section
}

const SummaryBoard = () => {
  const { data: allStudents, isLoading } = useBoardStudents()
  const { seasonId, setSeasonId } = useSeason()
  const send = useSendToParent()
  const del = useDeleteChild()
  const setStatus = useSetFollowUpStatus()
  const toast = useToast()
  const [selected, setSelected] = useState<BoardStudent | null>(null)
  const [editing, setEditing] = useState<BoardStudent | null>(null)
  const [deleting, setDeleting] = useState<BoardStudent | null>(null)
  const [q, setQ] = useState('')
  const [grade, setGrade] = useState('')
  const [section, setSection] = useState('')
  const [trendFilter, setTrendFilter] = useState(false)

  // Scope every child's triage to the selected season; kids not screened that
  // season fall into the "Шалгаагүй" group. Switching season regroups the board.
  const students = useMemo(() => scopeStudentsToSeason(allStudents, seasonId), [allStudents, seasonId])

  // Picking a full анги+бүлэг (ж: "3А") jumps the board to the season that class was
  // most recently screened in, so its results actually show instead of "Шалгаагүй".
  const jumpToSeason = (g: string, sec: string) => {
    if (!g || !sec) return
    let bestSeason = ''
    let bestAt = 0
    for (const s of allStudents ?? []) {
      if (gradeOf(s.className) !== g || !matchesSection(s.className, sec)) continue
      for (const h of s.seasonHistory) {
        const t = new Date(h.screenedAt).getTime()
        if (t >= bestAt) { bestAt = t; bestSeason = h.seasonId }
      }
      if (!bestSeason) bestSeason = s.seasonId // no screenings yet → the class's own season
    }
    if (bestSeason) setSeasonId(bestSeason)
  }
  const onGrade = (g: string) => { setGrade(g); jumpToSeason(g, section) }
  const onSection = (sec: string) => { setSection(sec); jumpToSeason(grade, sec) }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (students ?? []).filter((s) => {
      if (grade && gradeOf(s.className) !== grade) return false
      if (!matchesSection(s.className, section)) return false
      if (needle && !`${s.lastName} ${s.firstName}`.toLowerCase().includes(needle)) return false
      if (trendFilter) {
        const tag = s.trend?.tag
        if (tag !== 'worsened' && tag !== 'deteriorating') return false
      }
      return true
    })
  }, [students, q, grade, section, trendFilter])

  const groups = useMemo(() => {
    const by: Record<string, BoardStudent[]> = { red: [], yellow: [], green: [], none: [] }
    for (const s of filtered) by[s.latestLevel ?? 'none'].push(s)
    return by
  }, [filtered])

  const handleSend = async (s: BoardStudent) => {
    try {
      await send(s)
      toast.success(`${s.lastName}-д мэдэгдэл илгээлээ`)
    } catch {
      toast.error('Илгээхэд алдаа гарлаа')
    }
  }

  const handleDelete = () => {
    if (!deleting) return
    del.mutate(deleting.id, { onSettled: () => setDeleting(null) })
  }

  useSetPageHeader({ title: 'Дүгнэлт', subtitle: `Хүүхэд бүр дээр дарж дэлгэнгүй зураг ба дүгнэлтийг харна уу` })

  return (
    <section className="flex flex-col gap-5">
      <SummaryFilterBar
        q={q} onQ={setQ}
        grade={grade} onGrade={onGrade}
        section={section} onSection={onSection}
        trendFilter={trendFilter} onTrend={setTrendFilter}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState Icon={UsersIcon} title="Сурагч олдсонгүй" hint="Хайлт эсвэл ангийн шүүлтүүрийг өөрчилнө үү." />
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRIAGE_GROUPS.map(({ level, label, dot, pill }) => {
            const list = groups[level]
            if (!list?.length) return null
            return (
              <div key={level} className="flex flex-col gap-3">
                <div className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12.5px] font-bold ${pill}`}>
                  <span className={`size-2 rounded-full ${dot}`} />
                  {label}
                  <span className="rounded-full bg-surface/80 px-1.5 py-0.5 text-[11px] tabular-nums shadow-sm">{list.length}</span>
                </div>
                <StudentGrid
                  students={list}
                  onSelect={setSelected}
                  onSend={(s) => { void handleSend(s) }}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                  onStatus={(s, status) => { setStatus.mutate({ childKey: s.childKey, status }) }}
                />
              </div>
            )
          })}
        </div>
      )}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
      <StudentEditModal key={editing?.id ?? 'none'} student={editing} onClose={() => setEditing(null)} />

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isPending={del.isPending}
        title="Сурагч устгах"
        message={deleting ? `${deleting.lastName} ${deleting.firstName}-г жагсаалтаас хасах уу? Энэ үйлдлийг буцааж болохгүй.` : ''}
        confirmIcon={TrashIcon}
      />
    </section>
  )
}

export default SummaryBoard
