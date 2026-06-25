'use client'

import Link from 'next/link'
import { ArrowRightIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import { useReviewQueue } from '@/hooks/useScreening'
import { useSeason } from '@/components/SeasonProvider'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)

// Clinical approval gate: screenings awaiting dentist confirm (review == null).
const DentistReviewQueueCard = () => {
  const { seasonId } = useSeason()
  const { data } = useReviewQueue(seasonId)
  if (!data) return <SkeletonCard rows={1} />

  const awaiting = data.filter((r) => !r.review)
  const highPri  = awaiting.filter((r) => r.triageLevel === 'red').length
  const oldest   = awaiting.reduce((m, r) => Math.max(m, daysSince(r.capturedAt)), 0)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-text-base">Эмчийн хяналт</h2>
        <Link href="/dashboard/dentist" className="btn flex items-center gap-1 text-[11px] font-semibold text-primary transition-all duration-150 hover:gap-1.5">
          Хяналт руу <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>

      {awaiting.length === 0 ? (
        <EmptyState Icon={ClipboardDocumentCheckIcon} title="Хүлээгдэж буй хяналт алга" hint="Бүх скрининг баталгаажсан." compact />
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-surface-raised p-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-[15px] font-bold text-primary">
            {awaiting.length}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-base">{awaiting.length} баталгаажуулах хүлээгдэж буй</p>
            <p className="text-[11.5px] text-text-muted">
              {highPri} яаралтай · хамгийн эртний {oldest} хоног
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

export default DentistReviewQueueCard
