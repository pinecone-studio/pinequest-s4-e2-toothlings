'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState, useCallback } from 'react'
import type { VolunteerDentist } from '@/hooks/useHelp'
import { SPECIALTY_LABEL } from './DentistProfileCard'

const MONGOLIA_CENTER = { lat: 46.8625, lng: 103.8467 }
const MONGOLIA_ZOOM = 5

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type Props = {
  dentists: VolunteerDentist[]
  selectedId?: string | null
  onSelect?: (dentist: VolunteerDentist) => void
  onDistancesReady?: (distances: Record<string, number>) => void
  className?: string
}

export const VolunteerDentistsMap = ({ dentists, selectedId, onSelect, onDistancesReady, className }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Map<string, import('leaflet').Marker>>(new Map())
  const userMarkerRef = useRef<import('leaflet').CircleMarker | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const [locating, setLocating] = useState(false)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  const pinHtml = (d: VolunteerDentist, active: boolean) => {
    const size = active ? 42 : 34
    const border = active ? '3px solid #A05A5A' : '2.5px solid #fff'
    const shadow = 'box-shadow:0 2px 8px rgba(0,0,0,0.35)'
    const base = `width:${size}px;height:${size}px;border-radius:50%;border:${border};${shadow};overflow:hidden;display:flex;align-items:center;justify-content:center;`
    if (d.avatarUrl) {
      return `<div style="${base}"><img src="${d.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" /></div>`
    }
    const initials = d.displayName.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2)
    const bg = active ? '#A05A5A' : '#6b7280'
    return `<div style="${base}background:${bg};color:#fff;font-size:${active ? 14 : 11}px;font-weight:700;">${initials}</div>`
  }

  const popupHtml = (d: VolunteerDentist, distKm?: number) =>
    `<b>${d.displayName}</b>` +
    (d.specialty ? `<br/><span style="font-size:11px">${SPECIALTY_LABEL[d.specialty] ?? d.specialty}</span>` : '') +
    (d.area ? `<br/><span style="font-size:11px;color:#6b7280">${d.area}</span>` : '') +
    (distKm != null ? `<br/><span style="font-size:11px;color:#2563eb;font-weight:600">${distKm.toFixed(0)} км</span>` : '')

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    let cancelled = false
    void import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstance.current) return
      leafletRef.current = L
      const map = L.map(mapRef.current, { center: [MONGOLIA_CENTER.lat, MONGOLIA_CENTER.lng], zoom: MONGOLIA_ZOOM, scrollWheelZoom: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 18 }).addTo(map)
      mapInstance.current = map
    }).catch(() => {})
    return () => {
      cancelled = true
      mapInstance.current?.remove()
      mapInstance.current = null
      markersRef.current.clear()
    }
  }, [])

  // Sync markers
  useEffect(() => {
    const map = mapInstance.current
    const L = leafletRef.current
    if (!map || !L) return
    const pinned = new Set<string>()
    for (const d of dentists) {
      if (d.lat == null || d.lng == null) continue
      const active = d.id === selectedId
      const distKm = userPos ? haversineKm(userPos.lat, userPos.lng, d.lat, d.lng) : undefined
      const size = active ? 42 : 34
      const icon = L.divIcon({ className: '', html: pinHtml(d, active), iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
      const popup = popupHtml(d, distKm)
      const existing = markersRef.current.get(d.id)
      if (existing) {
        existing.setIcon(icon)
        existing.bindPopup(popup)
      } else {
        const m = L.marker([d.lat, d.lng], { icon }).addTo(map).bindPopup(popup)
        if (onSelect) m.on('click', () => onSelect(d))
        markersRef.current.set(d.id, m)
      }
      pinned.add(d.id)
    }
    for (const [id, marker] of markersRef.current) {
      if (!pinned.has(id)) { marker.remove(); markersRef.current.delete(id) }
    }
    if (selectedId) {
      const sel = dentists.find((d) => d.id === selectedId)
      if (sel?.lat != null && sel.lng != null) {
        map.setView([sel.lat, sel.lng], Math.max(map.getZoom(), 9), { animate: true })
      }
    }
  }, [dentists, selectedId, onSelect, userPos])

  // User location marker + notify distances
  useEffect(() => {
    const map = mapInstance.current
    const L = leafletRef.current
    if (!map || !L || !userPos) return
    userMarkerRef.current?.remove()
    userMarkerRef.current = L.circleMarker([userPos.lat, userPos.lng], { radius: 7, fillColor: '#2563eb', fillOpacity: 1, color: '#fff', weight: 2 }).addTo(map)

    const distances: Record<string, number> = {}
    for (const d of dentists) {
      if (d.lat != null && d.lng != null) distances[d.id] = haversineKm(userPos.lat, userPos.lng, d.lat, d.lng)
    }
    onDistancesReady?.(distances)
  }, [userPos, dentists, onDistancesReady])

  const locate = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocating(false); setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }) },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }, [])

  const hasPins = dentists.some((d) => d.lat != null)

  return (
    <div className={`relative ${className ?? ''}`}>
      {!hasPins && (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-text-muted z-10">
          Байршлын мэдээлэл байхгүй
        </div>
      )}
      <div ref={mapRef} className="h-full w-full rounded-2xl" />
      <button
        onClick={locate}
        disabled={locating}
        className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-primary shadow-md hover:bg-surface-raised disabled:opacity-60"
      >
        {locating ? '…' : '📍'} {userPos ? 'Байршил тодорхойлогдсон' : 'Байршил тодорхойлох'}
      </button>
    </div>
  )
}
