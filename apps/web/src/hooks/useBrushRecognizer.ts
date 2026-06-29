'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ImuReading } from '@/lib/esp32Imu'
import {
  advanceCoverage,
  BrushEmitter,
  BrushRecognizer,
  createCoverageState,
  loadBrushModel,
  type BrushPrediction,
  type CoverageState,
} from '@/lib/brush'
import { LIVE_MIN_CONFIDENCE, LIVE_MIN_STREAK } from '@/lib/brush/config'
import { IDLE_LABEL } from '@/lib/brush/zones'

export type BrushModelStatus = 'loading' | 'model' | 'heuristic' | 'error'

export type BrushLivePred = {
  zone: string
  confidence: number
  source: BrushPrediction['source']
  gyroMag: number
}

/**
 * Owns the live brushing recognizer + emitter + coverage tracker. Feed it the
 * raw IMU stream via `handleSample` (wire into useEsp32Imu's onSample). UI state
 * is throttled to one update per animation frame.
 */
export const useBrushRecognizer = () => {
  const [modelStatus, setModelStatus] = useState<BrushModelStatus>('loading')
  const [currentZone, setCurrentZone] = useState<string>(IDLE_LABEL)
  const [coverage, setCoverage] = useState<CoverageState>(() => createCoverageState())
  const [livePred, setLivePred] = useState<BrushLivePred | null>(null)

  const recognizerRef = useRef<BrushRecognizer | null>(null)
  const emitterRef = useRef<BrushEmitter | null>(null)
  const coverageRef = useRef<CoverageState>(createCoverageState())
  const lastTickRef = useRef(0)
  const latestSampleRef = useRef<ImuReading | null>(null)
  const uiFrameRef = useRef<number | null>(null)
  const accrueRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await loadBrushModel()
      if (cancelled) return
      if (result.ok) {
        recognizerRef.current = new BrushRecognizer(result.model, result.meta)
        emitterRef.current = new BrushEmitter(
          result.meta.minLiveConfidence ?? LIVE_MIN_CONFIDENCE,
          result.meta.minStreak ?? LIVE_MIN_STREAK,
        )
        recognizerRef.current.warmup()
        setModelStatus('model')
      } else {
        recognizerRef.current = new BrushRecognizer(null, null)
        emitterRef.current = new BrushEmitter(LIVE_MIN_CONFIDENCE, 1)
        setModelStatus(result.reason === 'missing_files' ? 'heuristic' : 'error')
        if (result.reason !== 'missing_files') {
          console.warn('[brush] model load failed:', result.reason, result.detail)
        }
      }
    })()
    return () => {
      cancelled = true
      if (uiFrameRef.current !== null) cancelAnimationFrame(uiFrameRef.current)
      recognizerRef.current?.dispose()
    }
  }, [])

  const scheduleUi = useCallback((pred: BrushLivePred, zone: string) => {
    if (uiFrameRef.current !== null) return
    uiFrameRef.current = requestAnimationFrame(() => {
      uiFrameRef.current = null
      setLivePred(pred)
      setCurrentZone(zone)
      setCoverage({ ...coverageRef.current })
    })
  }, [])

  const handleSample = useCallback(
    (sample: ImuReading) => {
      latestSampleRef.current = sample
      const rec = recognizerRef.current
      const emitter = emitterRef.current
      if (!rec || !emitter) return

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const pred = rec.push(sample, now)
      if (!pred) return

      const emitted = emitter.push(pred)
      const zone = emitted ?? IDLE_LABEL

      if (accrueRef.current) {
        const last = lastTickRef.current
        const dtSec = last ? (now - last) / 1000 : 0
        lastTickRef.current = now
        coverageRef.current = advanceCoverage(
          coverageRef.current,
          zone,
          pred.gyroMag,
          dtSec,
          now,
        )
      } else {
        lastTickRef.current = now
      }

      scheduleUi(
        { zone, confidence: pred.confidence, source: pred.source, gyroMag: pred.gyroMag },
        zone,
      )
    },
    [scheduleUi],
  )

  const calibrate = useCallback(() => {
    recognizerRef.current?.calibrate(latestSampleRef.current)
    lastTickRef.current = 0
  }, [])

  const resetCoverage = useCallback(() => {
    coverageRef.current = createCoverageState()
    lastTickRef.current = 0
    setCoverage(createCoverageState())
    setCurrentZone(IDLE_LABEL)
  }, [])

  /** Enable/disable coverage accrual (the live zone display keeps running). */
  const setRunning = useCallback((running: boolean) => {
    accrueRef.current = running
    if (running) lastTickRef.current = 0
  }, [])

  return {
    modelStatus,
    currentZone,
    coverage,
    livePred,
    handleSample,
    calibrate,
    resetCoverage,
    setRunning,
  }
}
