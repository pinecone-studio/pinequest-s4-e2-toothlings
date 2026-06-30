'use client'

import { useRef, useState } from 'react'
import { Upload, RotateCcw } from '@/lib/icons'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { cn } from '@/lib/utils'
import { getMeta, LOTTIE_SRC, MAX_UPLOAD_BYTES } from './types'
import type { ScanDetection } from '@/lib/consumerState'

// ── Зураг дээрх detection boxes ──────────────────────────────────────────────

const IntraoralImageView = ({
  imageUrl,
  detections,
  scanning,
}: {
  imageUrl: string
  detections: ScanDetection[]
  scanning: boolean
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-surface-raised">
    <img src={imageUrl} alt="Шүдний ойрын зураг" className="w-full object-contain" />
    {detections.map((d, i) => {
      const meta = getMeta(d)
      return (
        <div
          key={i}
          className="absolute rounded-lg border border-[#F3B900]/70 bg-[#F3B900]/10"
          style={{
            left: `${d.box.x}%`,
            top: `${d.box.y}%`,
            width: `${d.box.w}%`,
            height: `${d.box.h}%`,
          }}
        >
          <span className="absolute -top-6 left-0 max-w-[180px] truncate rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {meta.emoji} {meta.label} · {(d.confidence * 100).toFixed(0)}%
          </span>
        </div>
      )
    })}
    {scanning && (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-surface/80 backdrop-blur-sm">
        <DotLottieReact src={LOTTIE_SRC} loop autoplay style={{ width: 160, height: 160 }} />
        <div className="text-center">
          <p className="text-[15px] font-semibold text-text-base">AI шинжилж байна…</p>
          <p className="mt-1 text-[13px] text-text-muted">Хэдэн секунд хүлээнэ үү</p>
        </div>
      </div>
    )}
  </div>
)

// ── Зүүн талын зураг upload хэсэг ────────────────────────────────────────────

export const ImagePanel = ({
  file,
  preview,
  analyzing,
  analysisError,
  detections,
  onFile,
  onAnalyze,
  onClear,
}: {
  file: File | null
  preview: string | null
  analyzing: boolean
  analysisError: string | null
  detections: ScanDetection[]
  onFile: (f: File | null) => void
  onAnalyze: () => void
  onClear: () => void
}) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <FlatCard className="flex h-full flex-col overflow-y-auto p-8">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            onFile(e.dataTransfer.files?.[0] ?? null)
          }}
          className={cn(
            'flex min-h-[320px] w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200',
            dragOver
              ? 'border-[#F3B900] bg-[#F3B900]/10'
              : 'border-border bg-surface-raised hover:border-[#F3B900]/50 hover:bg-[#F3B900]/5',
          )}
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <Upload className="size-7 text-text-muted" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[16px] font-semibold text-text-base">
              Амны хөндийн ойрын зураг оруулна уу.
            </p>
            <p className="mt-2 max-w-sm text-[13px] text-text-muted">
              Зургийг энд чирэх эсвэл дарж оруулж болно.
            </p>
          </div>
        </button>
      ) : null}

      {analysisError ? <p className="mt-4 text-[13px] text-triage-red">{analysisError}</p> : null}

      {preview ? (
        <div className="mt-6">
          <IntraoralImageView imageUrl={preview} detections={detections} scanning={analyzing} />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!file || !preview || analyzing}
          onClick={onAnalyze}
          className="btn inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-text-on-primary transition-all duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? 'Уншиж байна...' : 'Эхлэх'}
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Дахин эхлэх"
          className="btn flex shrink-0 items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary"
        >
          <RotateCcw className="size-5" strokeWidth={2} />
        </button>
      </div>
    </FlatCard>
  )
}
