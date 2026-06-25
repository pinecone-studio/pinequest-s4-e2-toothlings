'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ReviewForm } from '@/components/ReviewForm'
import { TriageBadge } from '@/components/TriageBadge'
import { useScreening } from '@/hooks/useScreening'

const ScreeningChartPage = () => {
  const id = useParams().id as string
  const { data: s } = useScreening(id)

  if (!s) return <p className="text-sm text-text-muted">Ачааллаж байна…</p>

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dentist" className="text-sm text-primary hover:underline">
        ← Жагсаалт
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Скрининг</h1>
        <span className="text-sm text-text-muted">AI:</span>
        <TriageBadge level={s.triageLevel} />
        {s.review ? (
          <>
            <span className="text-sm text-text-muted">Эмч:</span>
            <TriageBadge level={s.review.confirmedLevel} />
          </>
        ) : null}
      </div>

      <p className="text-sm text-text-muted">
        {new Date(s.capturedAt).toLocaleDateString('mn-MN')} · {s.childKey} ·{' '}
        <span className="font-mono">{s.modelName}</span>
      </p>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-2 text-sm font-medium text-text-muted">Илрэл ({s.findings.length})</h2>
        <ul className="flex flex-col gap-1 text-sm text-text-base">
          {s.findings.map((f) => (
            <li key={f.id} className="flex gap-2">
              <span className="font-medium">{f.className}</span>
              <span className="text-text-muted">{(f.confidence * 100).toFixed(0)}%</span>
              {f.fdi ? <span className="font-mono text-text-muted">FDI {f.fdi}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <ReviewForm screeningId={s.id} current={s.review?.confirmedLevel ?? null} />
      </div>
    </section>
  )
}

export default ScreeningChartPage
