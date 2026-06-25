'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

type Props = {
  onCapture: (file: File, previewUrl: string) => void
}

export const CameraView = ({ onCapture }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<'live' | 'preview'>('live')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setMode('live')
    } catch {
      setError('Камер нээгдэхгүй байна — зураг сонгохыг ашиглана уу.')
      setMode('preview')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopStream()
  }, [startCamera, stopStream])

  const capture = () => {
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
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setPreview(url)
      setMode('preview')
      stopStream()
      onCapture(file, url)
    }, 'image/jpeg', 0.92)
  }

  const onFile = (f: File | null) => {
    if (!f) return
    const url = URL.createObjectURL(f)
    setPreview(url)
    setMode('preview')
    stopStream()
    onCapture(f, url)
  }

  return (
    <div className="relative overflow-hidden rounded-[28px]">
      <div className="warm-inset relative aspect-[4/3] w-full bg-[#0a0a0a]">
        {mode === 'live' && !preview ? (
          <video ref={videoRef} className="size-full object-cover" playsInline muted />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Capture" className="size-full object-contain" />
        ) : (
          <div className="flex size-full items-center justify-center text-text-muted">
            <VideoCameraIcon className="size-12 opacity-40" />
          </div>
        )}

        {/* Overlay frame */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="relative aspect-[3/2] w-full max-w-md rounded-3xl border-2 border-dashed border-primary/70 shadow-[inset_0_0_40px_rgba(242,183,5,0.15)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-text-on-primary">
              Шүдний мөр энд байрлана
            </span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error ? <p className="mt-3 text-[13px] text-triage-yellow">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {mode === 'live' ? (
          <Button size="lg" onClick={capture} className="flex-1 sm:flex-none">
            Зураг авах
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={() => { setPreview(null); startCamera() }}>
            Дахин авах
          </Button>
        )}
        <Button size="lg" variant="secondary" onClick={() => fileRef.current?.click()}>
          <PhotoIcon className="size-4" />
          Галерей
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </div>
    </div>
  )
}
