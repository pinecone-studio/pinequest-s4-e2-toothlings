import type { FindingClass, InferenceDetection, InferenceResult, ToothFinding } from '@pinequest/types'

/** Raw response shape from the stateless Python YOLOv8 service (snake_case). */
export type RawInference = {
  detections: {
    class_id: number
    class_name: string
    confidence: number
    box: { x1: number; y1: number; x2: number; y2: number }
  }[]
  image_width: number
  image_height: number
}

const DISEASE_CLASSES: readonly FindingClass[] = ['caries', 'cavity', 'crack']

const toFindingClass = (name: string): FindingClass | null => {
  const n = name.toLowerCase().replace(/\s+/g, '_')
  return (DISEASE_CLASSES as readonly string[]).includes(n) ? (n as FindingClass) : null
}

/**
 * Normalize the inference service response to the shared camelCase contract,
 * dropping any non-disease classes. Same shape whether it came from the server
 * or (later) an on-device model.
 */
export const normalizeInference = (
  raw: RawInference,
  source: 'server' | 'on_device' = 'server',
): InferenceResult => ({
  detections: raw.detections
    .map((d): InferenceDetection | null => {
      const className = toFindingClass(d.class_name)
      return className ? { classId: d.class_id, className, confidence: d.confidence, box: d.box } : null
    })
    .filter((d): d is InferenceDetection => d !== null),
  imageWidth: raw.image_width,
  imageHeight: raw.image_height,
  source,
})

/** Build immutable ToothFindings from detections (FDI localization is a later concern). */
export const detectionsToFindings = (
  detections: InferenceDetection[],
  makeId: () => string,
): ToothFinding[] =>
  detections.map((d) => ({
    id: makeId(),
    className: d.className,
    classId: d.classId,
    confidence: d.confidence,
    box: d.box,
  }))
