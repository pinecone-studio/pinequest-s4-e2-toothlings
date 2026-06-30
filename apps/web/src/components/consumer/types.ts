import type { ScanDetection } from '@/lib/consumerState'

export interface DetectionMeta {
  label: string
  description: string
  emoji: string
}

export const DETECTION_META: Record<string, DetectionMeta> = {
  Caries: {
    label: 'Кариес',
    description: 'Шүдний цооролт — эхний үе',
    emoji: '🔴',
  },
  Cavity: {
    label: 'Цооролт',
    description: 'Шүдэнд нүх үүссэн',
    emoji: '🔴',
  },
  Crack: {
    label: 'Хагарал',
    description: 'Шүдний гадаргуу хагарсан',
    emoji: '🟡',
  },
  Healthy: {
    label: 'Эрүүл',
    description: 'Асуудал илрэхгүй байна',
    emoji: '🟢',
  },
}

export const getMeta = (d: ScanDetection): DetectionMeta =>
  DETECTION_META[d.label] ?? { label: d.label, description: '', emoji: '⚪' }

export const LOTTIE_SRC =
  'https://lottie.host/532317e0-5fd5-4eb4-bb75-34859c81b9bb/UrlHCRFToS.lottie'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const fileToDataUrl = (file: File, maxEdge = 640): Promise<string> =>
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
