'use client'

import { useState } from 'react'
import { MapPinIcon } from '@heroicons/react/24/solid'
import Card from '@/components/ui/Card'
import { SPECIALTY_LABEL } from '@/components/admin/help/DentistProfileCard'
import { useUpsertVolunteer } from '@/hooks/useHelp'

const SPECIALTIES = Object.entries(SPECIALTY_LABEL)
const inp = 'rounded-full border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

// Volunteer registration form, shown until the dentist has a profile.
const DentistRegisterForm = () => {
  const upsert = useUpsertVolunteer()
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [area, setArea] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  const getLocation = () => {
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setGeoLoading(false) },
      () => setGeoLoading(false),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    upsert.mutate({ displayName: name, org: org || undefined, area: area || undefined, specialty: specialty || undefined, avatarUrl: avatarUrl || undefined, lat: lat ?? undefined, lng: lng ?? undefined })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-text-base">Сайн дураар бүртгүүлэх</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Нэр *" className={inp} required />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={inp}>
            <option value="">Мэргэжил (заавал биш)</option>
            {SPECIALTIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Эмнэлэг (заавал биш)" className={inp} />
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Бүс/сум (заавал биш)" className={inp} />
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Зургийн URL (заавал биш)" className={inp} />
          <button type="button" onClick={getLocation} disabled={geoLoading}
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-surface-raised disabled:opacity-50">
            <MapPinIcon className="size-4" />
            {lat != null ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : geoLoading ? 'Тодорхойлж байна…' : 'Байршил авах'}
          </button>
        </div>
        <button type="submit" disabled={upsert.isPending}
          className="btn self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
          Бүртгүүлэх
        </button>
      </form>
    </Card>
  )
}

export default DentistRegisterForm
