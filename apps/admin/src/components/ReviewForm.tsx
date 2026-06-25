'use client'

import { useState } from 'react'
import { useSubmitReview } from '@/hooks/useScreening'
import { TriageBadge } from './TriageBadge'

const LEVELS = ['green', 'yellow', 'red'] as const

export const ReviewForm = ({
  screeningId,
  current,
}: {
  screeningId: string
  current: string | null
}) => {
  const submit = useSubmitReview(screeningId)
  const [level, setLevel] = useState(current ?? '')
  const [note, setNote] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-text-muted">
        Эмчийн дүгнэлт (баталгаажуулах / өөрчлөх)
      </h2>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-lg border px-2 py-1 transition-colors ${level === l ? 'border-primary bg-primary-subtle' : 'border-border hover:border-primary/50'}`}
          >
            <TriageBadge level={l} />
          </button>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Тэмдэглэл (заавал биш)"
        rows={2}
        className="rounded-lg border border-border bg-surface p-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={() => level && submit.mutate({ confirmedLevel: level, note: note || undefined })}
        disabled={!level || submit.isPending}
        className="self-start rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {submit.isPending ? 'Хадгалж байна…' : 'Хадгалах'}
      </button>
      {submit.isSuccess ? (
        <p className="text-sm text-triage-green">Дүгнэлт хадгалагдлаа.</p>
      ) : null}
    </div>
  )
}
