import { useCallback, useEffect, useState } from 'react'
import { getUser, saveUser } from '@/lib/auth'
import { getMe, type MeResult } from '@/lib/api'
import ProfileModal from './ProfileModal'
import EditProfileSheet from './EditProfileSheet'

type Props = { visible: boolean; onClose: () => void }

// Owns the profile read-modal + edit-sheet pair and the `me` fetch, so any
// screen (home header avatar, settings header) can pop the profile card by
// toggling `visible` — no duplicated fetch/save wiring.
const ProfileModalHost = ({ visible, onClose }: Props) => {
  const [me, setMe] = useState<MeResult | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const loadMe = useCallback(() => {
    getMe()
      .then(setMe)
      .catch(async () => {
        const u = await getUser()
        if (u) setMe({ id: u.id, name: u.name, role: u.role, email: '', phone: null, schoolId: u.schoolId ?? null, avatarUrl: null, isActive: true })
      })
  }, [])

  useEffect(() => { loadMe() }, [loadMe])

  const onSaved = async (updated: { name: string; email: string; phone: string | null }) => {
    setMe((prev) => (prev ? { ...prev, name: updated.name, email: updated.email, phone: updated.phone } : prev))
    const u = await getUser()
    if (u) await saveUser({ ...u, name: updated.name })
  }

  if (!me) return null

  return (
    <>
      <ProfileModal
        visible={visible}
        me={me}
        onClose={onClose}
        onEdit={() => { onClose(); setEditOpen(true) }}
      />
      <EditProfileSheet
        visible={editOpen}
        initial={{ name: me.name, phone: me.phone, email: me.email }}
        onClose={() => setEditOpen(false)}
        onSaved={onSaved}
      />
    </>
  )
}

export default ProfileModalHost
