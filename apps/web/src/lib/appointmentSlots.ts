// Upcoming bookable time slots for a dentist video call. Client-side only —
// a few fixed hours over the next 3 days, keeping just the ones still in the future.
const HOURS = [10, 14, 17]

export const buildSlots = (now = new Date()): Date[] => {
  const out: Date[] = []
  for (let day = 0; day < 3 && out.length < 6; day++) {
    for (const h of HOURS) {
      const d = new Date(now)
      d.setDate(now.getDate() + day)
      d.setHours(h, 0, 0, 0)
      if (d.getTime() > now.getTime()) out.push(d)
    }
  }
  return out.slice(0, 6)
}

export const slotLabel = (d: Date, now = new Date()): string => {
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const day =
    d.toDateString() === now.toDateString() ? 'Өнөөдөр'
    : d.toDateString() === tomorrow.toDateString() ? 'Маргааш'
    : `${d.getMonth() + 1}/${d.getDate()}`
  return `${day} ${String(d.getHours()).padStart(2, '0')}:00`
}
