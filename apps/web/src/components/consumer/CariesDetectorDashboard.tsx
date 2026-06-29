'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash, RotateCcw, Upload, Video, MapPin, AlertTriangle } from '@/lib/icons'
import Link from 'next/link'
import { FilterPill, FlatCard } from '@/components/consumer/warm/WarmUI'
import { TriageHeroCard } from '@/components/consumer/MobilePatterns'
import { ScreeningOverlay } from '@/components/consumer/ScreeningOverlay'
import { ScanConfidencePanel } from '@/components/consumer/ScanConfidencePanel'
import { ScheduleAppointmentModal } from '@/components/consumer/ScheduleAppointmentModal'
import {
  addChildName,
  removeChildName,
  getChildNames,
  getLastScanResult,
  getQuestionnaire,
  saveScanResult,
  type ScanDetection,
  type ScanResult,
} from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const DETECTION_LABEL: Record<string, string> = {
  Caries: 'Шүдний цоорол',
  Cavity: 'Цоорлын том хөндий',
  Crack: 'Шүдний гэмтэл, цуурал',
}

const formatLabel = (d: ScanDetection) => DETECTION_LABEL[d.label] ?? d.label

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const fileToDataUrl = (file: File, maxEdge = 640): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('no_canvas'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('bad_image'))
    }
    img.src = url
  })

const IntraoralImageView = ({
  imageUrl,
  detections,
  scanning = false,
}: {
  imageUrl: string
  detections: ScanDetection[]
  scanning?: boolean
}) => (
  <div className="flex min-h-[320px] w-full flex-1 items-center justify-center overflow-hidden rounded-2xl bg-surface-raised">
    <div className="relative inline-flex max-h-full overflow-hidden rounded-xl">
      <img
        src={imageUrl}
        alt="Шүдний ойрын зураг"
        className="max-h-full w-auto max-w-full object-contain"
      />
      {scanning ? <ScreeningOverlay /> : null}
      {detections.map((d, i) => (
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
          <span className="absolute -top-6 left-0 max-w-[160px] truncate rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {formatLabel(d)} {(d.confidence * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  </div>
)

const ResultsPanel = ({ result }: { result: ScanResult }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const urgent =
    result.urgent || result.triage === 'red' || (result.needsDoctor && result.triage === 'yellow')
  const triageLevel =
    result.triage === 'red' ? 'red' : result.triage === 'yellow' ? 'yellow' : 'green'
  const triageLabel =
    triageLevel === 'red'
      ? 'Яаралтай эмчилгээх хийлгэх'
      : triageLevel === 'yellow'
        ? 'Эмчилгээ шаардлагатай'
        : 'Харьцангуй эрүүл, дараагийн хяналтыг хийгээрэй'
  const triageSummary = urgent
    ? 'Зургийг таньсны дагуу ойрын хугацаанд мэргэжилтэн эмчид үзүүлэхийг зөвлөж байна.'
    : result.advice

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-text-base">Дүгнэлт</h2>
        <p className="mt-1 text-[13px] text-text-muted">YOLOv8 шүдний цоорол таних модел</p>
      </div>

      <TriageHeroCard level={triageLevel} label={triageLabel} summary={triageSummary} />

      <FlatCard className="p-6">
        <p className="text-[12px] font-bold uppercase tracking-wide text-text-muted">Зөвлөмж</p>
        <p className="mt-4 text-[15px] leading-relaxed text-text-base">{result.advice}</p>
      </FlatCard>

      <div>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-text-muted">
          Таньсан цооролтой шүд ({result.detections.length})
        </p>
        <ScanConfidencePanel
          items={result.detections.map((d) => ({
            label: formatLabel(d),
            confidence: d.confidence,
          }))}
        />
      </div>

      {triageLevel === 'red' && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Video className="size-5" strokeWidth={2} />
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-text-base">
            Шүдний эмчтэй видео дуудлага хийж зөвөлгөө авах
          </p>
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="btn shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover active:scale-[0.98]"
          >
            Цаг авах
          </button>
        </div>
      )}

      <ScheduleAppointmentModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />

      {(triageLevel === 'red' || triageLevel === 'yellow') && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-muted">
            <MapPin className="size-5" strokeWidth={2} />
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-text-base">
            Санал болгох хамгийн ойр шүдний эмнэлэг
          </p>
          <Link
            href={ROUTES.doctor.map}
            className="btn shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-base transition hover:border-primary"
          >
            Харах
          </Link>
        </div>
      )}

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-text-muted">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        Бид зурагт үндэслэсэн дүгнэлт гаргаж амны хөндийн байдлыг үнэлэн чиглүүлэх зорилготой.
      </p>
    </div>
  )
}

