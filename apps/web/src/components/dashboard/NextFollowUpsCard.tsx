'use client'

import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useFollowUps } from '@/hooks/useFollowUps'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }

// Today + next 2 days strip, plus the follow-ups scheduled in that window.
const NextFollowUpsCard = () => {
  const { data } = useFollowUps()
  if (!data) return <SkeletonCard rows={2} />

  const today = startOfDay(new Date())
  const windowEnd = new Date(today); windowEnd.setDate(windowEnd.getDate() + 3)
  const tiles = [0, 1, 2].map((k) => { const d = new Date(today); d.setDate(d.getDate() + k); return d })

  const upcoming = data
    .filter((f) => f.appointmentAt && new Date(f.appointmentAt) >= today && new Date(f.appointmentAt) < windowEnd)
    .sort((a, b) => new Date(a.appointmentAt!).getTime() - new Date(b.appointmentAt!).getTime())
    .slice(0, 3)

  return (
    <Card>
      <h2 className="mb-3 text-[15px] font-semibold text-text-base">Дараагийн дагалт</h2>

      <div className="mb-3 flex gap-2">
        {tiles.map((d, i) => (
          <div key={i} className={`flex-1 rounded-xl py-2 text-center ${i === 0 ? 'bg-primary text-text-on-primary' : 'bg-surface-raised'}`}>
            <p className="text-[17px] font-bold leading-none">{d.getDate()}</p>
            <p className={`mt-1 text-[10px] ${i === 0 ? 'opacity-80' : 'text-text-muted'}`}>{d.toLocaleDateString('mn-MN', { weekday: 'short' })}</p>
          </div>
        ))}
      </div>

      {upcoming.length === 0 ? (
        <EmptyState Icon={CalendarDaysIcon} title="Товлосон дагалт алга" hint="Ойрын 3 хоногт товлосон дагалт байхгүй." compact />
      ) : (
        <div className="flex flex-col">
          {upcoming.map((f) => (
            <div key={f.id ?? f.childKey} className="flex items-start gap-2.5 border-t border-border-muted py-2.5 first:border-t-0">
              <span className="mt-0.5 h-8 w-0.5 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0">
                <p className="truncate font-mono text-[12px] font-semibold text-text-base">{f.childKey.slice(0, 16)}</p>
                <p className="text-[11px] text-text-muted">
                  {new Date(f.appointmentAt!).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                  {f.notes ? ` · ${f.notes}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default NextFollowUpsCard
