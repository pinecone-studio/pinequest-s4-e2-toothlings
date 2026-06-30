import type { Quadrant } from '@pinequest/types'

/**
 * Canonical capture + display order of the four intra-oral photos.
 * Every surface (mobile capture loop, result grid, server attribution) iterates
 * this so the four regions stay in lockstep.
 */
export const QUADRANTS: readonly Quadrant[] = ['upperRight', 'upperLeft', 'lowerRight', 'lowerLeft']

/** Mongolian label shown to the screener / on the result card for each region. */
export const QUADRANT_LABEL_MN: Record<Quadrant, string> = {
  upperRight: 'Хоншоорын баруун тал',
  upperLeft: 'Хоншоорын зүүн тал',
  lowerRight: 'Эрүүний баруун тал',
  lowerLeft: 'Эрүүний зүүн тал',
}

/** Which jaw a quadrant belongs to — drives the upper/lower capture guide art. */
export const isUpperQuadrant = (q: Quadrant): boolean => q === 'upperRight' || q === 'upperLeft'
