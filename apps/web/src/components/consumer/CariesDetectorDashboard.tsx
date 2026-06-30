'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash } from '@/lib/icons'
import { FilterPill, FlatCard } from '@/components/consumer/warm/WarmUI'
import {
  addChildName,
  removeChildName,
  getChildNames,
  getLastScanResult,
  getQuestionnaire,
  saveScanResult,
} from '@/lib/consumerState'
import { analyzeScanImage, scanErrorText } from '@/lib/scanApi'
import { ImagePanel } from './ImagePanel'
import { ResultsPanel, ResultsPlaceholder } from './ResultsPanel'
import { fileToDataUrl, MAX_UPLOAD_BYTES } from './types'
import type { ScanResult } from '@/lib/consumerState'

export const CariesDetectorDashboard = ({ initialResult = false }: { initialResult?: boolean }) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [childNames, setChildNames] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  useEffect(() => {
    const stored = getChildNames()
    const q = getQuestionnaire()
    const names = q?.childName && !stored.includes(q.childName) ? [...stored, q.childName] : stored
    setChildNames(names)
    if (names.length) setActiveFilter((cur) => cur || names[0])
  }, [])

  useEffect(() => {
    if (initialResult) {
      const saved = getLastScanResult()
      if (saved) {
        setResult(saved)
        setPreview(saved.imageUrl)
      }
    }
  }, [initialResult])

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

  const onAnalyze = async () => {
    if (!preview || !file) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const persistUrl = await fileToDataUrl(file).catch(() => preview)
      const scanResult = await analyzeScanImage(file, persistUrl)
      saveScanResult(scanResult)
      sessionStorage.setItem('screener.lastCapture', persistUrl)
      setResult(scanResult)
    } catch (err) {
      setAnalysisError(scanErrorText(err instanceof Error ? err.message : 'inference_failed'))
    } finally {
      setAnalyzing(false)
    }
  }

  const onClear = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setAnalysisError(null)
  }

  return (
    <div className="flex h-full flex-col gap-8">
      {/* Хүүхэд сонгох */}
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
            className="w-36 rounded-full border border-border bg-surface-raised px-4 py-2 text-[13px] text-text-base outline-none transition-colors placeholder:text-text-muted focus:border-[#F3B900]"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="btn flex items-center justify-center rounded-full border border-border bg-surface p-2 transition-all hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-5" strokeWidth={2} />
          </button>
        </form>
        {activeFilter && (
          <button
            type="button"
            onClick={() => handleRemoveChild(activeFilter)}
            className="btn flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-muted transition-all hover:border-triage-red hover:text-triage-red"
          >
            <Trash className="size-5" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="grid min-h-0 flex-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-0 flex-col gap-6">
          <ImagePanel
            file={file}
            preview={result?.imageUrl ?? preview}
            analyzing={analyzing}
            analysisError={analysisError}
            detections={result?.detections ?? []}
            onFile={onFile}
            onAnalyze={onAnalyze}
            onClear={onClear}
          />
        </div>

        <div className="min-h-0 xl:sticky xl:top-28">
          <FlatCard glass className="h-full overflow-y-auto p-6 xl:p-8">
            {result ? (
              <ResultsPanel result={result} />
            ) : (
              <ResultsPlaceholder analyzing={analyzing} />
            )}
          </FlatCard>
        </div>
      </div>
    </div>
  )
}
