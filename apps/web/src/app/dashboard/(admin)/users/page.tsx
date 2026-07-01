'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UsersIcon } from '@heroicons/react/24/solid'
import type { UserRole } from '@pinequest/types'
import { useSession } from '@/components/providers'
import { decodeToken, homeForRole } from '@/lib/auth'
import { useUsers, usePatchUser, useDeleteUser, type UserRow } from '@/hooks/useUsers'
import UserCreateForm from '@/components/admin/users/UserCreateForm'
import UserTableRow, { ROLE_LABEL } from '@/components/admin/users/UserTableRow'
import UsersFilterBar, { type ActiveFilter } from '@/components/admin/users/UsersFilterBar'
import UsersBulkBar from '@/components/admin/users/UsersBulkBar'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { SkeletonTable } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

const DELETE_ERR: Record<string, string> = {
  cannot_delete_self: 'Өөрийгөө устгах боломжгүй.',
  last_admin: 'Системд дор хаяж нэг админ үлдэх ёстой.',
}

const AdminUsersPage = () => {
  const { role: myRole, token } = useSession()
  const router = useRouter()
  const canManage = myRole === 'admin'
  const allowed = myRole === 'admin' || myRole === 'school_doctor'
  const myId = token ? decodeToken(token)?.sub : undefined
  const { data: users, isLoading } = useUsers()
  const patchUser = usePatchUser()
  const deleteUser = useDeleteUser()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [adminGrant, setAdminGrant] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState<UserRow | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    if (myRole && !allowed) router.replace(homeForRole(myRole))
  }, [myRole, allowed, router])

  const roleCounts = useMemo(() => {
    const by = new Map<UserRole, number>()
    for (const u of users ?? []) by.set(u.role, (by.get(u.role) ?? 0) + 1)
    return [...by.entries()].map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count)
  }, [users])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (users ?? []).filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false
      if (activeFilter !== 'all' && u.isActive !== (activeFilter === 'active')) return false
      if (needle && !`${u.name} ${u.email} ${ROLE_LABEL[u.role]}`.toLowerCase().includes(needle)) return false
      return true
    })
  }, [users, q, roleFilter, activeFilter])

  useSetPageHeader({ title: 'Хэрэглэгчид' })

  if (!myRole || !allowed) return null

  // Selectable = everyone visible except yourself (you can't bulk-act on your own row).
  const selectableIds = filtered.filter((u) => u.id !== myId).map((u) => u.id)
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id))
  const selectedIds = [...selected].filter((id) => id !== myId)

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectableIds))

  const handleRoleChange = (userId: string, userName: string, newRole: UserRole) => {
    if (newRole === 'admin') { setAdminGrant({ id: userId, name: userName }); return }
    patchUser.mutate({ id: userId, role: newRole })
  }

  const handleDelete = () => {
    if (!deleting) return
    const name = deleting.name
    deleteUser.mutate(deleting.id, {
      onSuccess: () => { toast.success(`${name}-г устгалаа`); setDeleting(null) },
      onError: (e) => toast.error(DELETE_ERR[e instanceof Error ? e.message : ''] ?? 'Устгахад алдаа гарлаа'),
    })
  }

  const bulkSetActive = async (isActive: boolean) => {
    await Promise.allSettled(selectedIds.map((id) => patchUser.mutateAsync({ id, isActive })))
    toast.success(`${selectedIds.length} хэрэглэгч шинэчлэгдлээ`)
    setSelected(new Set())
  }

  const bulkDelete = async () => {
    const res = await Promise.allSettled(selectedIds.map((id) => deleteUser.mutateAsync(id)))
    const ok = res.filter((r) => r.status === 'fulfilled').length
    if (ok) toast.success(`${ok} хэрэглэгч устлаа`)
    if (ok < selectedIds.length) toast.error(`${selectedIds.length - ok} хэрэглэгчийг устгаж чадсангүй`)
    setSelected(new Set())
    setBulkDeleting(false)
  }

  const bulkPending = patchUser.isPending || deleteUser.isPending

  return (
    <section className="flex flex-col gap-5">
      {canManage && <UserCreateForm />}

      <UsersFilterBar
        q={q} onQ={setQ}
        role={roleFilter} onRole={setRoleFilter}
        active={activeFilter} onActive={setActiveFilter}
        roles={roleCounts}
        total={filtered.length}
      />

      {canManage && selectedIds.length > 0 && (
        <UsersBulkBar
          count={selectedIds.length}
          pending={bulkPending}
          onActivate={() => void bulkSetActive(true)}
          onDeactivate={() => void bulkSetActive(false)}
          onDelete={() => setBulkDeleting(true)}
          onClear={() => setSelected(new Set())}
        />
      )}

      {isLoading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <EmptyState Icon={UsersIcon} title="Хэрэглэгч олдсонгүй" hint="Хайлт эсвэл шүүлтүүрээ өөрчилнө үү." />
      ) : (
        <div className="blob border border-border bg-surface shadow-(--shadow-card)">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3">
                  {canManage && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Бүгдийг сонгох"
                      className="size-4 cursor-pointer accent-primary"
                    />
                  )}
                </th>
                {['Нэр', 'И-мэйл', 'Үүрэг', 'Бүлэг', 'Идэвхтэй'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium text-text-muted">{h}</th>
                ))}
                <th scope="col" className="px-4 py-3"><span className="sr-only">Үйлдэл</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <UserTableRow
                  key={u.id}
                  user={u}
                  canManage={canManage}
                  isSelf={u.id === myId}
                  selected={selected.has(u.id)}
                  onSelect={() => toggle(u.id)}
                  onRole={(v) => handleRoleChange(u.id, u.name, v)}
                  onToggleActive={() => patchUser.mutate({ id: u.id, isActive: !u.isActive })}
                  onDelete={() => setDeleting(u)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={adminGrant !== null}
        onClose={() => setAdminGrant(null)}
        onConfirm={() => { if (adminGrant) patchUser.mutate({ id: adminGrant.id, role: 'admin' }, { onSettled: () => setAdminGrant(null) }) }}
        isPending={patchUser.isPending}
        title="Админ эрх олгох"
        message={adminGrant ? `${adminGrant.name}-д бүрэн админ эрх олгох уу? Энэ хэрэглэгч системийн бүх тохиргоог удирдах боломжтой болно.` : ''}
        confirmLabel="Эрх олгох"
        variant="danger"
      />

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isPending={deleteUser.isPending}
        title="Хэрэглэгч устгах"
        message={deleting ? `${deleting.name}-г системээс бүрмөсөн устгах уу? Энэ үйлдлийг буцааж болохгүй.` : ''}
        confirmLabel="Устгах"
        variant="danger"
      />

      <ConfirmModal
        open={bulkDeleting}
        onClose={() => setBulkDeleting(false)}
        onConfirm={() => void bulkDelete()}
        isPending={deleteUser.isPending}
        title="Сонгосон хэрэглэгчид устгах"
        message={`Сонгосон ${selectedIds.length} хэрэглэгчийг системээс бүрмөсөн устгах уу? Энэ үйлдлийг буцааж болохгүй.`}
        confirmLabel="Устгах"
        variant="danger"
      />
    </section>
  )
}

export default AdminUsersPage
