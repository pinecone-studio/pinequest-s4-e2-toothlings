'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/consumer/AppShell'
import { DoctorMapPanel } from '@/components/consumer/DoctorMapPanel'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import { SPECIALISTS } from '@/lib/doctors'
import { ROUTES } from '@/lib/routes'

type DoctorView = 'list' | 'map'

const TABS: { id: DoctorView; label: string }[] = [
  { id: 'list', label: 'Эмч' },
  { id: 'map', label: 'Газрын зураг' },
]

const DoctorListPanel = () => {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <p className="warm-section-label px-1">Мэргэжилтэн эмч</p>
      {SPECIALISTS.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => router.push(ROUTES.doctor.chatWith(d.id))}
          className="warm-card group flex w-full flex-wrap items-center gap-4 p-6 text-left transition-all hover:ring-2 hover:ring-[#F3B900]/35"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-subtle text-xl font-bold text-primary">
            {d.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-bold text-text-base">{d.name}</p>
            <p className="text-[13px] text-text-muted">{d.clinic} · {d.district}</p>
            <p className="mt-1 text-[12px] text-text-muted">Туршлага: {d.exp} · ★ {d.rating}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3B900]/15 px-3 py-1.5 text-[12px] font-semibold text-[#B8860B] transition group-hover:bg-[#F3B900] group-hover:text-slate-900">
            💬 Чатлах
          </span>
        </button>
      ))}
    </div>
  )
}

const DoctorHubContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view')
  const view: DoctorView = viewParam === 'map' ? 'map' : 'list'

  const setView = (next: DoctorView) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'list') {
      params.delete('view')
      params.delete('q')
      params.delete('clinic')
    } else {
      params.set('view', 'map')
    }
    const qs = params.toString()
    router.replace(qs ? `${ROUTES.doctor.root}?${qs}` : ROUTES.doctor.root, { scroll: false })
  }

  const subtitle =
    view === 'map' ? 'Ойрын эмнэлэг · маршрут · хайлт' : 'Эмч сонгоод шууд чатлах'

  return (
    <AppShell title="Тусламж" subtitle={subtitle}>
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <FilterPill key={id} label={label} active={view === id} onClick={() => setView(id)} />
        ))}
      </div>

      {view === 'list' ? (
        <DoctorListPanel />
      ) : (
        <DoctorMapPanel
          initialQuery={searchParams.get('q') ?? ''}
          initialClinicId={searchParams.get('clinic')}
        />
      )}
    </AppShell>
  )
}

const HelpHubPage = () => (
  <Suspense fallback={<div className="py-12 text-center text-text-muted">Ачааллаж байна…</div>}>
    <DoctorHubContent />
  </Suspense>
)

export default HelpHubPage
