'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TriageBadge } from '@/components/TriageBadge'
import { useChild } from '@/hooks/useChildren'
import { useScreenings } from '@/hooks/useScreenings'

const ChildDetailPage = () => {
  const id = useParams().id as string
  const { data: child } = useChild(id)
  const { data: screenings } = useScreenings({ childKey: child?.childKey })

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin" className="text-sm text-neutral-500 underline">
        ← Сургуулиуд
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {child ? `${child.lastName} ${child.firstName}` : '…'}
        </h1>
        {child ? (
          <p className="text-sm text-neutral-500">
            Суудал {child.rosterSlot} · {child.birthYear} · {child.childKey}
          </p>
        ) : null}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Скринингийн түүх</h2>
        {screenings && screenings.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {screenings.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 border-b border-neutral-100 py-2 text-sm"
              >
                <TriageBadge level={s.triageLevel} />
                <span>{new Date(s.capturedAt).toLocaleDateString('mn-MN')}</span>
                <span className="text-neutral-500">{s.seasonId}</span>
                <span className="text-neutral-500">{s.findings.length} илрэл</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Скрининг бүртгэгдээгүй байна.</p>
        )}
      </div>
    </section>
  )
}

export default ChildDetailPage
