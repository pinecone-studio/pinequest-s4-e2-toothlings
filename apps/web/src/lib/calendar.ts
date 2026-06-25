// Build a downloadable .ics calendar invite with an alarm. Opening it on a
// phone adds the screening visit to the calendar and fires a local reminder —
// an honest, infra-free "reminder on phone" (no server SMS/push needed).

type VisitEvent = {
  title: string
  description?: string
  /** ISO date/time of the visit. */
  start: Date
  /** Visit length in minutes (default 60). */
  durationMin?: number
  /** Minutes before start to alarm (default 1 day = 1440). */
  remindMinBefore?: number
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Format a Date to UTC iCal stamp: 20260901T013000Z */
const toICalUTC = (d: Date): string =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`

const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

export const buildICS = (ev: VisitEvent): string => {
  const end = new Date(ev.start.getTime() + (ev.durationMin ?? 60) * 60_000)
  const uid = `${ev.start.getTime()}-${Math.random().toString(36).slice(2)}@screener`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Screener//Visit//MN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICalUTC(new Date())}`,
    `DTSTART:${toICalUTC(ev.start)}`,
    `DTEND:${toICalUTC(end)}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.description ? `DESCRIPTION:${esc(ev.description)}` : '',
    'BEGIN:VALARM',
    `TRIGGER:-PT${ev.remindMinBefore ?? 1440}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(ev.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n')
}

/** Trigger a browser download of the .ics file. */
export const downloadICS = (ev: VisitEvent, filename = 'screening-visit.ics'): void => {
  const blob = new Blob([buildICS(ev)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
