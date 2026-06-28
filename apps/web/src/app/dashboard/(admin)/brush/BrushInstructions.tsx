'use client'

import { ToothModel } from '@/components/consumer/ToothModel'

const STEPS = [
  '2 минут — нийт хугацаа',
  '4 бүс × 30 сек — дээд/доод зүүн/баруун',
  '45° өнцөг — сойзны үзүүр шүд, гуурст хүрэлцэх',
  'Гадна, дотор, жевхэн тал бүгдийг давтах',
]

const BRUSH_VIDEO_ID = 'gAODutgIIVQ'

export const BrushInstructions = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-(--shadow-card)">
      <div className="aspect-video w-full bg-slate-900">
        <iframe
          src={`https://www.youtube.com/embed/${BRUSH_VIDEO_ID}`}
          title="Шүд угаах заавар"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
      <div className="border-t border-border px-5 py-4">
        <p className="text-[15px] font-semibold text-text-base">Видео заавар</p>
        <p className="mt-1 text-[13px] text-text-muted">Bass угаалгын техник — 2 минут</p>
      </div>
    </div>

    <div className="flex flex-col items-center">
      <ToothModel zoneScores={{ UL: 25, UR: 25, LL: 20, LR: 18 }} />
      <p className="mt-6 text-[14px] font-semibold text-text-base">3D анимац — зөв угаалгын чиглэл</p>
      <p className="mt-2 text-center text-[13px] text-text-muted">45° өнцөг, бүс бүр 30 секунд</p>
    </div>

    <ol className="grid gap-3 md:col-span-2 md:grid-cols-2">
      {STEPS.map((step, i) => (
        <li key={i} className="flex gap-4 rounded-2xl border border-border bg-surface p-5 text-[14px] text-text-base shadow-(--shadow-card)">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-[13px] font-bold text-primary">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  </div>
)
