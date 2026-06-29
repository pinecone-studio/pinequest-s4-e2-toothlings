'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { useUpsertVolunteer, type VolunteerDentist } from '@/hooks/useHelp'

type Props = { profile: VolunteerDentist; onClose: () => void }

const inp = 'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

// Edit the dentist's own volunteer profile (name / specialty / org / area / photo).
const DentistProfileEditModal = ({ profile, onClose }: Props) => {
  const upsert = useUpsertVolunteer()
  const [name, setName] = useState(profile.displayName)
  const [specialty, setSpecialty] = useState(profile.specialty ?? '')
  const [org, setOrg] = useState(profile.org ?? '')
  const [area, setArea] = useState(profile.area ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '')

  const save = () => {
    if (!name.trim()) return
    upsert.mutate(
      { displayName: name.trim(), specialty: specialty || undefined, org: org || undefined, area: area || undefined, avatarUrl: avatarUrl || undefined, isAvailable: profile.isAvailable },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal open onClose={onClose} title="Профайл засах" size="md"
      footer={
        <>
          <button onClick={onClose} className="btn rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-text-muted">Болих</button>
          <button onClick={save} disabled={upsert.isPending} className="btn rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
            {upsert.isPending ? 'Хадгалж байна…' : 'Хадгалах'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр *" className={inp} />
        <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Мэргэжил" className={inp} />
        <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Эмнэлэг" className={inp} />
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Бүс / сум" className={inp} />
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Зургийн URL" className={inp} />
      </div>
    </Modal>
  )
}

export default DentistProfileEditModal
