/**
 * FDI (Fédération Dentaire Internationale) tooth numbering helpers.
 *
 * Permanent dentition: quadrants 1-4, teeth 1-8 → codes 11-48
 * Primary (deciduous): quadrants 5-8, teeth 1-5 → codes 51-85
 *
 * Quadrant layout (patient perspective):
 *   1 = upper right   2 = upper left
 *   4 = lower right   3 = lower left
 *   5 = upper right   6 = upper left   (primary)
 *   8 = lower right   7 = lower left   (primary)
 */

export type FdiQuadrant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type FdiDentition = 'permanent' | 'primary'

/** Returns true if `code` is a valid two-digit FDI code. */
export const isValidFdi = (code: number): boolean => {
  if (!Number.isInteger(code)) return false
  const q = Math.floor(code / 10)
  const t = code % 10
  if (q >= 1 && q <= 4) return t >= 1 && t <= 8
  if (q >= 5 && q <= 8) return t >= 1 && t <= 5
  return false
}

/** Returns the quadrant number (1–8) for a valid FDI code, or null if invalid. */
export const fdiQuadrant = (code: number): FdiQuadrant | null =>
  isValidFdi(code) ? (Math.floor(code / 10) as FdiQuadrant) : null

/** Returns 'permanent' or 'primary' for a valid FDI code. */
export const fdiDentition = (code: number): FdiDentition | null => {
  if (!isValidFdi(code)) return null
  return Math.floor(code / 10) <= 4 ? 'permanent' : 'primary'
}

/** Returns whether the tooth is in the upper arch. */
export const fdiIsUpper = (code: number): boolean | null => {
  if (!isValidFdi(code)) return null
  const q = Math.floor(code / 10)
  return q === 1 || q === 2 || q === 5 || q === 6
}

const TOOTH_NAMES_MN: Record<number, string> = {
  1: 'дунд шүд',
  2: 'хажуу шүд',
  3: 'нохойн шүд',
  4: 'урд тэрэм',
  5: 'хойд тэрэм',
  6: 'урд бага зуурдас',
  7: 'хойд бага зуурдас',
  8: 'мэргэний шүд',
}

const PRIMARY_NAMES_MN: Record<number, string> = {
  1: 'дунд сүүн шүд',
  2: 'хажуу сүүн шүд',
  3: 'сүүн нохойн шүд',
  4: 'урд сүүн тэрэм',
  5: 'хойд сүүн тэрэм',
}

const QUADRANT_LABEL_MN: Record<FdiQuadrant, string> = {
  1: 'дээд баруун',
  2: 'дээд зүүн',
  3: 'доод зүүн',
  4: 'доод баруун',
  5: 'дээд баруун (сүүн)',
  6: 'дээд зүүн (сүүн)',
  7: 'доод зүүн (сүүн)',
  8: 'доод баруун (сүүн)',
}

/** Mongolian label for a FDI code, e.g. "дээд баруун дунд шүд (11)". Returns null if invalid. */
export const fdiLabel = (code: number): string | null => {
  if (!isValidFdi(code)) return null
  const q = Math.floor(code / 10) as FdiQuadrant
  const t = code % 10
  const names = q <= 4 ? TOOTH_NAMES_MN : PRIMARY_NAMES_MN
  return `${QUADRANT_LABEL_MN[q]} ${names[t] ?? t + '-р шүд'} (${code})`
}

/** Validate a range of FDI codes and return only the valid ones. */
export const filterValidFdi = (codes: number[]): number[] => codes.filter(isValidFdi)
