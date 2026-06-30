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

    <ol className="relative md:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-(--shadow-card)">
      {STEPS.map((step, i) => {
        const [lead, detail] = step.split(' — ')
        const last = i === STEPS.length - 1
        return (
          <li key={i} className="relative flex gap-4 pb-7 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className="absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px -translate-x-1/2 bg-primary/30"
              />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-text-on-primary shadow-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-[14px] font-semibold text-text-base">{lead}</p>
              {detail ? <p className="mt-0.5 text-[13px] text-text-muted">{detail}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  </div>
)
