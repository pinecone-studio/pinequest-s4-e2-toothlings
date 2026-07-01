'use client'

import { useEffect, useRef, useState } from 'react'
import { CameraIcon, PencilIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid'
import Modal from '@/components/ui/Modal'
import { useMe, useUpdateMe, useSwitchRole } from '@/hooks/useMe'
import { useBoardStudents } from '@/hooks/useBoard'
import { useSession } from '@/components/providers'
import ProfileEditForm from './ProfileEditForm'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Админ', school_doctor: 'Сургуулийн эмч', teacher: 'Багш',
  parent: 'Эцэг эх', dentist: 'Шүдний эмч', follow_up: 'Хяналтын ажилтан', screener: 'Скринер',
}

const initials = (name?: string) =>
  (name ?? '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="rounded-2xl border border-border bg-surface-raised px-4 py-3">
    <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
    <p className="mt-0.5 truncate text-[14px] text-text-base">{value || '—'}</p>
  </div>
)

type Props = { open: boolean; onClose: () => void }

const ProfileModal = ({ open, onClose }: Props) => {
  const { role } = useSession()
  const { data: me } = useMe()
  const { data: students } = useBoardStudents()
  const update = useUpdateMe()
  const switchRole = useSwitchRole()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => { setAvatarUrl(localStorage.getItem('toothlings.avatar')) }, [])
  useEffect(() => { if (open) setEditing(false) }, [open])

  const child = role === 'parent' ? students?.[0] : null

  const openEdit = () => {
    setName(me?.name ?? ''); setPhone(me?.phone ?? ''); setEmail(me?.email ?? '')
    setEditing(true)
  }

  const save = async () => {
    await update.mutateAsync({ name: name.trim() || undefined, phone: phone.trim() || undefined, email: email.trim() || undefined })
    setEditing(false)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setAvatarUrl(url)
      localStorage.setItem('toothlings.avatar', url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Modal open={open} onClose={onClose} title="Тохиргоо">
      <div className="flex flex-col items-center gap-5 pb-2 pt-1">
        <div className="relative">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[22px] font-bold text-text-on-primary">
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(me?.name)}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-surface-raised shadow-(--shadow-card) transition-colors hover:bg-border"
            aria-label="Зураг солих"
          >
            <CameraIcon className="size-3.5 text-text-muted" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>

        {!editing ? (
          <div className="w-full space-y-2.5">
            <Field label="Нэр" value={me?.name} />
            <Field label="И-мэйл" value={me?.email} />
            {me?.phone && <Field label="Утас" value={me.phone} />}
            <div className="rounded-2xl border border-border bg-surface-raised px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">Эрх</p>
              <div className="mt-0.5 flex items-center justify-between">
                <p className="text-[14px] text-text-base">{role ? ROLE_LABEL[role] : '—'}</p>
                {(role === 'parent' || role === 'teacher') && (
                  <button
                    onClick={() => switchRole.mutate(role === 'parent' ? 'teacher' : 'parent')}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-[12px] text-text-muted transition-colors hover:bg-border hover:text-text-base"
                    title={role === 'parent' ? 'Багш болгох' : 'Эцэг эх болгох'}
                  >
                    <ArrowsRightLeftIcon className="size-3.5" />
                    {role === 'parent' ? 'Багш' : 'Эцэг эх'}
                  </button>
                )}
              </div>
            </div>
            {child && (
              <div className="rounded-2xl border border-primary/30 bg-primary-subtle px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Хүүхэд</p>
                <p className="mt-0.5 text-[14px] font-semibold text-text-base">
                  {child.lastName} {child.firstName}
                  <span className="ml-1.5 text-[12px] font-normal text-text-muted">· {child.className}</span>
                </p>
              </div>
            )}
            <button
              onClick={openEdit}
              className="btn mt-1 flex w-full items-center justify-center gap-1.5 rounded-full bg-btn-fill px-4 py-2.5 text-[13px] font-semibold text-text-base hover:bg-btn-fill-hover"
            >
              <PencilIcon className="size-4" /> Засах
            </button>
          </div>
        ) : (
          <ProfileEditForm
            name={name} email={email} phone={phone}
            onName={setName} onEmail={setEmail} onPhone={setPhone}
            onSave={save} onCancel={() => setEditing(false)}
            isPending={update.isPending}
          />
        )}
      </div>
    </Modal>
  )
}

export default ProfileModal
