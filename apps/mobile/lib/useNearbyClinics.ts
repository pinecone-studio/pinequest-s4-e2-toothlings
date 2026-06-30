import { useEffect, useState } from 'react'
import { CLINICS, distanceKm, type Clinic } from './clinics'

// Real dental clinics near the user, from OpenStreetMap via the Overpass API
// (free, no API key). Offline-first: if the network fails or OSM has no
// coverage nearby (common rurally), we fall back to the curated CLINICS list.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const RADIUS_M = 25_000 // 25 km search radius around the user
const REQUEST_TIMEOUT_MS = 20_000

type OverpassElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

const buildQuery = (lat: number, lng: number) => `[out:json][timeout:25];
(
  node["amenity"="dentist"](around:${RADIUS_M},${lat},${lng});
  way["amenity"="dentist"](around:${RADIUS_M},${lat},${lng});
  node["healthcare"="dentist"](around:${RADIUS_M},${lat},${lng});
  way["healthcare"="dentist"](around:${RADIUS_M},${lat},${lng});
);
out center tags;`

const buildAddress = (t: Record<string, string>): string => {
  if (t['addr:full']) return t['addr:full']
  const parts = [
    t['addr:street'],
    t['addr:housenumber'],
    t['addr:district'] || t['addr:suburb'],
    t['addr:city'],
  ].filter(Boolean)
  return parts.join(', ')
}

const toClinic = (el: OverpassElement): Clinic | null => {
  const lat = el.lat ?? el.center?.lat
  const lng = el.lon ?? el.center?.lon
  if (lat == null || lng == null) return null
  const t = el.tags ?? {}
  return {
    id: `osm-${el.type}-${el.id}`,
    name: t.name || t['name:mn'] || t['name:en'] || 'Шүдний эмнэлэг',
    area: t['addr:district'] || t['addr:suburb'] || t['addr:city'] || '',
    lat,
    lng,
    hours: t.opening_hours || '',
    addr: buildAddress(t),
    phone: t.phone || t['contact:phone'] || t['phone:mobile'] || undefined,
  }
}

const fetchOverpass = async (lat: number, lng: number, signal: AbortSignal): Promise<Clinic[]> => {
  const body = 'data=' + encodeURIComponent(buildQuery(lat, lng))
  let lastErr: unknown
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        // RN supports AbortSignal at runtime even though its fetch types omit it.
        signal,
      } as RequestInit)
      if (!res.ok) throw new Error(`overpass ${res.status}`)
      const json = (await res.json()) as { elements?: OverpassElement[] }
      return (json.elements ?? []).map(toClinic).filter((c): c is Clinic => c != null)
    } catch (err) {
      if (signal.aborted) throw err
      lastErr = err // try the next mirror
    }
  }
  throw lastErr ?? new Error('overpass unavailable')
}

type State = { clinics: Clinic[]; loading: boolean; live: boolean }

export const useNearbyClinics = (userLat: number, userLng: number): State => {
  // Start from the curated list so the map/list always have something to show.
  const [state, setState] = useState<State>({ clinics: CLINICS, loading: true, live: false })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    fetchOverpass(userLat, userLng, controller.signal)
      .then((osmClinics) => {
        if (cancelled) return
        if (osmClinics.length === 0) {
          // No OSM coverage nearby → curated list only.
          setState({ clinics: CLINICS, loading: false, live: false })
          return
        }
        // Merge curated + live: keep all curated (they carry ratings/hours), then
        // add OSM results that aren't the same physical clinic (< ~150 m away).
        const fresh = osmClinics.filter(
          (o) => !CLINICS.some((c) => distanceKm(c, o.lat, o.lng) < 0.15),
        )
        setState({ clinics: [...CLINICS, ...fresh], loading: false, live: true })
      })
      .catch(() => {
        if (!cancelled) setState({ clinics: CLINICS, loading: false, live: false })
      })
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [userLat, userLng])

  return state
}
