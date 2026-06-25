'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { Child, TriageLevel } from '@pinequest/types'

type Props = { rows: Child[]; levelByKey?: Record<string, TriageLevel> }

const DOT: Record<string, string> = { green: 'bg-triage-green', yellow: 'bg-triage-yellow', red: 'bg-triage-red' }
const LABEL: Record<string, string> = { green: 'Аюулгүй', yellow: 'Хяналт', red: 'Яаралтай' }

export const RosterTable = ({ rows, levelByKey = {} }: Props) => {
  const router = useRouter()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((c) =>
      `${c.lastName} ${c.firstName} ${c.rosterSlot}`.toLowerCase().includes(needle),
    )
  }, [rows, q])

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
        <MagnifyingGlassIcon className="size-4 shrink-0 text-text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Сурагч хайх (нэр, суудал)…"
          className="w-full bg-transparent text-sm text-text-base placeholder:text-text-muted focus:outline-none"
        />
        {q && <span className="shrink-0 text-[11px] text-text-muted">{filtered.length}</span>}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted">Илэрц алга.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[12px] text-text-muted">
                <th className="px-4 py-3 font-medium">Суудал</th>
                <th className="px-4 py-3 font-medium">Нэр</th>
                <th className="px-4 py-3 font-medium">Төрсөн он</th>
                <th className="px-4 py-3 font-medium">Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const level = levelByKey[c.childKey]
                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/admin/children/${c.id}`)}
                    className="btn cursor-pointer border-b border-border-muted transition-colors last:border-0 hover:bg-surface-raised"
                  >
                    <td className="px-4 py-3 text-text-muted">{c.rosterSlot}</td>
                    <td className="px-4 py-3 font-medium text-text-base">{c.lastName} {c.firstName}</td>
                    <td className="px-4 py-3 text-text-muted">{c.birthYear}</td>
                    <td className="px-4 py-3">
                      {level ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`size-2 rounded-full ${DOT[level]}`} />
                          <span className="text-[12px] text-text-muted">{LABEL[level]}</span>
                        </span>
                      ) : (
                        <span className="text-[12px] text-text-muted">— скрининг алга</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
