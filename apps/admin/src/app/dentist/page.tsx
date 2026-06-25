'use client'

import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useReviewQueue } from '@/hooks/useScreening'
import HeroStrip from '@/components/dashboard/HeroStrip'
import UrgentActionCard from '@/components/dashboard/UrgentActionCard'

const TINT: Record<string, string> = {
  red: 'border-triage-red/30 bg-triage-red-bg',
  yellow: 'border-triage-yellow/30 bg-triage-yellow-bg',
  green: 'border-triage-green/30 bg-triage-green-bg',
}
const DOT: Record<string, string> = { red: 'bg-triage-red', yellow: 'bg-triage-yellow', green: 'bg-triage-green' }
const TXT: Record<string, string> = { red: 'text-triage-red', yellow: 'text-triage-yellow', green: 'text-triage-green' }
const LABEL: Record<string, string> = { red: 'Яаралтай', yellow: 'Хяналт', green: 'Аюулгүй' }

const DentistQueuePage = () => {
  const { data, isLoading } = useReviewQueue()

  const oldestRed = data
    ?.filter((s) => s.triageLevel === 'red')
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())[0]

  return (
    <section className="flex flex-col gap-5">
      <HeroStrip />

      {oldestRed && (
        <UrgentActionCard
          tone="red"
          title="Яаралтай улаан скрининг хянагдаагүй байна"
          body={`Хамгийн эртний: ${new Date(oldestRed.capturedAt).toLocaleDateString('mn-MN')} · ${oldestRed.childKey}`}
          ctaLabel="Хянах"
          ctaHref={`/dentist/screenings/${oldestRed.id}`}
        />
      )}

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Хянах дараалал</h2>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((s) => {
            const lvl = s.triageLevel
            return (
              <Link
                key={s.id}
                href={`/dentist/screenings/${s.id}`}
                className={`btn flex flex-col gap-3 rounded-2xl border p-4 shadow-(--shadow-card) transition-all duration-150 hover:shadow-(--shadow-card-lg) ${TINT[lvl] ?? 'border-border bg-surface'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${DOT[lvl]}`} />
                    <span className={`text-[13px] font-semibold ${TXT[lvl]}`}>{LABEL[lvl] ?? lvl}</span>
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {new Date(s.capturedAt).toLocaleDateString('mn-MN')}
                  </span>
                </div>
                <span className="font-mono text-[12px] text-text-muted">{s.childKey.slice(0, 16)}…</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                  Хянах <ArrowRightIcon className="size-3.5" />
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Хянах скрининг алга.</p>
      )}
    </section>
  )
}

export default DentistQueuePage
