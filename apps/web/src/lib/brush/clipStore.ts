'use client'

/**
 * Labelled clip storage for data collection (IndexedDB, no extra deps).
 *
 * A clip is a short window of RAW IMU samples recorded while the user brushes a
 * known zone. Clips are exported as one JSON file and imported into the Python
 * trainer (training/import_clips.py → data/raw/<label>/*.npy).
 */

import type { Mpu6050Sample } from '@/lib/mpu6050'
import type { Quat } from './featureContract'

export type RawSample = {
  t: number
  qw: number
  qx: number
  qy: number
  qz: number
  yaw: number
  pitch: number
  roll: number
  gx: number
  gy: number
  gz: number
  ax: number
  ay: number
  az: number
}

export type BrushClip = {
  id: string
  label: string
  refQuat: Quat
  samples: RawSample[]
  recordedAt: number
  durationMs: number
}

export const sampleToRaw = (s: Mpu6050Sample): RawSample => ({
  t: s.at,
  qw: s.quaternion?.w ?? 1,
  qx: s.quaternion?.x ?? 0,
  qy: s.quaternion?.y ?? 0,
  qz: s.quaternion?.z ?? 0,
  yaw: s.yaw,
  pitch: s.pitch,
  roll: s.roll,
  gx: s.gyro?.x ?? 0,
  gy: s.gyro?.y ?? 0,
  gz: s.gyro?.z ?? 0,
  ax: s.accel?.x ?? 0,
  ay: s.accel?.y ?? 0,
  az: s.accel?.z ?? 0,
})

const DB_NAME = 'screener-brush'
const STORE = 'clips'
const DB_VERSION = 1

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('label', 'label', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const tx = async <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const req = fn(t.objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    t.oncomplete = () => db.close()
  })
}

export const saveClip = (clip: BrushClip): Promise<IDBValidKey> =>
  tx('readwrite', (s) => s.put(clip))

export const deleteClip = (id: string): Promise<undefined> =>
  tx('readwrite', (s) => s.delete(id) as IDBRequest<undefined>)

export const getAllClips = (): Promise<BrushClip[]> =>
  tx('readonly', (s) => s.getAll() as IDBRequest<BrushClip[]>)

export const clearClips = (): Promise<undefined> =>
  tx('readwrite', (s) => s.clear() as IDBRequest<undefined>)

export const countByLabel = async (): Promise<Record<string, number>> => {
  const clips = await getAllClips()
  const out: Record<string, number> = {}
  for (const c of clips) out[c.label] = (out[c.label] ?? 0) + 1
  return out
}

export type BrushDatasetExport = {
  version: 1
  featureNote: string
  exportedAt: number
  clips: BrushClip[]
}

export const exportDataset = async (): Promise<BrushDatasetExport> => ({
  version: 1,
  featureNote:
    'Raw MPU6050 samples. Features computed in training/features.py (mirror of featureContract.ts).',
  exportedAt: Date.now(),
  clips: await getAllClips(),
})

export const downloadDataset = async (): Promise<void> => {
  const data = await exportDataset()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `brush-dataset-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
