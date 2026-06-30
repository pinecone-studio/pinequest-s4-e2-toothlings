export type Clinic = {
  id: string
  name: string
  area: string
  lat: number
  lng: number
  hours: string
  addr: string
  phone?: string
  rating?: number
}

// Default map center (Ulaanbaatar) used only to frame the map view.
export const UB_CENTER = { lat: 47.9184, lng: 106.9177 }

export const distanceKm = (clinic: Clinic, userLat: number, userLng: number): number => {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(clinic.lat - userLat)
  const dLng = toRad(clinic.lng - userLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) * Math.cos(toRad(clinic.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const directionsUrl = (clinic: Clinic): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`
