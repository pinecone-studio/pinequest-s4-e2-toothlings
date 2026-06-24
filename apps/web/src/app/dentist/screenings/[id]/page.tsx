'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ReviewForm } from '@/components/ReviewForm'
import { TriageBadge } from '@/components/TriageBadge'
import { useScreening } from '@/hooks/useScreening'

const ScreeningChartPage = () => {
  const id = useParams().id as string
  const { data: s } = useScreening(id)

  if (!s) return <p className="text-neutral-500">Ачааллаж байна…</p>

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dentist" className="text-sm text-neutral-500 underline">
        ← Жагсаалт
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Скрининг</h1>
        <span className="text-sm text-neutral-500">AI:</span>
        <TriageBadge level={s.triageLevel} />
        {s.review ? (
          <>
            <span className="text-sm text-neutral-500">Эмч:</span>
            <TriageBadge level={s.review.confirmedLevel} />
          </>
        ) : null}
      </div>
      <p className="text-sm text-neutral-500">
        {new Date(s.capturedAt).toLocaleDateString('mn-MN')} · {s.childKey} · {s.modelName}
      </p>
      <div>
        <h2 className="mb-1 text-sm font-medium text-neutral-500">Илрэл ({s.findings.length})</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {s.findings.map((f) => (
            <li key={f.id}>
              {f.className} · {(f.confidence * 100).toFixed(0)}%
              {f.fdi ? ` · FDI ${f.fdi}` : ''}
            </li>
          ))}
        </ul>
      </div>
      <ReviewForm screeningId={s.id} current={s.review?.confirmedLevel ?? null} />
    </section>
  )
}

export default ScreeningChartPage
