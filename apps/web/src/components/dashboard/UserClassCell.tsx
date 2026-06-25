'use client'

import { useClasses } from '@/hooks/useClasses'
import { usePatchUser, type UserRow } from '@/hooks/useUsers'

const sel = 'rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-base'

// Per-row class assignment for a screener (class teacher). Own hook instance so
// useClasses(schoolId) is valid per row. Non-screeners show nothing to assign.
const UserClassCell = ({ user }: { user: UserRow }) => {
  const patch = usePatchUser()
  const { data: classes } = useClasses(user.schoolId ?? '')

  if (user.role !== 'screener') return <span className="text-xs text-text-muted">—</span>
  if (!user.schoolId) return <span className="text-xs text-text-muted">Сургууль сонгоно уу</span>

  return (
    <select
      value={user.classId ?? ''}
      onChange={(e) => patch.mutate({ id: user.id, classId: e.target.value || null })}
      className={sel}
    >
      <option value="">— Бүх бүлэг —</option>
      {classes?.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.seasonId}</option>)}
    </select>
  )
}

export default UserClassCell
