'use client'

import { FollowUpRow } from '@/components/FollowUpRow'
import { useFollowUps } from '@/hooks/useFollowUps'

const FollowUpWorklistPage = () => {
  const { data, isLoading } = useFollowUps()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Дагах жагсаалт</h1>
      {isLoading ? (
        <p className="text-neutral-500">Ачааллаж байна…</p>
      ) : data && data.length > 0 ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="py-2 font-medium">Хүүхэд</th>
              <th className="font-medium">Асран хамгаалагч</th>
              <th className="font-medium">Төлөв</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <FollowUpRow key={r.id} row={r} />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-neutral-500">Дагах шаардлагатай бичлэг алга.</p>
      )}
    </section>
  )
}

export default FollowUpWorklistPage
