import type { ComponentType } from 'react'
import { HomeIcon, ShieldCheckIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid'
import { guidanceLines, isBulletedText } from '@pinequest/core'
import { ToothBrush, Utensils } from '@/lib/icons'
import type { ScanGuidance } from '@/lib/consumerState'

// ── Нас тохирсон гэрийн арчилгааны зөвлөмжийн хэсгүүд ─────────────────────────

// Heroicons ба локал (@/lib/icons) хоёулаа className авдаг тул зөвхөн түүгээр төрөлжүүлнэ.
type IconType = ComponentType<{ className?: string }>

const GUIDANCE_SECTIONS: { key: keyof ScanGuidance; label: string; Icon: IconType }[] = [
  { key: 'homeCare', label: 'Гэртээ хэвшүүлэх амны хөндийн арчилгааны арга хэмжээ', Icon: HomeIcon },
  { key: 'brushing', label: 'Шүд угаах зөв арга, хугацаа', Icon: ToothBrush },
  { key: 'diet', label: 'Шүдийг эрүүлээр хадгалахад нөлөөлөх хоол, хүнс', Icon: Utensils },
  { key: 'prevention', label: 'Шүд цоорох өвчнөөс урьдчилан сэргийлэх', Icon: ShieldCheckIcon },
  { key: 'nextStep', label: 'Дараагийн алхам', Icon: ArrowRightCircleIcon },
]

/** Нэг зөвлөмжийн бие: жагсаалт бол цэгэн жагсаалт, эс бол энгийн догол мөр. */
const GuidanceBody = ({ text }: { text: string }) => {
  if (!isBulletedText(text)) return <p className="mt-2 text-[14px] leading-relaxed text-text-base">{text}</p>
  const lines = guidanceLines(text)
  return (
    <ul className="mt-2 space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-text-base">
          <span className="mt-1.75 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

/** Gemini-аас ирсэн нас тохирсон дэлгэрэнгүй зөвлөмжийг карт хэлбэрээр харуулна. */
export const GuidanceSections = ({ guidance }: { guidance: ScanGuidance }) => {
  const items = GUIDANCE_SECTIONS.filter((s) => guidance[s.key]?.trim())
  if (!items.length) return null
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <div key={s.key} className="rounded-2xl border border-border bg-surface-raised p-4">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-text-muted">
            <s.Icon className="h-4 w-4 shrink-0 text-text-muted" /> {s.label}
          </p>
          <GuidanceBody text={guidance[s.key] ?? ''} />
        </div>
      ))}
    </div>
  )
}
