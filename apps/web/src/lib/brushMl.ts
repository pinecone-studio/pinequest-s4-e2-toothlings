import type { BrushZone } from '@/lib/consumerState'

export type ToothSurface = 'outer' | 'inner' | 'occlusal'

/** Sensor frame from ESP32 smart brush (IMU + pressure). */
export type BrushSensorFrame = {
  timestamp: number
  zone: BrushZone
  surface: ToothSurface
  pressure: number
  tiltDeg: number
}

export type ToothId = `${'U' | 'L'}-${'L' | 'R'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`

export type ToothState = {
  id: ToothId
  arch: 'upper' | 'lower'
  side: 'left' | 'right'
  index: number
  coverage: number
  surfaces: Record<ToothSurface, number>
}

export type BrushMlState = {
  teeth: ToothState[]
  activeToothId: ToothId | null
  zoneLabel: string
  overallCoverage: number
}

const SURFACES: ToothSurface[] = ['outer', 'inner', 'occlusal']

const buildTeeth = (): ToothState[] => {
  const teeth: ToothState[] = []
  for (const arch of ['upper', 'lower'] as const) {
    for (const side of ['left', 'right'] as const) {
      for (let i = 1; i <= 8; i++) {
        const prefix = arch === 'upper' ? 'U' : 'L'
        const id = `${prefix}-${side === 'left' ? 'L' : 'R'}${i}` as ToothId
        teeth.push({
          id,
          arch,
          side,
          index: i,
          coverage: 0,
          surfaces: { outer: 0, inner: 0, occlusal: 0 },
        })
      }
    }
  }
  return teeth
}

const ZONE_TO_ARCH: Record<BrushZone, 'upper' | 'lower'> = {
  UL: 'upper',
  UR: 'upper',
  LL: 'lower',
  LR: 'lower',
}

const ZONE_TO_SIDE: Record<BrushZone, 'left' | 'right'> = {
  UL: 'left',
  UR: 'right',
  LL: 'left',
  LR: 'right',
}

const SURFACE_MN: Record<ToothSurface, string> = {
  outer: 'гадна',
  inner: 'дотор',
  occlusal: 'жевхэн',
}

const ARCH_MN: Record<'upper' | 'lower', string> = {
  upper: 'Дээд',
  lower: 'Доод',
}

const SIDE_MN: Record<'left' | 'right', string> = {
  left: 'зүүн',
  right: 'баруун',
}

/** Map IMU tilt within quadrant to tooth index 1–8 (incisor → molar). */
const toothIndexFromTilt = (tiltDeg: number): number => {
  const clamped = Math.max(-45, Math.min(45, tiltDeg))
  const t = (clamped + 45) / 90
  return Math.min(8, Math.max(1, Math.round(1 + t * 7)))
}

export const resolveActiveTooth = (frame: BrushSensorFrame): ToothId => {
  const arch = ZONE_TO_ARCH[frame.zone]
  const side = ZONE_TO_SIDE[frame.zone]
  const idx = toothIndexFromTilt(frame.tiltDeg)
  const prefix = arch === 'upper' ? 'U' : 'L'
  return `${prefix}-${side === 'left' ? 'L' : 'R'}${idx}` as ToothId
}

export const formatZoneLabel = (frame: BrushSensorFrame, toothId: ToothId): string => {
  const arch = ZONE_TO_ARCH[frame.zone]
  const side = ZONE_TO_SIDE[frame.zone]
  const num = toothId.split('-')[1]?.slice(1) ?? '1'
  return `${ARCH_MN[arch]}, ${SIDE_MN[side]}, ${SURFACE_MN[frame.surface]} · #${num}`
}

const recomputeCoverage = (tooth: ToothState): number => {
  const vals = SURFACES.map((s) => tooth.surfaces[s])
  return Math.round(vals.reduce((a, b) => a + b, 0) / SURFACES.length)
}

const computeOverall = (teeth: ToothState[]): number => {
  if (!teeth.length) return 0
  return Math.round(teeth.reduce((sum, t) => sum + t.coverage, 0) / teeth.length)
}