export const CariesDetectorDashboard = ({ initialResult = false }: { initialResult?: boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [childNames, setChildNames] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const stored = getChildNames()
    const q = getQuestionnaire()
    const names = q?.childName && !stored.includes(q.childName) ? [...stored, q.childName] : stored
    setChildNames(names)
    if (names.length) setActiveFilter((cur) => cur || names[0])
  }, [])

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    setNewName('')
    if (!trimmed || childNames.includes(trimmed)) return
    addChildName(trimmed)
    setChildNames((prev) => [...prev, trimmed])
    setActiveFilter(trimmed)
  }

  const handleRemoveChild = (name: string) => {
    const next = removeChildName(name)
    setChildNames(next)
    if (activeFilter === name) setActiveFilter(next[0] ?? '')
  }

  useEffect(() => {
    if (initialResult) {
      const saved = getLastScanResult()
      if (saved) {
        setResult(saved)
        setPreview(saved.imageUrl)
      }
    }
  }, [initialResult])

  const onFile = (f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setAnalysisError('Зөвхөн зураг (jpg, png) оруулна уу.')
      return
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setAnalysisError('Зураг хэт том байна — 10MB-аас бага зураг оруулна уу.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setAnalysisError(null)
  }

  const runAnalysis = async () => {
    if (!preview || !file) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      // Persist a self-contained data URL (not the ephemeral blob:) so history survives reload.
      const persistUrl = await fileToDataUrl(file).catch(() => preview)
      const scanResult = await analyzeScanImage(file, persistUrl)
      saveScanResult(scanResult)
      sessionStorage.setItem('screener.lastCapture', persistUrl)
      setResult(scanResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'inference_failed'
      setAnalysisError(scanErrorText(message))
    } finally {
      setAnalyzing(false)
    }
  }

  const clearAll = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setAnalysisError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const displayImage = result?.imageUrl ?? preview
  const displayDetections = result?.detections ?? []

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Child selector — add a child by name */}
      <div className="flex flex-wrap items-center gap-2">
        {childNames.map((name) => (
          <FilterPill
            key={name}
            label={name}
            active={activeFilter === name}
            onClick={() => setActiveFilter(name)}
          />
        ))}
        <form onSubmit={handleAddChild} className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Хүүхдийн нэр"
            aria-label="Хүүхдийн нэр нэмэх"
            className="w-36 rounded-full border border-border bg-surface-raised px-4 py-2 text-[13px] text-text-base outline-none transition-colors placeholder:text-text-muted focus:border-[#F3B900]"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            aria-label="Хүүхэд нэмэх"
            title="Хүүхэд нэмэх"
            className="btn flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-5" strokeWidth={2} />
          </button>
        </form>
        {activeFilter && (
          <button
            type="button"
            onClick={() => handleRemoveChild(activeFilter)}
            aria-label={`${activeFilter}-г устгах`}
            title={`${activeFilter}-г устгах`}
            className="btn flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-muted transition-all duration-150 hover:border-triage-red hover:text-triage-red"
          >
            <Trash className="size-5" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left column */}
        <div className="flex min-h-0 flex-col gap-6">
          <FlatCard className="flex h-full flex-col overflow-y-auto p-8">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />

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

            {analysisError ? (
              <p className="mt-4 text-[13px] text-triage-red">{analysisError}</p>
            ) : null}

            {displayImage ? (
              <div className="mt-6 flex min-h-0 flex-1 flex-col">
                <IntraoralImageView
                  imageUrl={displayImage}
                  detections={displayDetections}
                  scanning={analyzing}
                />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!file || !preview || analyzing}
                onClick={runAnalysis}
                className="btn inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-text-on-primary transition-all duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzing ? 'Уншиж байна...' : 'Эхлэх'}
              </button>
              <button
                type="button"
                onClick={clearAll}
                aria-label="Дахин эхлэх"
                title="Дахин эхлэх"
                className="btn flex shrink-0 items-center justify-center rounded-full border border-border bg-surface p-2 text-text-base transition-all duration-150 hover:border-primary"
              >
                <RotateCcw className="size-5" strokeWidth={2} />
              </button>
            </div>
          </FlatCard>
        </div>

        {/* Right column — glass accent panel */}
        <div className="min-h-0 xl:sticky xl:top-28">
          {result ? (
            <FlatCard glass className="h-full overflow-y-auto p-6 xl:p-8">
              <ResultsPanel result={result} />
            </FlatCard>
          ) : (
            <FlatCard
              glass
              className="flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center"
            >
              <p className="mt-5 text-[17px] font-bold text-text-base">Дүгнэлт энд харагдана</p>
              <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-text-muted">
                Зураг оруулсны дараа эхлэх товчийг дарна уу.
              </p>
            </FlatCard>
          )}
        </div>
      </div>
    </div>
  )
}
