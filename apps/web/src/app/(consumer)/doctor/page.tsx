'use client'

import { AppShell, FlowCard } from '@/components/consumer/AppShell'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/lib/routes'

const DOCTORS = [
  { id: '1', name: 'Dr. Batbold', clinic: 'Smile Dental', district: 'БЗД', exp: '12 жил', rating: 4.9, price: '35,000₮' },
  { id: '2', name: 'Dr. Oyunaa', clinic: 'Kids Teeth UB', district: 'СБД', exp: '8 жил', rating: 4.8, price: '40,000₮' },
  { id: '3', name: 'Dr. Tseren', clinic: 'Family Dental', district: 'ХУД', exp: '15 жил', rating: 4.7, price: '32,000₮' },
]

const DoctorListPage = () => (
  <AppShell title="Эмч нар" subtitle="Туршлага · захиалга · үнэлгээ · салбар">
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        {DOCTORS.map((d) => (
          <div key={d.id} className="warm-card flex flex-wrap items-center gap-4 p-6">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-subtle text-xl font-bold text-primary">
              {d.name.charAt(4)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold">{d.name}</p>
              <p className="text-[13px] text-text-muted">{d.clinic} · {d.district}</p>
              <p className="mt-1 text-[12px] text-text-muted">Туршлага: {d.exp} · ★ {d.rating}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-semibold">{d.price}</p>
              <Button size="sm" className="mt-2" onClick={() => alert(`Захиалга: ${d.name} (demo)`)}>
                Тасалбар захиалах
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <FlowCard href={ROUTES.doctor.map} emoji="🗺️" title="Map / Байршил" desc="OpenStreetMap, маршрут" accent="gold" />
        <FlowCard href={ROUTES.doctor.chat} emoji="💬" title="Эмчийн чат" desc="Scan үр дүн илгээх" accent="dark" />
      </div>
    </div>
  </AppShell>
)

export default DoctorListPage
