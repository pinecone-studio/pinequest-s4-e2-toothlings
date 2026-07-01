'use client'

import type { UserRole } from '@pinequest/types'
import {
  AcademicCapIcon, BuildingOffice2Icon, UserGroupIcon,
  ViewfinderCircleIcon, SparklesIcon, ShieldCheckIcon, TrashIcon,
} from '@heroicons/react/24/solid'
import type { UserRow } from '@/hooks/useUsers'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import UserClassCell from './UserClassCell'

export const ROLE_LABEL: Record<UserRole, string> = {
  screener: 'Хэрэглэгч', teacher: 'Багш', parent: 'Эцэг эх', school_doctor: 'Сургуулийн эмч',
  dentist: 'Шүдний эмч', follow_up: 'Эмчийн хяналтын самбар', admin: 'Админ',
}
export const ROLE_OPTS: DropdownOption<UserRole>[] = [
  { value: 'teacher',       label: 'Багш',           Icon: AcademicCapIcon },
  { value: 'school_doctor', label: 'Сургуулийн эмч', Icon: BuildingOffice2Icon },
  { value: 'parent',        label: 'Эцэг эх',        Icon: UserGroupIcon },
  { value: 'screener',      label: 'Хэрэглэгч',      Icon: ViewfinderCircleIcon },
  { value: 'dentist',       label: 'Шүдний эмч',     Icon: SparklesIcon },
  { value: 'admin',         label: 'Админ',          Icon: ShieldCheckIcon },
]

const activePill = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-triage-green-bg text-triage-green' : 'bg-surface-raised text-text-muted'}`

type Props = {
  user: UserRow
  canManage: boolean
  isSelf: boolean
  selected: boolean
  onSelect: () => void
  onRole: (role: UserRole) => void
  onToggleActive: () => void
  onDelete: () => void
}

const UserTableRow = ({ user, canManage, isSelf, selected, onSelect, onRole, onToggleActive, onDelete }: Props) => (
  <tr className={`row-hover border-b border-border last:border-0 ${selected ? 'bg-primary/5' : ''}`}>
    <td className="px-4 py-3">
      {canManage && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          disabled={isSelf}
          aria-label={`${user.name}-г сонгох`}
          className="size-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
        />
      )}
    </td>
    <td className="px-4 py-3 text-text-base">
      {user.name}
      {isSelf && <span className="ml-2 rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-text-muted">Та</span>}
    </td>
    <td className="px-4 py-3 font-mono text-xs text-text-muted">{user.email}</td>
    <td className="px-4 py-3">
      {canManage
        ? <Dropdown value={user.role} options={ROLE_OPTS} onChange={onRole} ariaLabel="Үүрэг өөрчлөх" size="sm" className="w-40" />
        : <span className="text-xs text-text-base">{ROLE_LABEL[user.role]}</span>}
    </td>
    <td className="px-4 py-3"><UserClassCell user={user} /></td>
    <td className="px-4 py-3">
      {canManage
        ? <button onClick={onToggleActive} className={`${activePill(user.isActive)} transition-colors`}>{user.isActive ? 'Тийм' : 'Үгүй'}</button>
        : <span className={activePill(user.isActive)}>{user.isActive ? 'Тийм' : 'Үгүй'}</span>}
    </td>
    <td className="px-4 py-3 text-right">
      {canManage && !isSelf && (
        <button
          onClick={onDelete}
          aria-label={`${user.name}-г устгах`}
          title="Устгах"
          className="btn inline-flex items-center justify-center rounded-full border border-border p-1.5 text-text-muted transition-colors hover:border-triage-red hover:text-triage-red"
        >
          <TrashIcon className="size-4" />
        </button>
      )}
    </td>
  </tr>
)

export default UserTableRow
