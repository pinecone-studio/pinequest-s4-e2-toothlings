'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@pinequest/types'
import { useSession } from '@/components/providers'
import { homeForRole } from '@/lib/auth'
import { useUsers, usePatchUser } from '@/hooks/useUsers'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import UserClassCell from '@/components/admin/users/UserClassCell'
import UserCreateForm from '@/components/admin/users/UserCreateForm'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { SkeletonTable } from '@/components/ui/Skeleton'
import {
  AcademicCapIcon, BuildingOffice2Icon, UserGroupIcon,
  ViewfinderCircleIcon, SparklesIcon, ShieldCheckIcon,
} from '@heroicons/react/24/solid'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

const ROLE_LABEL: Record<UserRole, string> = {
  screener: 'Хэрэглэгч', teacher: 'Багш', parent: 'Эцэг эх', school_doctor: 'Сургуулийн эмч',
  dentist: 'Шүдний эмч', follow_up: 'Эмчийн хяналтын самбар', admin: 'Админ',
}
const ROLE_OPTS: DropdownOption<UserRole>[] = [
  { value: 'teacher',       label: 'Багш',           Icon: AcademicCapIcon },
  { value: 'school_doctor', label: 'Сургуулийн эмч', Icon: BuildingOffice2Icon },
  { value: 'parent',        label: 'Эцэг эх',        Icon: UserGroupIcon },
  { value: 'screener',      label: 'Хэрэглэгч',      Icon: ViewfinderCircleIcon },
  { value: 'dentist',       label: 'Шүдний эмч',     Icon: SparklesIcon },
  { value: 'admin',         label: 'Админ',          Icon: ShieldCheckIcon },
]

const AdminUsersPage = () => {
  const { role: myRole } = useSession()
  const router = useRouter()
  const canManage = myRole === 'admin'
  const allowed = myRole === 'admin' || myRole === 'school_doctor'
  const { data: users, isLoading } = useUsers()
  const patchUser = usePatchUser()
  const [adminGrant, setAdminGrant] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (myRole && !allowed) router.replace(homeForRole(myRole))
  }, [myRole, allowed, router])

  if (!myRole || !allowed) return null

  const handleRoleChange = (userId: string, userName: string, newRole: UserRole) => {
    if (newRole === 'admin') { setAdminGrant({ id: userId, name: userName }); return }
    patchUser.mutate({ id: userId, role: newRole })
  }

  useSetPageHeader({ title: 'Хэрэглэгчид' })

  return (
    <section className="flex flex-col gap-5">

      {canManage && <UserCreateForm />}

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="blob border border-border bg-surface shadow-(--shadow-card)">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Нэр', 'И-мэйл', 'Үүрэг', 'Бүлэг', 'Идэвхтэй'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="row-hover border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-base">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <Dropdown value={u.role} options={ROLE_OPTS} onChange={(v) => handleRoleChange(u.id, u.name, v)} ariaLabel="Үүрэг өөрчлөх" size="sm" className="w-40" />
                    ) : (
                      <span className="text-xs text-text-base">{ROLE_LABEL[u.role]}</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><UserClassCell user={u} /></td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <button
                        onClick={() => patchUser.mutate({ id: u.id, isActive: !u.isActive })}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${u.isActive ? 'bg-triage-green-bg text-triage-green' : 'bg-surface-raised text-text-muted'}`}
                      >
                        {u.isActive ? 'Тийм' : 'Үгүй'}
                      </button>
                    ) : (
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${u.isActive ? 'bg-triage-green-bg text-triage-green' : 'bg-surface-raised text-text-muted'}`}>
                        {u.isActive ? 'Тийм' : 'Үгүй'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={adminGrant !== null}
        onClose={() => setAdminGrant(null)}
        onConfirm={() => {
          if (adminGrant) patchUser.mutate({ id: adminGrant.id, role: 'admin' }, { onSettled: () => setAdminGrant(null) })
        }}
        isPending={patchUser.isPending}
        title="Админ эрх олгох"
        message={adminGrant ? `${adminGrant.name}-д бүрэн админ эрх олгох уу? Энэ хэрэглэгч системийн бүх тохиргоог удирдах боломжтой болно.` : ''}
        confirmLabel="Эрх олгох"
        variant="danger"
      />
    </section>
  )
}

export default AdminUsersPage
