'use client'

import { useClasses } from '@/hooks/useClasses'
import { usePatchUser, type UserRow } from '@/hooks/useUsers'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import { formatSeason } from '@/lib/season'

// Per-row class assignment for a screener (class teacher). Own hook instance so
// useClasses(schoolId) is valid per row. Non-screeners show nothing to assign.
const UserClassCell = ({ user }: { user: UserRow }) => {
  const patch = usePatchUser()
  const { data: classes } = useClasses(user.schoolId ?? '')

  if (user.role !== 'screener') return <span className="text-xs text-text-muted">—</span>
  if (!user.schoolId) return <span className="text-xs text-text-muted">Сургууль сонгоно уу</span>

  const options: DropdownOption[] = [
    { value: '', label: '— Бүх бүлэг —' },
    ...(classes ?? []).map((c) => ({ value: c.id, label: `${c.name} · ${formatSeason(c.seasonId)}` })),
  ]

  return (
    <Dropdown
      value={user.classId ?? ''}
      options={options}
      onChange={(v) => patch.mutate({ id: user.id, classId: v || null })}
      ariaLabel="Бүлэг хуваарилах"
      size="sm"
      className="w-44"
    />
  )
}

export default UserClassCell
