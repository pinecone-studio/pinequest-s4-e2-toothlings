'use client'

import { useMemo, useState } from 'react'
import { DentalClinicsMap } from '@/components/consumer/DentalClinicsMap'
import { ClinicListCard } from '@/components/consumer/MobilePatterns'
import { FilterPill } from '@/components/consumer/warm/WarmUI'
import {
  clinicDistanceKm,
  DENTAL_CLINICS_UB,
  directionsUrl,
  type DentalClinic,
} from '@/lib/dentalClinics'
import { ROUTES } from '@/lib/routes'
import Link from 'next/link'

type SortMode = 'near' | 'rating'

const DoctorMapPage = () => {
  const [selected, setSelected] = useState<DentalClinic | null>(DENTAL_CLINICS_UB[0] ?? null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('near')

  const clinics = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = DENTAL_CLINICS_UB.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.addr.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q),
    )

    list = [...list].sort((a, b) => {
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
      return clinicDistanceKm(a) - clinicDistanceKm(b)
    })

    return list
  }, [query, sort])

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 lg:max-w-4xl">
      <div className="flex items-center gap-3">
        <Link
          href={ROUTES.doctor.root}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-[#E8E4DA] transition hover:bg-[#FAF8F5]"
          aria-label="Буцах"
        >
          ←
        </Link>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Ойр байрлах эмнэлэг</h1>
          <p className="text-[13px] text-slate-500">OpenStreetMap · Улаанбаатар</p>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Эмнэлэг хайх…"
        className="consumer-input w-full rounded-2xl"
      />

      <div className="flex flex-wrap gap-2">
        <FilterPill label="Ойрхон" active={sort === 'near'} onClick={() => setSort('near')} />
        <FilterPill label="Үнэлгээ" active={sort === 'rating'} onClick={() => setSort('rating')} />
      </div>

      <DentalClinicsMap selectedId={selected?.id ?? null} onSelect={setSelected} />

      <div className="space-y-3 pb-4">
        <p className="px-1 text-[12px] font-medium text-slate-500">{clinics.length} эмнэлэг</p>
        {clinics.map((c) => (
          <ClinicListCard
            key={c.id}
            name={c.name}
            rating={c.rating ?? 4.5}
            distanceKm={clinicDistanceKm(c)}
            addr={c.addr}
            hours={c.hours}
            phone={c.phone}
            active={selected?.id === c.id}
            onSelect={() => setSelected(c)}
            onNavigate={() => window.open(directionsUrl(c), '_blank', 'noopener,noreferrer')}
          />
        ))}
      </div>
    </div>
  )
}

export default DoctorMapPage