/** ML coverage update — weights pressure + dwell time per surface. */
export const processSensorFrame = (state: BrushMlState, frame: BrushSensorFrame): BrushMlState => {
  const activeToothId = resolveActiveTooth(frame)
  const pressureFactor = frame.pressure < 0.35 ? 0.4 : frame.pressure > 0.85 ? 0.7 : 1.15
  const delta = 4.5 * pressureFactor

  const teeth = state.teeth.map((tooth) => {
    if (tooth.id !== activeToothId) return tooth
    const nextSurface = Math.min(100, tooth.surfaces[frame.surface] + delta)
    const surfaces = { ...tooth.surfaces, [frame.surface]: nextSurface }
    const coverage = recomputeCoverage({ ...tooth, surfaces })
    return { ...tooth, surfaces, coverage }
  })

  return {
    teeth,
    activeToothId,
    zoneLabel: formatZoneLabel(frame, activeToothId),
    overallCoverage: computeOverall(teeth),
  }
}

export const createBrushMlState = (savedCoverage?: Record<string, number>): BrushMlState => {
  const teeth = buildTeeth().map((t) => ({
    ...t,
    coverage: savedCoverage?.[t.id] ?? 0,
    surfaces: {
      outer: savedCoverage?.[t.id] ? Math.min(100, (savedCoverage[t.id] ?? 0) * 1.05) : 0,
      inner: savedCoverage?.[t.id] ? Math.min(100, (savedCoverage[t.id] ?? 0) * 0.95) : 0,
      occlusal: savedCoverage?.[t.id] ? Math.min(100, (savedCoverage[t.id] ?? 0) * 0.85) : 0,
    },
  }))
  return {
    teeth,
    activeToothId: null,
    zoneLabel: 'Сойзоо асаагаад эхлүүлнэ үү',
    overallCoverage: computeOverall(teeth),
  }
}

export const teethToCoverageMap = (teeth: ToothState[]): Record<string, number> =>
  Object.fromEntries(teeth.map((t) => [t.id, t.coverage]))

/** Demo: synthesize ESP32 frames while the session runs. */
export const synthesizeSensorFrame = (
  zone: BrushZone,
  tick: number,
  pressure: 'low' | 'ok' | 'high',
): BrushSensorFrame => {
  const surface = SURFACES[tick % SURFACES.length]
  const tiltDeg = Math.sin(tick / 8) * 38 + (ZONE_TO_SIDE[zone] === 'left' ? -8 : 8)
  const pressureVal = pressure === 'low' ? 0.25 : pressure === 'high' ? 0.92 : 0.62
  return {
    timestamp: Date.now(),
    zone,
    surface,
    pressure: pressureVal,
    tiltDeg,
  }
}

export type ToothVisualState = 'clean' | 'partial' | 'missed'

export const toothVisualState = (coverage: number): ToothVisualState => {
  if (coverage >= 75) return 'clean'
  if (coverage >= 25) return 'partial'
  return 'missed'
}

export type ToothLayout = {
  id: ToothId
  x: number
  y: number
  w: number
  h: number
  rot: number
}

/** Arch layout for SVG rendering (patient view, mouth opens downward). */
export const buildToothLayout = (): ToothLayout[] => {
  const layouts: ToothLayout[] = []
  const cx = 200
  const cyU = 118
  const cyL = 192
  const rx = 138
  const ryU = 52
  const ryL = 48

  for (const arch of ['upper', 'lower'] as const) {
    for (const side of ['left', 'right'] as const) {
      for (let i = 1; i <= 8; i++) {
        const t = (i - 1) / 7
        const spread = side === 'left' ? Math.PI * (0.92 - t * 0.72) : Math.PI * (0.08 + t * 0.72)
        const cxArch = cx
        const cy = arch === 'upper' ? cyU : cyL
        const rxA = rx
        const ry = arch === 'upper' ? ryU : ryL
        const x = cxArch + rxA * Math.cos(spread)
        const y = cy + ry * Math.sin(spread) * (arch === 'upper' ? 1 : 1)
        const w = 14 + (8 - i) * 0.6
        const h = 22 + (8 - i) * 0.8
        const rot = ((spread * 180) / Math.PI - 90) * (side === 'left' ? 1 : -1) * 0.35
        const prefix = arch === 'upper' ? 'U' : 'L'
        const id = `${prefix}-${side === 'left' ? 'L' : 'R'}${i}` as ToothId
        layouts.push({ id, x, y, w, h, rot })
      }
    }
  }
  return layouts
}
