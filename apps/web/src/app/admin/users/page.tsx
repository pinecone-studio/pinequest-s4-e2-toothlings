'use client'

import { useState, type FormEvent } from 'react'
import type { UserRole } from '@pinequest/types'
import { useUsers, useCreateUser, usePatchUser } from '@/hooks/useUsers'
import { useSchools } from '@/hooks/useSchools'

const ROLES: UserRole[] = ['screener', 'dentist', 'follow_up', 'admin']
const ROLE_LABEL: Record<UserRole, string> = {
  screener: 'Скрининг хийгч',
  dentist: 'Шүдний эмч',
  follow_up: 'Дагах ажилтан',
  admin: 'Админ',
}

const inp = 'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

const AdminUsersPage = () => {
  const { data: users, isLoading } = useUsers()
  const { data: schools } = useSchools()
  const createUser = useCreateUser()
  const patchUser = usePatchUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('screener')
  const [schoolId, setSchoolId] = useState('')

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name || !email || !password) return
    createUser.mutate({ name, email, password, role, schoolId: schoolId || undefined }, {
      onSuccess: () => { setName(''); setEmail(''); setPassword(''); setSchoolId('') },
    })
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-tight text-text-base">Хэрэглэгчид</h1>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <h2 className="mb-3 text-sm font-semibold text-text-muted">Шинэ хэрэглэгч нэмэх</h2>
        <form onSubmit={onAdd} className="grid grid-cols-2 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" className={inp} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="И-мэйл" type="email" className={inp} autoComplete="off" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Нууц үг (≥6)" type="password" className={inp} autoComplete="new-password" />
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inp}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className={inp}>
            <option value="">— Бүх сургууль —</option>
            {schools?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-hover transition-colors">
            Нэмэх
          </button>
        </form>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Ачааллаж байна…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium text-text-muted">Нэр</th>
                <th className="px-4 py-3 font-medium text-text-muted">И-мэйл</th>
                <th className="px-4 py-3 font-medium text-text-muted">Үүрэг</th>
                <th className="px-4 py-3 font-medium text-text-muted">Идэвхтэй</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-base">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => patchUser.mutate({ id: u.id, role: e.target.value as UserRole })}
                      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-base"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => patchUser.mutate({ id: u.id, isActive: !u.isActive })}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${u.isActive ? 'bg-triage-green-bg text-triage-green' : 'bg-surface-raised text-text-muted'}`}
                    >
                      {u.isActive ? 'Тийм' : 'Үгүй'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminUsersPage
