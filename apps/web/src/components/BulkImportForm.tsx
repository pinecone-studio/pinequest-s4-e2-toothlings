'use client'

import { useState } from 'react'
import type { RosterImportRow } from '@pinequest/types'
import { useBulkImport } from '@/hooks/useChildren'

const parseRows = (text: string): RosterImportRow[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [slot, firstName, lastName, birthYear, gender] = line.split(',').map((c) => c.trim())
      return {
        rosterSlot: Number(slot),
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        birthYear: Number(birthYear),
        gender: gender === 'M' || gender === 'F' ? gender : undefined,
      }
    })

export const BulkImportForm = ({ classId }: { classId: string }) => {
  const bulk = useBulkImport(classId)
  const [text, setText] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-text-muted">
        Ростер импорт — мөр бүр: суудал, нэр, овог, төрсөн он[, M/F]
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={'1, Бат, Болд, 2017\n2, Сараа, Дорж, 2017, F'}
        className="rounded-lg border border-border bg-surface p-2 font-mono text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={() => bulk.mutate(parseRows(text))}
        disabled={bulk.isPending || !text.trim()}
        className="self-start rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        Импортлох
      </button>
      {bulk.data ? (
        <p className="text-sm text-text-base">
          {bulk.data.created} хүүхэд нэмэгдлээ.
          {bulk.data.duplicates.length > 0
            ? ` Давхардсан: ${bulk.data.duplicates.map((d) => `суудал ${d.rosterSlot}`).join(', ')}`
            : ''}
        </p>
      ) : null}
    </div>
  )
}
