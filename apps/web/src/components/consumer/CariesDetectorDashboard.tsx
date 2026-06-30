'use client'

import { useEffect, useRef, useState } from 'react'
import { FlatCard } from '@/components/consumer/warm/WarmUI'
import { getLastScanResult, saveScanResult, type ScanResult } from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { screeningSaveErrorText } from '@/lib/screeningApi'
import { useSaveScreening } from '@/hooks/useSaveScreening'
import { useToast } from '@/components/ui/Toast'
import { ClassChildPicker, type ScreenTarget } from './caries/ClassChildPicker'
import { ScanUploader } from './caries/ScanUploader'
import { ResultsPanel } from './caries/ResultsPanel'
import { MAX_UPLOAD_BYTES, fileToDataUrl } from './caries/imageUtils'

/** Скрининг хуудас — анги/хүүхэд сонгож, зураг оруулж, AI шинжилгээ хийгээд DB-д хадгална. */
export const CariesDetectorDashboard = ({ initialResult = false }: { initialResult?: boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [target, setTarget] = useState<ScreenTarget | null>(null)
  const [persistUrl, setPersistUrl] = useState<string | null>(null)
  const save = useSaveScreening()
  const toast = useToast()

  useEffect(() => {
    if (!initialResult) return
    const saved = getLastScanResult()
    if (saved) {
      setResult(saved)
      setPreview(saved.imageUrl)
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
    setPersistUrl(null)
    setAnalysisError(null)
    save.reset()
  }

  const runAnalysis = async () => {
    if (!preview || !file) return
    setAnalyzing(true)
    setAnalysisError(null)
    save.reset()
    try {
      const dataUrl = await fileToDataUrl(file).catch(() => preview)
      const scanResult = await analyzeScanImage(file, dataUrl, target?.age)
      saveScanResult(scanResult)
      sessionStorage.setItem('screener.lastCapture', dataUrl)
      setPersistUrl(dataUrl)
      setResult(scanResult)
      // Хадгалах нь гар ажиллагаатай: хэрэглэгч доорх "Дүгнэлтийг хадгалах" товчоор DB-д бичнэ.
    } catch (err) {
      setAnalysisError(scanErrorText(err instanceof Error ? err.message : 'inference_failed'))
    } finally {
      setAnalyzing(false)
    }
  }

  const clearAll = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setAnalysisError(null)
    save.reset()
    if (fileRef.current) fileRef.current.value = ''
  }

  // Дүгнэлтийг (зураг + илрүүлэлт + AI зөвлөмж) сонгосон хүүхдийн бүртгэлд хадгална → toast
  // мэдэгдэл гарч, дашборд/ростер (мобайл дээр ч ижил ангийн сурагч) автоматаар шинэчлэгдэнэ.
  const onSave = () => {
    if (!result || !target || !persistUrl || save.isPending) return
    save.mutate(
      { scan: result, target, persistUrl },
      {
        onSuccess: () => toast.success(`${target.childLabel} — бүртгэлд хадгаллаа`),
        onError: (e) => toast.error(screeningSaveErrorText(e instanceof Error ? e.message : 'error')),
      },
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Анги + хүүхэд сонгож, зураг шинжилгээний дараа "Дүгнэлтийг хадгалах" товчоор бүртгэнэ. */}
      <ClassChildPicker onChange={setTarget} />

      <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-0 flex-col gap-6">
          <ScanUploader
            fileRef={fileRef}
            displayImage={result?.imageUrl ?? preview}
            displayDetections={result?.detections ?? []}
            analyzing={analyzing}
            analysisError={analysisError}
            canAnalyze={Boolean(file && preview && !analyzing)}
            onFile={onFile}
            onAnalyze={runAnalysis}
            onClear={clearAll}
          />
        </div>

        <div className="min-h-0 xl:sticky xl:top-28">
          {result ? (
            <div className="flex h-full min-h-0 flex-col gap-3">
              <FlatCard glass className="min-h-0 flex-1 overflow-y-auto p-6 xl:p-8">
                <ResultsPanel result={result} />
              </FlatCard>
              <div className="flex items-center justify-end gap-3">
                {!target && <p className="mr-auto text-[12px] text-text-muted">Хадгалахын тулд эхлээд анги, хүүхэд сонгоно уу</p>}
                <button
                  type="button"
                  onClick={onSave}
                  disabled={!target || save.isPending || save.isSuccess}
                  className="btn shrink-0 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {save.isPending ? 'Хадгалж байна…' : save.isSuccess ? '✓ Хадгаллаа' : 'Дүгнэлтийг хадгалах'}
                </button>
              </div>
            </div>
          ) : (
            <FlatCard glass className="flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center">
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
