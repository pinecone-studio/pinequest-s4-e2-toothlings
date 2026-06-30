'use client'

import { useState, type FormEvent } from 'react'
import type { UserRole } from '@pinequest/types'
import { useCreateUser } from '@/hooks/useUsers'
import { useSchools } from '@/hooks/useSchools'
import { useClasses } from '@/hooks/useClasses'
import Button from '@/components/ui/Button'
import Dropdown, { type DropdownOption } from '@/components/ui/Dropdown'
import { formatSeason } from '@/lib/season'
import {
  AcademicCapIcon, BuildingOffice2Icon, UserGroupIcon, ViewfinderCircleIcon,
  SparklesIcon, ShieldCheckIcon, BuildingLibraryIcon,
} from '@heroicons/react/24/solid'

const ROLE_OPTS: DropdownOption<UserRole>[] = [
  { value: 'teacher',       label: 'Багш',           Icon: AcademicCapIcon },
  { value: 'school_doctor', label: 'Сургуулийн эмч', Icon: BuildingOffice2Icon },
  { value: 'parent',        label: 'Эцэг эх',        Icon: UserGroupIcon },
  { value: 'screener',      label: 'Хэрэглэгч',      Icon: ViewfinderCircleIcon },
  { value: 'dentist',       label: 'Шүдний эмч',     Icon: SparklesIcon },
  { value: 'admin',         label: 'Админ',          Icon: ShieldCheckIcon },
]

const inp = 'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

const UserCreateForm = () => {
  const createUser = useCreateUser()
  const { data: schools } = useSchools()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('screener')
  const [schoolId, setSchoolId] = useState('')
  const [classId, setClassId] = useState('')
  const { data: classes } = useClasses(schoolId)

  const onAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name || !email || !password) return
    createUser.mutate(
      { name, email, password, role, phone: phone || undefined, schoolId: schoolId || undefined, classId: classId || undefined },
      { onSuccess: () => { setName(''); setEmail(''); setPassword(''); setPhone(''); setSchoolId(''); setClassId('') } },
    )
  }

  return (
    <div className="blob border border-border bg-surface p-5 shadow-(--shadow-card)">
      <h2 className="mb-3 text-sm font-semibold text-text-muted">Шинэ хэрэглэгч нэмэх</h2>
      <form onSubmit={onAdd} className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр" className={inp} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="И-мэйл" type="email" className={inp} autoComplete="off" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Нууц үг (≥6)" type="password" className={inp} autoComplete="new-password" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Утас" type="tel" className={inp} autoComplete="off" />
        <Dropdown value={role} options={ROLE_OPTS} onChange={setRole} ariaLabel="Үүрэг сонгох" />
        <Dropdown
          value={schoolId}
          options={[{ value: '', label: '— Бүх сургууль —', Icon: BuildingLibraryIcon }, ...(schools ?? []).map((s) => ({ value: s.id, label: s.name }))]}
          onChange={(v) => { setSchoolId(v); setClassId('') }}
          ariaLabel="Сургууль сонгох"
        />
        {role === 'screener' && schoolId && (
          <Dropdown
            className="col-span-2"
            value={classId}
            options={[{ value: '', label: '— Бүлэг (багшийг бүлэгт хуваарилах) —' }, ...(classes ?? []).map((c) => ({ value: c.id, label: `${c.name} · ${formatSeason(c.seasonId)}` }))]}
            onChange={setClassId}
            ariaLabel="Бүлэг сонгох"
          />
        )}
        <Button type="submit" loading={createUser.isPending}>Нэмэх</Button>
      </form>
    </div>
  )
}

export default UserCreateForm
