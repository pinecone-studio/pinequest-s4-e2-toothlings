import { useCallback, useEffect, useRef, useState } from 'react'
import { ScreeningOverlay } from '@/components/consumer/ScreeningOverlay'
import type { ScanDetection } from '@/lib/consumerState'
import { getMeta } from './detectionMeta'

type Rect = { left: number; top: number; width: number; height: number }

/** Оруулсан зураг дээр илрүүлсэн хэсгүүдийг хүрээгээр тэмдэглэж харуулна. Зургийг картын
 *  хэмжээг өөрчлөхгүйгээр бүтнээр нь багтаана (object-contain) — тайрахгүй. Илрүүлэлт/хайлтын
 *  давхаргыг харагдаж буй зургийн яг хүрээнд байрлуулж, хувиар өгсөн хайрцгууд зэрэгцэнэ. */
export const IntraoralImageView = ({
  imageUrl,
  detections,
  scanning = false,
}: {
  imageUrl: string
  detections: ScanDetection[]
  scanning?: boolean
}) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const [rect, setRect] = useState<Rect | null>(null)

  // Багтаасан (letterbox) зургийн бодит байрлал/хэмжээг картад харьцуулан хэмжинэ.
  const measure = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    setRect({ left: img.offsetLeft, top: img.offsetTop, width: img.clientWidth, height: img.clientHeight })
  }, [])

  useEffect(() => {
    measure()
    const img = imgRef.current
    const ro = new ResizeObserver(measure)
    if (img) ro.observe(img)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  return (
    <div className="relative flex h-full max-h-full w-full max-w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-raised">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Шүдний ойрын зураг"
        onLoad={measure}
        className="block max-h-full max-w-full object-contain"
      />
      {rect && (
        <div className="pointer-events-none absolute" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
          {scanning && <ScreeningOverlay />}
          {detections.map((d, i) => {
            const meta = getMeta(d)
            return (
              <div
                key={i}
                className="absolute rounded-lg border border-[#0e9594]/70 bg-[#0e9594]/10"
                style={{
                  left: `${d.box.x}%`,
                  top: `${d.box.y}%`,
                  width: `${d.box.w}%`,
                  height: `${d.box.h}%`,
                }}
              >
                <span className="absolute -top-6 left-0 inline-flex max-w-[180px] items-center gap-1 truncate rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <meta.Icon className={`h-3 w-3 shrink-0 ${meta.tone}`} /> {meta.label} · {(d.confidence * 100).toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
