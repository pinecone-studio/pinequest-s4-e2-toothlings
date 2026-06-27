'use client'

import { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useBoardStudents, useSendToParent, useDeleteChild, useSetFollowUpStatus, type BoardStudent } from '@/hooks/useBoard'
import { useToast } from '@/components/ui/Toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { SkeletonCard } from '@/components/ui/Skeleton'
import StudentGrid from '@/components/admin/summary/StudentGrid'
import StudentModal from '@/components/admin/summary/StudentModal'
import StudentEditModal from '@/components/admin/summary/StudentEditModal'
import EmptyState from '@/components/ui/EmptyState'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

const TRIAGE_GROUPS = [
  { level: 'red',    label: 'Яаралтай эмчилгээ шаардлагатай', dot: 'bg-triage-red',    text: 'text-triage-red' },
  { level: 'yellow', label: 'Эмчилгээ шаардлагатай',           dot: 'bg-triage-yellow', text: 'text-triage-yellow' },
  { level: 'green',  label: 'Дараагийн хяналтанд хамруулах',   dot: 'bg-triage-green',  text: 'text-triage-green' },
  { level: 'none',   label: 'Шалгаагүй',                       dot: 'bg-border',        text: 'text-text-muted' },
]

const SummaryBoard = () => {
  const { data: students, isLoading } = useBoardStudents()
  const send = useSendToParent()
  const del = useDeleteChild()
  const setStatus = useSetFollowUpStatus()
  const toast = useToast()
  const [selected, setSelected] = useState<BoardStudent | null>(null)
  const [editing, setEditing] = useState<BoardStudent | null>(null)
  const [deleting, setDeleting] = useState<BoardStudent | null>(null)
  const [q, setQ] = useState('')
  const [classFilter, setClassFilter] = useState('')

  const classes = useMemo(() => {
    const all = students ?? []
    const sorted = [...new Set(all.map((s) => s.className))].sort()
    return sorted.map((name) => ({ name, count: all.filter((s) => s.className === name).length }))
  }, [students])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (students ?? []).filter((s) => {
      if (classFilter && s.className !== classFilter) return false
      if (needle && !`${s.lastName} ${s.firstName} ${s.className}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [students, q, classFilter])

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
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Нэр, ангиар хайх…"
            aria-label="Сурагч хайх"
            className="w-52 rounded-xl border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Class filter tabs */}
        {!isLoading && classes.length > 1 && (
          <>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => setClassFilter('')}
              className={`btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${
                classFilter === ''
                  ? 'bg-primary text-text-on-primary'
                  : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'
              }`}
            >
              Бүгд <span className="ml-1 opacity-70">{students?.length ?? 0}</span>
            </button>
            {classes.map((cls) => (
              <button
                key={cls.name}
                onClick={() => setClassFilter(cls.name === classFilter ? '' : cls.name)}
                className={`btn rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  classFilter === cls.name
                    ? 'bg-primary text-text-on-primary'
                    : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'
                }`}
              >
                {cls.name} <span className="ml-1 opacity-70">{cls.count}</span>
              </button>
            ))}
          </>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={2} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState Icon={UsersIcon} title="Сурагч олдсонгүй" hint="Хайлт эсвэл ангийн шүүлтүүрийг өөрчилнө үү." />
      ) : (
        <div className="flex flex-col gap-8">
          {TRIAGE_GROUPS.map(({ level, label, dot, text }) => {
            const list = groups[level]
            if (!list?.length) return null
            return (
              <div key={level} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className={`size-2 shrink-0 rounded-full ${dot}`} />
                  <span className={`text-[13px] font-bold ${text}`}>{label}</span>
                  <span className="text-[12px] text-text-muted">· {list.length}</span>
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
      />
    </section>
  )
}

export default SummaryBoard
