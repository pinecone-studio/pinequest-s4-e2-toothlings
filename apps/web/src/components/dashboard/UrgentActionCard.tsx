import Link from 'next/link'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

type UrgentActionCardProps = {
  tone: 'red' | 'yellow'
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
}

const UrgentActionCard = ({ tone, title, body, ctaLabel, ctaHref }: UrgentActionCardProps) => {
  const isRed = tone === 'red'
  return (
    <div
      className={`flex items-start gap-4 rounded-xl border p-4
        ${isRed ? 'border-triage-red bg-triage-red-bg' : 'border-triage-yellow bg-triage-yellow-bg'}`}
    >
      <ExclamationCircleIcon
        className={`mt-0.5 size-5 shrink-0 ${isRed ? 'text-triage-red' : 'text-triage-yellow'}`}
      />
      <div className="flex-1">
        <p className="font-medium text-text-base">{title}</p>
        <p className="mt-0.5 text-sm text-text-muted">{body}</p>
      </div>
      <Link
        href={ctaHref}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80
          ${isRed ? 'bg-triage-red' : 'bg-triage-yellow'}`}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

export default UrgentActionCard
