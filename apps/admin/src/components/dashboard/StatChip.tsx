import Link from 'next/link'

type Tone = 'neutral' | 'red' | 'yellow' | 'green'

type StatChipProps = {
  label: string
  value: string | number
  tone?: Tone
  href?: string
}

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-surface border-border text-text-base',
  green: 'bg-triage-green-bg border-triage-green text-triage-green',
  yellow: 'bg-triage-yellow-bg border-triage-yellow text-triage-yellow',
  red: 'bg-triage-red-bg border-triage-red text-triage-red',
}

const StatChip = ({ label, value, tone = 'neutral', href }: StatChipProps) => {
  const className = `inline-flex flex-col items-center gap-0.5 rounded-xl border px-4 py-2 transition-opacity ${TONE_CLASS[tone]} ${href ? 'hover:opacity-80 cursor-pointer' : ''}`

  const inner = (
    <>
      <span className="text-xl font-semibold tabular-nums leading-none">{value}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </>
  )

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  )
}

export default StatChip
