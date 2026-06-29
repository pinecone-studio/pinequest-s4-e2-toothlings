'use client'

import { useState } from 'react'
import { HandRaisedIcon, PhoneIcon } from '@heroicons/react/24/solid'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmModal from '@/components/ui/ConfirmModal'
import BrandLoader from '@/components/ui/BrandLoader'
import StatusPill, { type Tone } from '@/components/ui/StatusPill'
import { useHelpRequests, useVolunteerProfile, useUpsertVolunteer, useConnectRequest, type HelpRequestRow } from '@/hooks/useHelp'
import { useMyAppointments } from '@/hooks/useAppointments'
import DentistHelpHero from '@/components/dentist/DentistHelpHero'
import DentistRegisterForm from '@/components/dentist/DentistRegisterForm'
import DentistAppointmentsSection from '@/components/dentist/DentistAppointmentsSection'
import DentistConnectedPanel from '@/components/dentist/DentistConnectedPanel'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'

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
      {r.note && <p className="rounded-2xl bg-surface/70 px-3 py-2 text-[12px] text-text-secondary">&quot;{r.note}&quot;</p>}
      {r.child?.guardianPhone && (
        <a href={`tel:${r.child.guardianPhone}`} className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline">
          <PhoneIcon className="size-3.5" /> {r.child.guardianPhone}
        </a>
      )}
      {action}
    </div>
  )
}

const DentistHelpPage = () => {
  const { data: profile, isLoading: profileLoading } = useVolunteerProfile()
  const { data: requests, isLoading } = useHelpRequests()
  const { data: appts = [] } = useMyAppointments()
  const upsert = useUpsertVolunteer()
  const connect = useConnectRequest()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useSetPageHeader({ title: 'Шүдний эмчтэй дуудлага хийх', subtitle: 'Зөвхөн яаралтай эмчилгээ шаардлагатай хүүхдүүдтэй цаг товлон видео дуудлага хйигдэнэ.' })

  const open = (requests ?? []).filter((r) => r.status === 'open')
  const connected = (requests ?? []).filter((r) => r.status === 'connected')

  return (
    <section className="flex flex-col gap-5">
      {profileLoading || isLoading ? (
        <BrandLoader className="py-20" />
      ) : (
        <>
          {profile ? (
            <DentistHelpHero
              profile={profile}
              appts={appts}
              onToggle={() => upsert.mutate({ displayName: profile.displayName, org: profile.org ?? undefined, area: profile.area ?? undefined, isAvailable: !profile.isAvailable })}
            />
          ) : (
            <DentistRegisterForm />
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0">
              <DentistAppointmentsSection />
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-(--shadow-card)">
                <h2 className="mb-3 text-[15px] font-semibold text-text-base">Шинэ хүсэлт ({open.length})</h2>
                {open.length === 0 ? (
                  <EmptyState Icon={HandRaisedIcon} title="Шинэ хүсэлт алга" hint="Гэр бүлийн хүсэлт ирэхэд энд харагдана." compact />
                ) : (
                  <div className="flex flex-col gap-3">
                    {open.map((r) => (
                      <RequestCard key={r.id} r={r} action={
                        <button onClick={() => setConfirmId(r.id)} disabled={connect.isPending}
                          className="btn mt-1 rounded-full bg-primary px-3 py-2 text-[13px] font-semibold text-text-on-primary hover:bg-primary-hover disabled:opacity-60">
                          Холбогдох
                        </button>
                      } />
                    ))}
                  </div>
                )}
              </div>

              <DentistConnectedPanel connected={connected} />
            </div>
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
