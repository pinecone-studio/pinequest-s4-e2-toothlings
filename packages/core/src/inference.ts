import type { BoundingBox, FindingClass, InferenceDetection, InferenceResult, ToothFinding } from '@pinequest/types'

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

/**
 * Below this confidence a detection is treated as noise (glare, saliva, edges)
 * and dropped before it ever reaches the UI or triage — so weak boxes don't
 * clutter the result and don't inflate the count-based red rule. Sits just under
 * the yellow triage threshold so genuine borderline findings still surface.
 */
export const DISPLAY_CONFIDENCE_MIN = 0.4

const toFindingClass = (name: string): FindingClass | null => {
  const n = name.toLowerCase().replace(/\s+/g, '_')
  return (DISEASE_CLASSES as readonly string[]).includes(n) ? (n as FindingClass) : null
}

/** Intersection-over-union of two boxes (0 = disjoint, 1 = identical). */
const iou = (a: BoundingBox, b: BoundingBox): number => {
  const ix = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1))
  const iy = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1))
  const inter = ix * iy
  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1)
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1)
  const union = areaA + areaB - inter
  return union > 0 ? inter / union : 0
}

/**
 * Collapse boxes that overlap heavily (same lesion seen twice), keeping the most
 * confident. Operates on ONE image's detections only — never across the upper /
 * lower arches, whose pixel coordinates are unrelated.
 */
const dedupeDetections = (dets: InferenceDetection[]): InferenceDetection[] => {
  const kept: InferenceDetection[] = []
  for (const d of [...dets].sort((a, b) => b.confidence - a.confidence)) {
    if (!kept.some((k) => iou(k.box, d.box) > 0.5)) kept.push(d)
  }
  return kept
}

/**
 * Normalize the inference service response to the shared camelCase contract:
 * drop non-disease classes, drop sub-threshold noise, and merge duplicate boxes.
 * Same shape whether it came from the server or (later) an on-device model.
 */
export const normalizeInference = (
  raw: RawInference,
  source: 'server' | 'on_device' = 'server',
): InferenceResult => ({
  detections: dedupeDetections(
    raw.detections
      .map((d): InferenceDetection | null => {
        const className = toFindingClass(d.class_name)
        return className && d.confidence >= DISPLAY_CONFIDENCE_MIN
          ? { classId: d.class_id, className, confidence: d.confidence, box: d.box }
          : null
      })
      .filter((d): d is InferenceDetection => d !== null),
  ),
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
