import { useEffect, useState } from 'react'
import {
  isModelCached,
  downloadModel,
  refreshModelStatus,
  getModelStatus,
  subscribeModelStatus,
  type ModelStatus,
} from './localInference'
import { MODEL_URL } from './config'

/**
 * Warm the on-device ONNX model into the cache as soon as a signed-in user lands
 * in the app — well BEFORE they reach the camera. Offline capture falls back to
 * local inference only when the model is already cached (see api.ts), so a phone
 * heading into a no-signal soum must download the model while it still has signal.
 * Pulling the download up to the authenticated shell (instead of waiting for the
 * camera screen) is what makes a cold-start, fully-offline first scan possible.
 *
 * No-op when the model is already cached or when MODEL_URL is unset. Failures are
 * swallowed: a missing model just means the server-inference path is used online.
 */
export const useModelPrefetch = () => {
  useEffect(() => {
    // Surface "ready" immediately when the model is already on disk.
    void refreshModelStatus()
    const url = MODEL_URL
    if (!url) return
    let cancelled = false
    void isModelCached().then((cached) => {
      if (cancelled || cached) return
      downloadModel(url).catch(() => { /* stays on server-inference path */ })
    })
    return () => { cancelled = true }
  }, [])
}

/** Subscribe to the model download status for a UI indicator. */
export const useModelStatus = (): ModelStatus => {
  const [status, setStatus] = useState<ModelStatus>(getModelStatus())
  useEffect(() => subscribeModelStatus(setStatus), [])
  return status
}
