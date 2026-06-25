'use client'

import { AppShell } from '@/components/consumer/AppShell'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/lib/routes'

const CLINICS = [
  { name: 'Smile Dental', area: 'БЗД', dist: '1.2 km', hours: '09:00–18:00', addr: '15-р хороо' },
  { name: 'Kids Teeth UB', area: 'СБД', dist: '2.8 km', hours: '10:00–19:00', addr: '1-р хороолол' },
  { name: 'Family Dental', area: 'ХУД', dist: '4.1 km', hours: '08:30–17:30', addr: '3-р хороо' },
]

const DoctorMapPage = () => (
  <AppShell title="Map" subtitle="Google Maps · хаяг · ажиллах цаг · маршрут" backHref={ROUTES.doctor.root}>
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="warm-inset flex min-h-[480px] flex-col items-center justify-center p-8 text-center">
        <p className="text-5xl">🗺️</p>
        <p className="mt-4 text-[16px] font-semibold">Google Maps (demo)</p>
        <p className="mt-2 max-w-sm text-[13px] text-text-muted">
          Production-д Mapbox / Google Maps API холбогдож клиник, маршрут харагдана.
        </p>
        <Button className="mt-6" onClick={() => alert('Маршрут төлөвлөгч нээгдэнэ (demo)')}>
          Маршрут төлөвлөх
        </Button>
      </div>

      <ul className="space-y-3">
        {CLINICS.map((c) => (
          <li key={c.name} className="warm-card p-5">
            <p className="font-semibold">{c.name}</p>
            <p className="mt-1 text-[13px] text-text-muted">{c.addr}, {c.area}</p>
            <p className="mt-2 text-[12px]">🕐 {c.hours}</p>
            <p className="text-[12px] text-primary">{c.dist}</p>
          </li>
        ))}
      </ul>
    </div>
  </AppShell>
)

export default DoctorMapPage
