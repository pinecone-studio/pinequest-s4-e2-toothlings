'use client'

import { AppShell } from '@/components/consumer/AppShell'
import { ToothModel } from '@/components/consumer/ToothModel'
import { ROUTES } from '@/lib/routes'

const STEPS = [
  '2 минут — нийт хугацаа',
  '4 бүс × 30 сек — дээд/доод зүүн/баруун',
  '45° өнцөг — сойзны үзүүр шүд, гуурст хүрэлцэх',
  'Гадна, дотор, жевхэн тал бүгдийг давтах',
]

const BrushInstructionsPage = () => (
  <AppShell title="Шүд угаах заавар" subtitle="Видео · 3D анимац · өнцөгийн зөвлөмж" backHref={ROUTES.brush.root}>
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="warm-inset flex aspect-video flex-col items-center justify-center p-8 text-center">
        <span className="text-5xl">▶</span>
        <p className="mt-4 text-[16px] font-semibold">Видео заавар (demo)</p>
        <p className="mt-2 text-[13px] text-text-muted">Bass &amp; Supervise техник — 2 минут</p>
      </div>

      <div className="flex flex-col items-center">
        <ToothModel zoneScores={{ UL: 25, UR: 25, LL: 20, LR: 18 }} />
        <p className="mt-6 text-[14px] font-semibold">3D анимац — зөв угаалгын чиглэл</p>
        <p className="mt-2 text-center text-[13px] text-text-muted">45° өнцөг, бүс бүр 30 секунд</p>
      </div>

      <ol className="grid gap-3 md:col-span-2 md:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={i} className="warm-card flex gap-4 p-5 text-[14px]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle font-bold text-primary">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  </AppShell>
)

export default BrushInstructionsPage
