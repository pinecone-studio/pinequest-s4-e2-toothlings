'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import {
  DENTAL_CLINICS_UB,
  ULAANBAATAR_CENTER,
  type DentalClinic,
} from '@/lib/dentalClinics'
import { cn } from '@/lib/utils'

const markerIcon = (L: typeof import('leaflet'), active: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="width:${active ? 22 : 18}px;height:${active ? 22 : 18}px;background:#F3B900;border:2px solid #1e293b;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,
    iconSize: active ? [22, 22] : [18, 18],
    iconAnchor: active ? [11, 11] : [9, 9],
  })

export const DentalClinicsMap = ({
  selectedId,
  onSelect,
  className,
}: {
  selectedId: string | null
  onSelect: (clinic: DentalClinic) => void
  className?: string
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    let cancelled = false

    void import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return

      leafletRef.current = L

      const map = L.map(mapRef.current, {
        center: [ULAANBAATAR_CENTER.lat, ULAANBAATAR_CENTER.lng],
        zoom: 12,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const bounds = L.latLngBounds([])
      const markerMap = new Map<string, import('leaflet').Marker>()

      DENTAL_CLINICS_UB.forEach((clinic) => {
        const marker = L.marker([clinic.lat, clinic.lng], {
          icon: markerIcon(L, false),
        }).addTo(map)

        marker.bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:180px">
            <strong style="font-size:14px">${clinic.name}</strong>
            <p style="margin:6px 0 0;font-size:12px;color:#64748b">${clinic.addr}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b">🕐 ${clinic.hours}</p>
          </div>`,
        )

        marker.on('click', () => onSelect(clinic))
        bounds.extend([clinic.lat, clinic.lng])
        markerMap.set(clinic.id, marker)
      })

      map.fitBounds(bounds, { padding: [48, 48] })
      mapInstance.current = map
      markersRef.current = markerMap
      setReady(true)
    }).catch(() => setLoadError('Газрын зураг ачааллахад алдаа гарлаа'))

    return () => {
      cancelled = true
      mapInstance.current?.remove()
      mapInstance.current = null
      markersRef.current.clear()
    }
  }, [onSelect])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapInstance.current
    if (!ready || !L || !map || !selectedId) return

    const clinic = DENTAL_CLINICS_UB.find((c) => c.id === selectedId)
    if (!clinic) return

    markersRef.current.forEach((marker, id) => {
      marker.setIcon(markerIcon(L, id === selectedId))
    })

    map.setView([clinic.lat, clinic.lng], 14, { animate: true })
    markersRef.current.get(selectedId)?.openPopup()
  }, [selectedId, ready])

  return (
    <div className={cn('warm-card relative min-h-[480px] overflow-hidden p-0', className)}>
      <div ref={mapRef} className="z-0 size-full min-h-[480px]" aria-label="Улаанбаатар шүдний эмнэлгийн газрын зураг" />
      {!ready && !loadError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAF8F5]/90 text-[14px] text-slate-500">
          Газрын зураг ачааллаж байна…
        </div>
      ) : null}
      {loadError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAF8F5] p-6 text-center text-[14px] text-red-600">
          {loadError}
        </div>
      ) : null}
      {ready ? (
        <p className="pointer-events-none absolute bottom-2 right-2 z-[400] rounded bg-white/90 px-2 py-0.5 text-[10px] text-slate-500">
          © OpenStreetMap
        </p>
      ) : null}
    </div>
  )
}
