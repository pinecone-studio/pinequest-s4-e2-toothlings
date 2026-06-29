'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useMemo } from 'react'
import type { BoardStudent } from '@/hooks/useBoard'
import type { ChildSummaryPayload } from '@/hooks/useChildSummary'
import { useVolunteerDentists, useRequestHelp } from '@/hooks/useHelp'
import type { VolunteerDentist } from '@/hooks/useHelp'
import { DentistProfileCard } from './DentistProfileCard'

const VolunteerDentistsMap = dynamic(
  () => import('./VolunteerDentistsMap').then((m) => m.VolunteerDentistsMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-surface-raised" /> }
)

type Props = {
  student: BoardStudent
  detail?: ChildSummaryPayload
}

export const VolunteerDentistSection = ({ student, detail }: Props) => {
  const { data: dentists = [], isLoading } = useVolunteerDentists()
  const requestHelp = useRequestHelp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [requested, setRequested] = useState<string | null>(null)
  const [distances, setDistances] = useState<Record<string, number>>({})

  const handleDistances = useCallback((d: Record<string, number>) => {
    setDistances(d)
    // Auto-select the closest dentist that has a location
    const closest = Object.entries(d).sort(([, a], [, b]) => a - b)[0]
    if (closest) setSelectedId(closest[0])
  }, [])

  // Sort by distance when available, otherwise preserve server order
  const sorted = useMemo(() => {
    if (Object.keys(distances).length === 0) return dentists
    return [...dentists].sort((a, b) => {
      const da = distances[a.id] ?? Infinity
      const db = distances[b.id] ?? Infinity
      return da - db
    })
  }, [dentists, distances])

  const handleConnect = (dentist: VolunteerDentist) => {
    if (requested === dentist.id) return
    requestHelp.mutate(
      { childKey: student.childKey, level: 'red', note: `Шаардлагатай эмч: ${dentist.displayName}` },
      { onSuccess: () => setRequested(dentist.id) }
    )
  }

  const headline = detail?.summary?.headline

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-triage-red/30 bg-triage-red-bg/50 p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 items-center rounded-full bg-triage-red px-2.5 text-[11px] font-bold tracking-wide text-white">
          УЛААН
        </span>
        <p className="text-[13px] font-semibold text-text-base">Сайн дурын эмчтэй холбогдох</p>
      </div>

      {headline && (
        <div className="rounded-2xl bg-white/70 px-3 py-2.5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">Хүүхдийн хяналтын тойм</p>
          <p className="text-[13px] leading-relaxed text-text-base">{headline}</p>
        </div>
      )}

      <div className="h-52 overflow-hidden rounded-2xl border border-border">
        <VolunteerDentistsMap
          dentists={dentists}
          selectedId={selectedId}
          onSelect={(d) => setSelectedId(d.id)}
          onDistancesReady={handleDistances}
          className="h-full w-full"
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Холбогдох боломжтой шүдний эмч{isLoading ? '…' : `(${dentists.length})`}
          {Object.keys(distances).length > 0 && (
            <span className="ml-1 normal-case text-primary">· Ойролцоогоор эрэмблэгдсэн</span>
          )}
        </p>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-raised" />)}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-[13px] text-text-muted">Одоогоор боломжтой сайн дурын эмч байхгүй.</p>
        ) : (
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {sorted.map((d) => {
              const dist = distances[d.id]
              return (
                <div key={d.id}>
                  <DentistProfileCard
                    dentist={d}
                    active={selectedId === d.id}
                    connecting={requestHelp.isPending && selectedId === d.id}
                    onConnect={requested === d.id ? undefined : () => {
                      setSelectedId(d.id)
                      handleConnect(d)
                    }}
                  />
                  {dist != null && (
                    <p className="ml-3 mt-0.5 text-[10px] text-primary font-medium">📍 {dist.toFixed(0)} км</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {requested && (
        <p className="rounded-2xl bg-triage-green-bg px-3 py-2 text-[12px] text-triage-green">
          Хүсэлт илгээгдлээ. Эмч нэвтэрсний дараа холбоо барих болно.
        </p>
      )}
    </div>
  )
}
