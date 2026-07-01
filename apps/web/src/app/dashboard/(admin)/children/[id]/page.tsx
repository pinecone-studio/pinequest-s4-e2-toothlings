'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TriageBadge } from '@/components/ui/TriageBadge'
import ChildSummaryCard from '@/components/admin/child/ChildSummaryCard'
import { useChild, useChildSummary } from '@/hooks/useChildren'
import { useScreenings } from '@/hooks/useScreenings'
import { formatSeason } from '@/lib/season'

const ChildDetailPage = () => {
  const id = useParams().id as string
  const { data: child } = useChild(id)
  const { data: payload } = useChildSummary(id)
  const { data: screenings } = useScreenings({ childKey: child?.childKey })

  const fullName = child ? `${child.lastName} ${child.firstName}` : '…'

  return (
    <section className="flex flex-col gap-5">
      <Link href="/dashboard" className="btn inline-flex w-fit items-center gap-1 text-sm text-primary transition-all duration-150 hover:underline">
        Буцах
      </Link>

      {/* Identity header */}
      <div className="blob border border-border bg-surface p-5 shadow-(--shadow-card)">
        <h1 className="text-xl font-semibold tracking-tight text-text-base">{fullName}</h1>
        {child && (
          <p className="mt-1 text-sm text-text-muted">
            Суудал {child.rosterSlot} · {child.birthYear} он ·{' '}
            <span className="font-mono text-xs">{child.childKey.slice(0, 12)}…</span>
          </p>
        )}
        {payload?.child.guardianEmail && (
          <p className="mt-0.5 text-[12px] text-text-muted">Асран хамгаалагч: {payload.child.guardianEmail}</p>
        )}
      </div>

      {/* AI screening summary (compliant) */}
      {payload?.summary ? (
        <ChildSummaryCard
          childName={fullName}
          guardianEmail={payload.child.guardianEmail}
          summary={payload.summary}
        />
      ) : (
        <div className="blob border border-border bg-surface p-5 text-sm text-text-muted shadow-(--shadow-card)">
          Энэ хүүхдэд үзүүлэлт бүртгэгдээгүй байна.
        </div>
      )}

      {/* History */}
      <div className="blob border border-border bg-surface shadow-(--shadow-card)">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text-muted">
            Үзүүлэлтийн түүх{payload ? ` (${payload.screeningCount})` : ''}
          </h2>
        </div>
        {screenings && screenings.length > 0 ? (
          <ul className="divide-y divide-border-muted">
            {screenings.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <TriageBadge level={s.triageLevel} />
                <span className="text-text-base">{new Date(s.capturedAt).toLocaleDateString('mn-MN')}</span>
                <span className="text-text-muted">{formatSeason(s.seasonId)}</span>
                <span className="text-text-muted">{s.findings.length} тэмдэглэгээ</span>
                <Link href={`/dashboard/dentist/screenings/${s.id}`} className="btn ml-auto text-xs text-primary transition-all duration-150 hover:underline">
                  Дэлгэрэнгүй
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-4 text-sm text-text-muted">Үзүүлэлт бүртгэгдээгүй байна.</p>
        )}
      </div>
    </section>
  )
}

export default ChildDetailPage
