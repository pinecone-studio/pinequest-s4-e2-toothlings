import { useState, type RefObject } from 'react'
import { Upload, RotateCcw } from '@/lib/icons'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import type { ScanDetection } from '@/lib/consumerState'
import { cn } from '@/lib/utils'
import { IntraoralImageView } from './IntraoralImageView'

/** Зураг оруулах талбар — чирэх/сонгох, урьдчилан харах, шинжилгээ эхлүүлэх/арилгах. */
export const ScanUploader = ({
  fileRef,
  displayImage,
  displayDetections,
  analyzing,
  analysisError,
  canAnalyze,
  onFile,
  onAnalyze,
  onClear,
  className,
}: {
  fileRef: RefObject<HTMLInputElement | null>
  displayImage: string | null
  displayDetections: ScanDetection[]
  analyzing: boolean
  analysisError: string | null
  canAnalyze: boolean
  onFile: (f: File | null) => void
  onAnalyze: () => void
  onClear: () => void
  className?: string
}) => {
  const [dragOver, setDragOver] = useState(false)

  return (
    <FlatCard className={cn('flex flex-col overflow-hidden p-8', className)}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {/* Дотор нь гүйлгэдэг талбар — талбар багасахад хуудас биш зөвхөн энэ хэсэг гүйлгэнэ. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {!displayImage ? (
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
                ? 'border-[#0e9594] bg-[#0e9594]/10'
                : 'border-border bg-surface-raised hover:border-[#0e9594]/50 hover:bg-[#0e9594]/5',
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

        {displayImage ? (
          <div className="mt-6 flex min-h-0 flex-1 items-center justify-center">
            <IntraoralImageView
              imageUrl={displayImage}
              detections={displayDetections}
              scanning={analyzing}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex shrink-0 flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={onAnalyze}
          className="btn inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-text-on-primary transition-all duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? 'Уншиж байна...' : 'Эхлэх'}
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Дахин эхлэх"
          title="Дахин эхлэх"
          className="btn flex shrink-0 items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary"
        >
          <RotateCcw className="size-5" strokeWidth={2} />
        </button>
      </div>
    </FlatCard>
  )
}
