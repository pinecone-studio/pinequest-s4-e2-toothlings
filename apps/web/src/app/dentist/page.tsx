'use client'

import Link from 'next/link'
import { TriageBadge } from '@/components/TriageBadge'
import { useReviewQueue } from '@/hooks/useScreening'

const DentistQueuePage = () => {
  const { data, isLoading } = useReviewQueue()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Скрининг — хянах</h1>
      {isLoading ? (
        <p className="text-neutral-500">Ачааллаж байна…</p>
      ) : data && data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {data.map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <TriageBadge level={s.triageLevel} />
              <Link href={`/dentist/screenings/${s.id}`} className="underline">
                {new Date(s.capturedAt).toLocaleDateString('mn-MN')} · {s.childKey}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">Хянах скрининг алга.</p>
      )}
    </section>
  )
}

export default DentistQueuePage
