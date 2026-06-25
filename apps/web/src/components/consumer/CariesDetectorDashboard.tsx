'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Upload, Sparkles, Eraser, Stethoscope } from '@/lib/icons'
import Link from 'next/link'
import { DetectedRow, FilterPill, FlatCard, PillButton } from '@/components/consumer/warm/WarmUI'
import { TriageHeroCard } from '@/components/consumer/MobilePatterns'
import {
  getLastScanResult,
  getQuestionnaire,
  getScanHistory,
  saveScanResult,
  type ScanDetection,
  type ScanResult,
} from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const DETECTION_LABEL: Record<string, string> = {
  Caries: 'Шүдний өвчин (caries)',
  Cavity: 'Цохорт (cavity)',
  Crack: 'Салалт (crack)',
}

const formatLabel = (d: ScanDetection) => DETECTION_LABEL[d.label] ?? d.label

const DEFAULT_FILTERS = ['Болд', 'Сарнай', 'Энхбаяр']

const IntraoralImageView = ({ imageUrl, detections }: { imageUrl: string; detections: ScanDetection[] }) => (
  <div className="relative overflow-hidden rounded-2xl bg-slate-100">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={imageUrl} alt="Intraoral" className="w-full object-contain" />
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
          {formatLabel(d).replace(' (caries)', '')} {(d.confidence * 100).toFixed(0)}%
        </span>
      </div>
    ))}
  </div>
)

const ResultsPanel = ({ result }: { result: ScanResult }) => {
  const urgent = result.urgent || result.triage === 'red' || (result.needsDoctor && result.triage === 'yellow')
  const triageLevel = result.triage === 'red' ? 'red' : result.triage === 'yellow' ? 'yellow' : 'green'
  const triageLabel =
    triageLevel === 'red'
      ? 'Яаралтай — эмчид үзүүлэх'
      : triageLevel === 'yellow'
        ? 'Анхаарал хэрэгтэй'
        : 'Хэвийн — хяналт хангалттай'
  const triageSummary =
    urgent
      ? 'AI screening-ийн дагуу ойрын хугацаанд мэргэжилтэн эмчид үзүүлэхийг зөвлөж байна.'
      : result.advice

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">Үр дүн</h2>
        <p className="mt-1 text-[13px] text-slate-500">Загвар: YOLOv8 intraoral caries detector (research/demo)</p>
      </div>

      <TriageHeroCard level={triageLevel} label={triageLabel} summary={triageSummary} />

      <FlatCard className="p-6">
        <p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">Зөвлөмж</p>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{result.advice}</p>
      </FlatCard>

      <div>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-slate-400">
          Илрүүлсэн зүйлс ({result.detections.length})
        </p>
        <div className="space-y-2">
          {result.detections.map((d) => (
            <DetectedRow
              key={d.label + d.confidence}
              label={formatLabel(d)}
              value={`${(d.confidence * 100).toFixed(1)}%`}
            />
          ))}
        </div>
      </div>

      <Link href={ROUTES.doctor.chat}>
        <PillButton variant="primary" className="w-full">
          <Stethoscope className="size-4" strokeWidth={2} />
          Эмчийн зөвлөгөө авах
        </PillButton>
      </Link>
    </div>
  )
}

