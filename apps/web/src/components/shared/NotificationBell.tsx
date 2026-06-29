'use client'

import { useEffect, useRef, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/solid'
import { useSchedule } from '@/hooks/useSchedule'
import { useMyAppointments } from '@/hooks/useAppointments'
import { useMe } from '@/hooks/useMe'
import { downloadICS } from '@/lib/calendar'

const SEEN_KEY = 'toothlings.seenNotifs'
type Tone = 'call' | 'visit' | 'followup'
type Notif = { id: string; title: string; date: string; tone: Tone }

// Role-scoped notifications: a dentist sees the video calls booked WITH them;
// everyone else sees their own scheduled visits / follow-ups. The badge counts
// only UNSEEN items; "Бүгдийг үзсэн" persists the current set as seen.
const NotificationBell = () => {
  const { data: me } = useMe()
  const { data: schedule } = useSchedule()
  const { data: appts } = useMyAppointments()
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { const raw = localStorage.getItem(SEEN_KEY); if (raw) setSeen(new Set(JSON.parse(raw) as string[])) } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const items: Notif[] = me?.role === 'dentist'
    ? (appts ?? []).filter((a) => a.status !== 'cancelled').map((a) => ({ id: a.id, title: `Видео дуудлага · ${a.childName ?? 'Сурагч'}`, date: new Date(a.scheduledAt).toISOString(), tone: 'call' }))
    : (schedule ?? []).map((e) => ({ id: e.id, title: e.title, date: e.date, tone: e.kind === 'visit' ? 'visit' : 'followup' }))

  const now = Date.now()
  const upcoming = items
    .filter((e) => new Date(e.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)
  const unseen = upcoming.filter((e) => !seen.has(e.id)).length

  const markAllSeen = () => {
    const next = new Set(seen)
    upcoming.forEach((e) => next.add(e.id))
    setSeen(next)
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
  }
  const remind = (e: Notif) => downloadICS({ title: e.title, start: new Date(e.date) }, 'reminder.ics')
  const dot = (t: Tone) => (t === 'call' ? 'bg-triage-red' : t === 'visit' ? 'bg-primary' : 'bg-triage-yellow')

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Мэдэгдэл"
        className="btn relative flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary">
        <BellIcon className="size-5" />
        {unseen > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-triage-red px-1 text-[9px] font-bold leading-4 text-white">{unseen}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[200] mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-(--shadow-float)">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Мэдэгдэл</p>
            {unseen > 0 && (
              <button onClick={markAllSeen} className="btn rounded-full px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary-subtle">Бүгдийг үзсэн</button>
            )}
          </div>
          {upcoming.length === 0 ? (
            <p className="px-2 py-5 text-center text-[12px] text-text-muted">Шинэ мэдэгдэл алга.</p>
          ) : (
            upcoming.map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-surface-raised">
                <span className={`size-2 shrink-0 rounded-full ${seen.has(e.id) ? 'bg-border' : dot(e.tone)}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-text-base">{e.title}</p>
                  <p className="text-[10px] text-text-muted">{new Date(e.date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => remind(e)} className="btn shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary-subtle">Сануулга</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
