'use client'

import { useEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/consumer/AppShell'
import Button from '@/components/ui/Button'
import { getLastScanResult } from '@/lib/consumerState'
import { ROUTES } from '@/lib/routes'
import { PaperClipIcon } from '@heroicons/react/24/outline'

type Msg = { from: 'user' | 'doctor'; text: string; time: string; image?: string }

const DoctorChatPage = () => {
  const [input, setInput] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'doctor', text: 'Сайн байна уу! Screening асуулт байвал асуугаарай.', time: '09:00' },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [...m, { from: 'user', text, time }])
    setInput('')
    setWaiting(true)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          from: 'doctor',
          text: 'Баярлалаа. Ойрын хугацаанд клиникт үзүүлэхийг зөвлөж байна (demo).',
          time: new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setWaiting(false)
    }, 1200)
  }

  const attachScan = () => {
    const scan = getLastScanResult()
    if (!scan) {
      alert('Scan үр дүн байхгүй')
      return
    }
    const time = new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [
      ...m,
      { from: 'user', text: 'Scan үр дүн илгээлээ', time, image: scan.imageUrl },
    ])
    setWaiting(true)
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: 'doctor', text: 'Зургийг харлаа. Кариесийн шинж байна — үзлэгт ирээрэй.', time: '09:02' },
      ])
      setWaiting(false)
    }, 1500)
  }

  return (
    <AppShell title="Эмчийн чат" subtitle="Мессеж · scan зураг илгээх" backHref={ROUTES.doctor.root}>
      <div className="warm-card mx-auto flex h-[min(640px,calc(100vh-220px))] max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="font-semibold">Dr. Batbold</p>
            <p className="text-[12px] text-text-muted">
              {waiting ? '● Хариу бичиж байна…' : '● Online'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="Scan" className="mb-2 max-h-40 rounded-2xl border border-border" />
              ) : null}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] ${
                  m.from === 'user' ? 'bg-[#F3B900] text-slate-900' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.text}
              </div>
              <span className="mt-1 text-[10px] text-text-muted">{m.time}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 border-t border-border p-4">
          <button type="button" onClick={attachScan} className="warm-btn-secondary flex size-11 items-center justify-center rounded-full" aria-label="Scan илгээх">
            <PaperClipIcon className="size-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Мессеж…"
            className="consumer-input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <Button onClick={send} disabled={waiting}>Илгээх</Button>
        </div>
      </div>
    </AppShell>
  )
}

export default DoctorChatPage
