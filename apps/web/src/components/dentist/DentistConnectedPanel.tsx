'use client'

import { PhoneIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import type { HelpRequestRow } from '@/hooks/useHelp'

// Right-side panel of connected patients (avatar cards), like the reference's people list.
const DentistConnectedPanel = ({ connected }: { connected: HelpRequestRow[] }) => (
  <aside className="flex flex-col gap-3 self-start rounded-3xl border border-border bg-surface p-5 shadow-(--shadow-card)">
    <div className="flex items-center gap-2">
      <UserGroupIcon className="size-4 text-primary" />
      <h2 className="text-[15px] font-semibold text-text-base">Холбогдсон сурагчид</h2>
    </div>

    {connected.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-border px-3 py-8 text-center text-[12px] text-text-muted">
        Холбогдсон сурагч одоогоор алга.
      </p>
    ) : (
      connected.map((r) => {
        const name = r.child ? `${r.child.lastName} ${r.child.firstName}` : r.childKey.slice(0, 8)
        const red = r.level === 'red'
        return (
          <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-[14px] font-bold ${red ? 'text-triage-red' : 'text-triage-yellow'}`}>
              {name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-base">{name}</p>
              <p className="text-[11px] text-text-muted">{red ? 'Яаралтай' : 'Эмчилгээ шаардлагатай'}</p>
            </div>
            {r.child?.guardianPhone && (
              <a
                href={`tel:${r.child.guardianPhone}`}
                aria-label="Залгах"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary transition hover:bg-primary/20"
              >
                <PhoneIcon className="size-4" />
              </a>
            )}
          </div>
        )
      })
    )}
  </aside>
)

export default DentistConnectedPanel
