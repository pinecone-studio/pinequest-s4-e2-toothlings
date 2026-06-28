'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mpu6050Tracker, parseMpu6050Payload } from '@/lib/mpu6050'
import { isValidEsp32WsUrl, type ImuReading } from '@/lib/esp32Imu'

export type Esp32ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

/** Called on EVERY parsed sample (full stream rate) — for ML, before rAF coalescing. */
export type Esp32SampleListener = (sample: ImuReading) => void

export const useEsp32Imu = (
  url: string,
  enabled = true,
  onSample?: Esp32SampleListener,
) => {
  const [status, setStatus] = useState<Esp32ConnectionStatus>('idle')
  const [reading, setReading] = useState<ImuReading | null>(null)
  const [fusionMode, setFusionMode] = useState<ReturnType<Mpu6050Tracker['getFusionMode']>>('euler')
  const [error, setError] = useState<string | null>(null)

  const trackerRef = useRef(new Mpu6050Tracker())
  const liveReadingRef = useRef<ImuReading | null>(null)
  const rawSampleRef = useRef<ImuReading | null>(null)
  const onSampleRef = useRef<Esp32SampleListener | undefined>(onSample)
  onSampleRef.current = onSample
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef = useRef(0)
  const enabledRef = useRef(enabled)
  const uiFrameRef = useRef<number | null>(null)

  enabledRef.current = enabled

  const publishReading = useCallback((parsed: ImuReading) => {
    liveReadingRef.current = parsed
    if (uiFrameRef.current !== null) return
    uiFrameRef.current = requestAnimationFrame(() => {
      uiFrameRef.current = null
      setReading(liveReadingRef.current)
      setFusionMode(trackerRef.current.getFusionMode())
    })
  }, [])

  const calibrate = useCallback(() => {
    trackerRef.current.reset()
  }, [])

  const clearReconnect = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current)
      reconnectRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    clearReconnect()
    if (uiFrameRef.current !== null) {
      cancelAnimationFrame(uiFrameRef.current)
      uiFrameRef.current = null
    }
    wsRef.current?.close()
    wsRef.current = null
  }, [clearReconnect])

  const connect = useCallback(() => {
    if (!enabledRef.current || typeof window === 'undefined') return

    const target = url.trim()
    if (!isValidEsp32WsUrl(target)) {
      setStatus('error')
      setError('WebSocket хаяг буруу байна (жишээ: ws://172.27.221.251:81)')
      return
    }

    clearReconnect()
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('connecting')
    setError(null)

    try {
      const ws = new WebSocket(target)
      wsRef.current = ws

      ws.onopen = () => {
        attemptRef.current = 0
        setStatus('connected')
      }

      ws.onmessage = (evt) => {
        const parsed = parseMpu6050Payload(String(evt.data))
        if (!parsed) return
        rawSampleRef.current = parsed
        onSampleRef.current?.(parsed)
        const euler = trackerRef.current.update(parsed)
        publishReading({
          ...parsed,
          yaw: euler.yaw,
          pitch: euler.pitch,
          roll: euler.roll,
        })
      }

      ws.onerror = () => {
        setError(
          `${target} руу холбогдож чадсангүй. Компьютер ESP32-тай ижил Wi‑Fi дээр байгаа эсэхийг шалгана уу.`,
        )
        setStatus('error')
      }

      ws.onclose = (evt) => {
        wsRef.current = null
        if (!enabledRef.current) {
          setStatus('disconnected')
          return
        }
        if (evt.code !== 1000) {
          setError(
            `${target} руу холбогдож чадсангүй (код ${evt.code}). ESP32 асаалттай, ижил сүлжээнд байгаа эсэхийг шалгана уу.`,
          )
          setStatus('error')
        } else {
          setStatus('disconnected')
        }
        const delay = Math.min(10_000, 1000 * 2 ** attemptRef.current)
        attemptRef.current += 1
        reconnectRef.current = setTimeout(connect, delay)
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Холбогдож чадсангүй')
    }
  }, [clearReconnect, publishReading, url])

  useEffect(() => {
    if (!enabled) {
      disconnect()
      setStatus('idle')
      return
    }
    connect()
    return disconnect
  }, [connect, disconnect, enabled])

  return {
    status,
    reading,
    liveReadingRef,
    rawSampleRef,
    trackerRef,
    fusionMode,
    error,
    reconnect: connect,
    disconnect,
    calibrate,
  }
}
