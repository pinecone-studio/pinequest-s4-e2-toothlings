'use client'

import { FollowUpRow } from '@/components/FollowUpRow'
import { useFollowUps } from '@/hooks/useFollowUps'
import HeroStrip from '@/components/dashboard/HeroStrip'
import UrgentActionCard from '@/components/dashboard/UrgentActionCard'

const FollowUpWorklistPage = () => {
  const { data, isLoading } = useFollowUps()

  const flagged = data?.filter(f => f.status === 'flagged') ?? []

  return (
    <section className="flex flex-col gap-5">
      <HeroStrip />

      {flagged.length > 0 && (
        <UrgentActionCard
          tone="yellow"
          title={`${flagged.length} хүүхэд дагах шаардлагатай`}
          body="Холбогдож, эмчид уламжлах эсэхийг шийдэх шаардлагатай."
          ctaLabel="Дагах жагсаалт харах"
          ctaHref="/follow-up"
        />
      )}

      <h2 className="text-lg font-semibold tracking-tight text-text-base">Дагах жагсаалт</h2>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : data && data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-text-muted">Хүүхэд</th>
                <th className="px-4 py-3 font-medium text-text-muted">Асран хамгаалагч</th>
                <th className="px-4 py-3 font-medium text-text-muted">Төлөв</th>
                <th className="px-4 py-3 font-medium text-text-muted">Өөрчлөх</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <FollowUpRow key={r.id} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-text-muted">Дагах шаардлагатай бичлэг алга.</p>
      )}
    </section>
  )
}

export default FollowUpWorklistPage
