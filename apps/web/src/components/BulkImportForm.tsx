'use client'

import { useState } from 'react'
import type { RosterImportRow } from '@pinequest/types'
import { useBulkImport } from '@/hooks/useChildren'

// Each line: "slot, firstName, lastName, birthYear[, M|F]"
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
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-500">
        Ростер импорт — мөр бүр: суудал, нэр, овог, төрсөн он[, M/F]
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={'1, Бат, Болд, 2017\n2, Сараа, Дорж, 2017, F'}
        className="rounded-lg border border-neutral-300 p-2 font-mono text-sm"
      />
      <button
        onClick={() => bulk.mutate(parseRows(text))}
        disabled={bulk.isPending || !text.trim()}
        className="self-start rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Импортлох
      </button>
      {bulk.data ? (
        <p className="text-sm text-neutral-700">
          {bulk.data.created} хүүхэд нэмэгдлээ.
          {bulk.data.duplicates.length > 0
            ? ` Давхардсан: ${bulk.data.duplicates.map((d) => `суудал ${d.rosterSlot}`).join(', ')}`
            : ''}
        </p>
      ) : null}
    </div>
  )
}