export const CariesDetectorDashboard = ({ initialResult = false }: { initialResult?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('')

  const filterOptions = useMemo(() => {
    const q = getQuestionnaire()
    const names = new Set(DEFAULT_FILTERS)
    if (q?.childName) names.add(q.childName)
    getScanHistory().forEach(() => {})
    return Array.from(names)
  }, [])

  useEffect(() => {
    if (!activeFilter && filterOptions.length) setActiveFilter(filterOptions[0])
  }, [activeFilter, filterOptions])

  useEffect(() => {
    if (initialResult) {
      const saved = getLastScanResult()
      if (saved) {
        setResult(saved)
        setPreview(saved.imageUrl)
      }
    }
  }, [initialResult])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
      setPreview(null)
      setResult(null)
    } catch {
      setCameraError('Камер нээгдэхгүй — файл оруулна уу.')
    }
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const onFile = (f: File | null) => {
    if (!f) return
    stopCamera()
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setAnalysisError(null)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      setFile(new File([blob], `intraoral-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      setPreview(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const runAnalysis = async () => {
    if (!preview || !file) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const scanResult = await analyzeScanImage(file, preview)
      saveScanResult(scanResult)
      sessionStorage.setItem('screener.lastCapture', preview)
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
    stopCamera()
    if (fileRef.current) fileRef.current.value = ''
  }

  const displayImage = result?.imageUrl ?? preview
  const displayDetections = result?.detections ?? []

  return (
    <div className="space-y-8">
      {/* Filter pills — child / history selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-[13px] font-medium text-slate-500">Хүүхэд:</span>
        {filterOptions.map((name) => (
          <FilterPill key={name} label={name} active={activeFilter === name} onClick={() => setActiveFilter(name)} />
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <FlatCard className="p-8">
            <div className="flex flex-wrap gap-3">
              <PillButton variant="secondary" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" strokeWidth={2} />
                Файл оруулах
              </PillButton>
              <PillButton variant="secondary" onClick={cameraOn ? stopCamera : startCamera}>
                <Camera className="size-4" strokeWidth={2} />
                Камер
              </PillButton>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>

            {!displayImage && !cameraOn ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-6 flex min-h-[320px] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-[#FAF8F5] p-10 text-center transition-all duration-200 hover:border-[#F3B900]/50 hover:bg-[#F3B900]/5"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <Upload className="size-7 text-slate-400" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[16px] font-semibold text-slate-900">Intraoral зураг оруулна уу</p>
                  <p className="mt-2 max-w-sm text-[13px] text-slate-500">
                    Файл чөлөөлөх эсвэл камер ашиглан шүдний ойрын зураг аваарай
                  </p>
                </div>
              </button>
            ) : null}

            {cameraOn && !preview ? (
              <div className="relative mt-6 overflow-hidden rounded-2xl bg-slate-900">
                <video ref={videoRef} className="aspect-[4/3] w-full object-cover" playsInline muted />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
                  <div className="aspect-[3/2] w-full max-w-md rounded-2xl border-2 border-dashed border-white/40" />
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <PillButton variant="primary" onClick={capturePhoto}>
                    Зураг авах
                  </PillButton>
                </div>
              </div>
            ) : null}

            {cameraError ? <p className="mt-4 text-[13px] text-red-600">{cameraError}</p> : null}
            {analysisError ? <p className="mt-4 text-[13px] text-red-600">{analysisError}</p> : null}

            {displayImage ? <div className="mt-6">{displayImage && <IntraoralImageView imageUrl={displayImage} detections={displayDetections} />}</div> : null}

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <PillButton variant="primary" disabled={!file || !preview || analyzing} onClick={runAnalysis}>
                <Sparkles className={cn('size-4', analyzing && 'animate-pulse')} strokeWidth={2} />
                {analyzing ? 'Шинжилж байна…' : 'AI шинжилгээ хийх'}
              </PillButton>
              <PillButton variant="ghost" onClick={clearAll}>
                <Eraser className="size-4" strokeWidth={2} />
                Цэвэрлэх
              </PillButton>
            </div>
          </FlatCard>
        </div>

        {/* Right column — glass accent panel */}
        <div className="xl:sticky xl:top-28 xl:self-start">
          {result ? (
            <FlatCard glass className="p-6 xl:p-8">
              <ResultsPanel result={result} />
            </FlatCard>
          ) : (
            <FlatCard glass className="flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-[#F3B900]/15">
                <Sparkles className="size-8 text-[#F3B900]" strokeWidth={1.5} />
              </span>
              <p className="mt-5 text-[17px] font-bold text-slate-900">Үр дүн энд харагдана</p>
              <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-slate-500">
                Зураг оруулсны дараа «AI шинжилгээ хийх» дарж triage, зөвлөмж, илрүүлсэн зүйлсийг хараарай.
              </p>
            </FlatCard>
          )}
        </div>
      </div>
    </div>
  )
}
