'use client'

import dynamic from 'next/dynamic'
import { useRef, useState, useCallback, useMemo } from 'react'
import { PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useSetPageHeader } from '@/components/shell/ShellHeaderContext'
import { useVolunteerDentists } from '@/hooks/useHelp'
import { DentistProfileCard } from '@/components/admin/help/DentistProfileCard'

const VolunteerDentistsMap = dynamic(
  () => import('@/components/admin/help/VolunteerDentistsMap').then((m) => m.VolunteerDentistsMap),
  { ssr: false, loading: () => <div className="h-48 w-full animate-pulse rounded-xl bg-surface-raised" /> },
)

type Triage = 'red' | 'yellow' | 'green'
type Detection = { label: string; confidence: number }
type Result = { triage: Triage; advice: string; detections: Detection[] }

const BADGE: Record<Triage, { pill: string; wrap: string; label: string }> = {
  red:    { pill: 'bg-triage-red text-white',  wrap: 'border-triage-red/30 bg-red-50/40',  label: 'УЛААН'  },
  yellow: { pill: 'bg-yellow-400 text-white',  wrap: 'border-yellow-200 bg-yellow-50/40', label: 'ШАР'    },
  green:  { pill: 'bg-green-500 text-white',   wrap: 'border-green-200 bg-green-50/40',   label: 'НОГООН' },
}

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

const TriagePage = () => {
  useSetPageHeader({ title: 'Зургийн шинжилгээ', subtitle: 'Зураг байршуулж AI шинжилгээ авах' })

  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile]       = useState<File | null>(null)
  const [busy, setBusy]       = useState(false)
  const [result, setResult]   = useState<Result | null>(null)
  const [err, setErr]         = useState<string | null>(null)

  const { data: dentists = [], isLoading: dentLoading } = useVolunteerDentists()
  const [selId, setSelId] = useState<string | null>(null)
  const [dists, setDists] = useState<Record<string, number>>({})
  const [done, setDone]   = useState<Set<string>>(new Set())

  const pickFile = (f: File) => {
    setFile(f); setResult(null); setErr(null)
    setPreview(URL.createObjectURL(f))
  }

  const analyze = async () => {
    if (!file) return
    setBusy(true); setErr(null)
    try {
      const form = new FormData()
      form.append('image', file)
      const res  = await fetch(`${API}/api/inference/analyze`, { method: 'POST', body: form })
      const data = await res.json() as Result & { message?: string }
      if (!res.ok) throw new Error(data.message ?? 'err')
      setResult(data)
    } catch {
      setErr('AI шинжилгээнд алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setBusy(false)
    }
  }

  const onDists = useCallback((d: Record<string, number>) => {
    setDists(d)
    const top = Object.entries(d).sort(([, a], [, b]) => a - b)[0]
    if (top) setSelId(top[0])
  }, [])

  const sorted = useMemo(
    () => Object.keys(dists).length === 0 ? dentists
      : [...dentists].sort((a, b) => (dists[a.id] ?? Infinity) - (dists[b.id] ?? Infinity)),
    [dentists, dists],
  )

  const isRed = result?.triage === 'red'

  return (
    <section className="flex max-w-2xl flex-col gap-5">
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface transition-colors hover:border-primary/50"
        onClick={() => !preview && fileRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) pickFile(f) }}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="max-h-72 w-full object-contain" />
            <button onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); setResult(null) }}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-black/80">
              ✕ Устгах
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-text-muted">
            <PhotoIcon className="size-12 opacity-40" />
            <p className="text-[14px] font-medium">Зургийг энд чирж оруулах эсвэл дарах</p>
            <p className="text-[12px] opacity-60">JPG · PNG · HEIC</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }} />
      </div>

      {file && !result && (
        <button onClick={analyze} disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-semibold text-text-on-primary hover:opacity-90 disabled:opacity-60">
          {busy && <ArrowPathIcon className="size-4 animate-spin" />}
          {busy ? 'Шинжилж байна…' : 'AI шинжилгээ хийх'}
        </button>
      )}

      {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{err}</p>}

      {result && (() => {
        const b = BADGE[result.triage]
        return (
          <div className={`space-y-3 rounded-2xl border p-4 ${b.wrap}`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-6 items-center rounded-full px-3 text-[12px] font-bold tracking-wide ${b.pill}`}>{b.label}</span>
              <p className="text-[14px] font-semibold text-text-base">
                {result.detections.length > 0 ? `${result.detections.length} шинж тэмдэг илэрлээ` : 'Аюулын шинж тэмдэг олдсонгүй'}
              </p>
              <button onClick={() => { setResult(null); setPreview(null); setFile(null) }}
                className="ml-auto text-[12px] text-text-muted hover:text-text-base">Дахин шинжлэх</button>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2.5">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">AI Дүгнэлт</p>
              <p className="text-[13px] leading-relaxed text-text-base">{result.advice}</p>
            </div>
            {result.detections.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-1.5">
                <span className="text-[12px] font-medium text-text-base">{d.label}</span>
                <span className="text-[11px] text-text-muted">{Math.round(d.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        )
      })()}

      {isRed && (
        <div className="space-y-3 rounded-2xl border border-triage-red/30 bg-red-50/40 p-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 items-center rounded-full bg-triage-red px-2.5 text-[11px] font-bold tracking-wide text-white">УЛААН</span>
            <p className="text-[13px] font-semibold text-text-base">Сайн дурын эмчтэй холбогдох</p>
          </div>
          <div className="h-52 overflow-hidden rounded-xl border border-border">
            <VolunteerDentistsMap dentists={dentists} selectedId={selId}
              onSelect={(d) => setSelId(d.id)} onDistancesReady={onDists} className="h-full w-full" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
            Холбогдох боломжтой шүдний эмч {dentLoading ? '…' : `(${dentists.length})`}
            {Object.keys(dists).length > 0 && <span className="ml-1 normal-case text-primary"> · Ойролцоогоор эрэмблэгдсэн</span>}
          </p>
          {dentLoading
            ? [0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-raised" />)
            : sorted.length === 0
              ? <p className="text-[13px] text-text-muted">Одоогоор боломжтой сайн дурын эмч байхгүй.</p>
              : (
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {sorted.map((d) => (
                    <div key={d.id}>
                      <DentistProfileCard dentist={d} active={selId === d.id}
                        onConnect={done.has(d.id) ? undefined : () => { setSelId(d.id); setDone((s) => new Set(s).add(d.id)) }} />
                      {dists[d.id] != null && <p className="ml-3 mt-0.5 text-[10px] font-medium text-primary">📍 {dists[d.id]!.toFixed(0)} км</p>}
                    </div>
                  ))}
                </div>
              )
          }
          {done.size > 0 && (
            <p className="rounded-xl bg-green-50 px-3 py-2 text-[12px] text-green-700">
              Хүсэлт илгээгдлээ. Эмч нэвтэрсний дараа холбоо барих болно.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default TriagePage
