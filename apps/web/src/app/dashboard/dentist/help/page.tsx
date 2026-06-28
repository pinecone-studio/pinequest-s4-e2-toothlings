'use client'

import { useState } from 'react'
import { HandRaisedIcon, PhoneIcon, CheckCircleIcon, MapPinIcon } from '@heroicons/react/24/outline'
import Card from '@/components/ui/Card'
import StatusPill, { type Tone } from '@/components/ui/StatusPill'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { PageSpinner } from '@/components/ui/Spinner'
import { SPECIALTY_LABEL } from '@/components/admin/help/DentistProfileCard'
import { useHelpRequests, useVolunteerProfile, useUpsertVolunteer, useConnectRequest, type HelpRequestRow } from '@/hooks/useHelp'

const TONE: Record<string, { card: string; ink: string; tone: Tone; label: string }> = {
  red: { card: 'bg-triage-red-bg border-triage-red/25', ink: 'text-triage-red', tone: 'danger', label: 'Улаан' },
  yellow: { card: 'bg-triage-yellow-bg border-triage-yellow/25', ink: 'text-triage-yellow', tone: 'check', label: 'Шар' },
}

const RequestCard = ({ r, action }: { r: HelpRequestRow; action?: React.ReactNode }) => {
  const t = TONE[r.level] ?? TONE.yellow
  const name = r.child ? `${r.child.lastName} ${r.child.firstName}` : r.childKey.slice(0, 8)
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-(--shadow-card) ${t.card}`}>
      <div className="flex items-start gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-[15px] font-bold ${t.ink}`}>{name.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-text-base">{name}</p>
          <StatusPill tone={t.tone} variant="soft" className="mt-0.5">{t.label}</StatusPill>
        </div>
      </div>
      {r.note && <p className="rounded-lg bg-surface/70 px-3 py-2 text-[12px] text-text-secondary">"{r.note}"</p>}
      {r.child?.guardianPhone && (
        <a href={`tel:${r.child.guardianPhone}`} className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline">
          <PhoneIcon className="size-3.5" /> {r.child.guardianPhone}
        </a>
      )}
      {r.dentist && (
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-triage-green">
          <CheckCircleIcon className="size-3.5" /> {r.dentist.displayName}{r.dentist.org ? ` · ${r.dentist.org}` : ''}
        </p>
      )}
      {action}
    </div>
  )
}

const SPECIALTIES = Object.entries(SPECIALTY_LABEL)

const DentistHelpPage = () => {
  const { data: profile } = useVolunteerProfile()
  const { data: requests, isLoading } = useHelpRequests()
  const upsert = useUpsertVolunteer()
  const connect = useConnectRequest()
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [area, setArea] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const inp = 'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-base placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'
  const open = (requests ?? []).filter((r) => r.status === 'open')
  const connected = (requests ?? []).filter((r) => r.status === 'connected')

  const getLocation = () => {
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setGeoLoading(false) },
      () => setGeoLoading(false)
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    upsert.mutate({ displayName: name, org: org || undefined, area: area || undefined, specialty: specialty || undefined, avatarUrl: avatarUrl || undefined, lat: lat ?? undefined, lng: lng ?? undefined })
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text-base">Тусламж</h1>
        <p className="text-sm text-text-muted">Сайн дурын шүдний эмчийн холболт — улаан/шар сурагчдын хүсэлт.</p>
      </header>

      <Card>
        {profile ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-text-base">
              <HandRaisedIcon className="size-5 text-primary" />
              <span>Бүртгэлтэй: <b>{profile.displayName}</b>
                {profile.specialty ? ` · ${SPECIALTY_LABEL[profile.specialty] ?? profile.specialty}` : ''}
                {profile.org ? ` · ${profile.org}` : ''}
                {profile.lat != null ? <MapPinIcon className="ml-1 inline size-3.5 text-text-muted" /> : null}
              </span>
            </div>
            <button
              onClick={() => upsert.mutate({ displayName: profile.displayName, org: profile.org ?? undefined, area: profile.area ?? undefined, isAvailable: !profile.isAvailable })}
              className={`btn rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${profile.isAvailable ? 'bg-triage-green-bg text-triage-green' : 'bg-surface-raised text-text-muted'}`}
            >
              {profile.isAvailable ? 'Боломжтой' : 'Завгүй'}
            </button>
          </div>
        ) : (
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
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:bg-surface-raised disabled:opacity-50">
                <MapPinIcon className="size-4" />
                {lat != null ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : geoLoading ? 'Тодорхойлж байна…' : 'Байршил авах'}
              </button>
            </div>
            <button type="submit" disabled={upsert.isPending}
              className="btn self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
              Бүртгүүлэх
            </button>
          </form>
        )}
      </Card>

      {isLoading ? <PageSpinner /> : (
        <>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-text-muted">Шинэ хүсэлт ({open.length})</h2>
            {open.length === 0 ? (
              <EmptyState Icon={HandRaisedIcon} title="Шинэ хүсэлт алга" hint="Гэр бүлийн хүсэлт ирэхэд энд харагдана." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {open.map((r) => (
                  <RequestCard key={r.id} r={r} action={
                    <button onClick={() => setConfirmId(r.id)} disabled={connect.isPending}
                      className="btn mt-1 rounded-lg bg-primary px-3 py-2 text-[13px] font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
                      Холбогдох
                    </button>
                  } />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-text-muted">Холбогдсон ({connected.length})</h2>
            {connected.length === 0 ? <EmptyState Icon={CheckCircleIcon} title="Холбогдсон хүсэлт алга" /> : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {connected.map((r) => <RequestCard key={r.id} r={r} />)}
              </div>
            )}
          </div>
        </>
      )}
      <ConfirmModal
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { if (confirmId) connect.mutate(confirmId, { onSettled: () => setConfirmId(null) }) }}
        isPending={connect.isPending}
        title="Хүсэлтэд холбогдох"
        message="Энэ сурагчийн гэр бүлтэй холбогдохыг зөвшөөрч байна уу? Хүсэлтийн төлөв 'Холбогдсон' болно."
        confirmLabel="Холбогдох"
        variant="primary"
      />
    </section>
  )
}

export default DentistHelpPage
