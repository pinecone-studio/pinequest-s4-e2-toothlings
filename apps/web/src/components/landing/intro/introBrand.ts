// ─────────────────────────────────────────────────────────────────────────
// Mouth-Open Reveal — CANONICAL brand + geometry source (single source of truth)
//
// Pure data only: NO React, NO platform imports. This file is the one place the
// closed-mouth reveal's colors, lip silhouette, notch geometry and choreography
// live, so web (and a future mobile parity build) can't drift. If mobile is
// added, copy this file verbatim into apps/mobile and consume the same values.
//
// Palette intentionally stays on the shipping ToothLings system: honey-gold
// (#F2B705) accent on a deep warm-ink field — NOT a new orange/mint scale.
// ─────────────────────────────────────────────────────────────────────────

/** Closed-mouth field + glow + wordmark colors (mirror of the gold brand). */
export const INTRO = {
  // deep warm-ink field — the closed-mouth body. base0 = darkest (outer edge).
  base0: '#0B0A08',
  base1: '#121009',
  base2: '#1B1712',
  base3: '#241E14',
  // honey-gold inner-lip glow (the deliberate accent — rim only, never a flood).
  glow: '#F2B705',
  glowHi: '#FFD24D',
  glowSoft: 'rgba(242, 183, 5, 0.55)',
  // revealed wordmark
  tooth: '#FFFFFF',
  lings: '#F2B705',
  // next-screen surface — the landing field is already black, so the hand-off is seamless.
  next: '#000000',
} as const

// ── Lip silhouette ─────────────────────────────────────────────────────────
// Two lips share ONE seam curve so they tile the viewport exactly when closed
// and frame a symmetric gap when parted. viewBox is 1000×1000 drawn with
// preserveAspectRatio="none" → x maps to 0–100% width, y to 0–100% height.
// The seam dips gently up at centre (y 500 → 452): a smooth organic lip line,
// echoing the concave scoop used on the cards/video (see concaveScoop below) —
// not straight bars.
export const LIP_VB = 1000

/** The shared inner-edge curve, left→right. Drawn as the glow rim on each lip. */
export const SEAM_PATH = 'M0,500 C250,500 350,452 500,452 C650,452 750,500 1000,500'

/** Upper lip fill: top edge + right side + seam back to the left. */
export const UPPER_LIP_PATH =
  'M0,0 H1000 V500 C750,500 650,452 500,452 C350,452 250,500 0,500 Z'

/** Lower lip fill: seam + right side down + bottom edge. */
export const LOWER_LIP_PATH =
  'M0,500 C250,500 350,452 500,452 C650,452 750,500 1000,500 V1000 H0 Z'

/**
 * Concave-notch scoop — the existing card/button signature (a radial hole
 * carved out of a corner, mirrors VideoSection). Reused on the reveal CTA so
 * the mouth and the UI read as one system. `inset` = scoop centre from the
 * bottom-left corner; `holeR` = scoop radius. Returns a CSS mask-image value.
 */
export const concaveScoop = (holeR: number, inset: number): string =>
  `radial-gradient(circle ${holeR}px at ${inset}px calc(100% - ${inset}px), transparent ${holeR}px, #000 ${holeR}px)`

// ── Choreography — one 0→1 progress drives everything ───────────────────────
// p ranges (see README for the full map):
//   0.00–0.10  closed mouth + tiny anticipation compression
//   0.10–0.55  lips part, logo fades/scales in inside the widening gap
//   0.55–0.78  lips clear the viewport, logo settles
//   0.78–1.00  logo docks toward the nav, next-screen content rises in (y only)
export const P = {
  compressEnd: 0.1,
  partEnd: 0.55,
  exitEnd: 0.78,
  end: 1,
} as const

/** Pin = vertical scroll distance (vh) the opening is held for. */
export const PIN_VH = 180
/** How far (vh) each lip travels to clear the viewport. */
export const LIP_TRAVEL_VH = 66
/** Tiny inward press before the parting (vh) — ~1–2px anticipation. */
export const COMPRESS_VH = 0.3

/** Lip parting / exit easing — expo-out, the "expensive" decelerate. */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const
/** Logo settle — calm spring, no visible overshoot. */
export const SPRING = { stiffness: 120, damping: 18 } as const
/** Next-screen content entrance stagger, in progress units (~70ms feel). */
export const STAGGER = 0.04
