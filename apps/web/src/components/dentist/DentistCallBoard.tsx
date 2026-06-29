'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCall } from '@/context/IncomingCallContext'
import type { AppointmentRow } from '@/hooks/useAppointments'
import CallStatsRow from './CallStatsRow'
import CallCalendarStrip from './CallCalendarStrip'
import CallScheduleList from './CallScheduleList'
import CallDetailPanel from './CallDetailPanel'

const midnight = (ms: number) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime() }
const dayTitle = (ms: number) =>
  midnight(ms) === midnight(Date.now())
    ? 'Өнөөдрийн дуудлага'
    : `${new Date(ms).toLocaleDateString('mn-MN', { month: 'long', day: 'numeric' })}-ны дуудлага`

// The dentist call board — stats + calendar strip + the chosen day's calls on the
// left, the selected student's clinical summary on the right.
const DentistCallBoard = ({ appts }: { appts: AppointmentRow[] }) => {
  const { startCall } = useCall()
  const [day, setDay] = useState(() => midnight(Date.now()))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const active = useMemo(() => appts.filter((a) => a.status !== 'cancelled'), [appts])
  const dayAppts = useMemo(
    () => active.filter((a) => midnight(a.scheduledAt) === day).sort((a, b) => a.scheduledAt - b.scheduledAt),
    [active, day],
  )
  const nextId = useMemo(() => {
    const now = Date.now()
    return active.filter((a) => a.status !== 'completed' && a.scheduledAt >= now).sort((a, b) => a.scheduledAt - b.scheduledAt)[0]?.id ?? null
  }, [active])

  // Keep the right panel on a sensible target: the chosen day's first call, or none.
  useEffect(() => {
    setSelectedId((cur) => (dayAppts.some((a) => a.id === cur) ? cur : dayAppts[0]?.id ?? null))
  }, [dayAppts])

  const selected = active.find((a) => a.id === selectedId) ?? null
  const join = (a: AppointmentRow) => startCall(a.createdById, a.childName ?? 'Сурагч')

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <CallStatsRow appts={appts} />
        <CallCalendarStrip appts={appts} selected={day} onSelect={setDay} />
        <CallScheduleList
          title={dayTitle(day)} appts={dayAppts} selectedId={selectedId} nextId={nextId}
          onSelect={(a) => setSelectedId(a.id)} onJoin={join}
        />
      </div>
      <div className="lg:sticky lg:top-4">
        <CallDetailPanel appt={selected} />
      </div>
    </div>
  )
}

export default DentistCallBoard
