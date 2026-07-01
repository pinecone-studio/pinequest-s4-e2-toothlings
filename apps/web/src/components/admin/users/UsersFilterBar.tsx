'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import type { UserRole } from '@pinequest/types'
import { ROLE_LABEL } from './UserTableRow'

export type ActiveFilter = 'all' | 'active' | 'inactive'
type RoleCount = { role: UserRole; count: number }

type Props = {
  q: string; onQ: (v: string) => void
  role: UserRole | ''; onRole: (r: UserRole | '') => void
  active: ActiveFilter; onActive: (a: ActiveFilter) => void
  roles: RoleCount[]
  total: number
}

const chip = (on: boolean) =>
  `btn rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all ${
    on ? 'bg-primary text-text-on-primary' : 'border border-border bg-surface text-text-muted hover:border-primary hover:text-primary'
  }`

const ACTIVE: { v: ActiveFilter; label: string }[] = [
  { v: 'all', label: 'Бүгд' },
  { v: 'active', label: 'Идэвхтэй' },
  { v: 'inactive', label: 'Идэвхгүй' },
]

const UsersFilterBar = ({ q, onQ, role, onRole, active, onActive, roles, total }: Props) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Нэр, и-мэйл, үүргээр хайх…"
          aria-label="Хэрэглэгч хайх"
          className="w-64 rounded-full border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <span className="text-xs text-text-muted">{total} хэрэглэгч</span>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => onRole('')} className={chip(role === '')}>Бүх үүрэг</button>
      {roles.map((r) => (
        <button key={r.role} onClick={() => onRole(r.role === role ? '' : r.role)} className={chip(role === r.role)}>
          {ROLE_LABEL[r.role]} <span className="ml-1 opacity-70">{r.count}</span>
        </button>
      ))}
      <div className="h-5 w-px bg-border" />
      {ACTIVE.map((a) => (
        <button key={a.v} onClick={() => onActive(a.v)} className={chip(active === a.v)}>{a.label}</button>
      ))}
    </div>
  </div>
)

export default UsersFilterBar
