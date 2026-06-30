import type { SymptomSet, ToothFinding, TriageResult } from '@pinequest/types'

/**
 * Tunable thresholds. Tune for SENSITIVITY at the green→yellow boundary
 * (catching asymptomatic lesions), not at red. Starting points; need calibration.
 */
export const TRIAGE_THRESHOLDS = {
  redConfidence: 0.75,
  redFindingCount: 3,
  yellowConfidence: 0.45,
  /** Parent message may use definite (vs hedged) wording at/above this. */
  confidentWording: 0.6,
} as const

/** Symptoms that force red regardless of the photos. */
const hasUrgentSymptom = (s: SymptomSet): boolean =>
  Boolean(
    s.swelling || s.painDisturbingSleepOrEating || s.fever || s.gumPimpleOrFistula || s.trauma,
  )

/**
 * Compute triage from findings + symptoms. Lives in TS (not the model) so the
 * rule can evolve without retraining and all three platforms agree.
 */
export const triage = (findings: ToothFinding[], symptoms: SymptomSet): TriageResult => {
  const maxConfidence = findings.reduce((m, f) => Math.max(m, f.confidence), 0)
  const confidentWording = maxConfidence >= TRIAGE_THRESHOLDS.confidentWording

  if (hasUrgentSymptom(symptoms)) {
    return { level: 'red', score: 1, confidentWording: true, reason: 'Яаралтай эмчилгээ шаардлагатай цоорлын' }
  }
  if (findings.length === 0) {
    return { level: 'green', score: 0, confidentWording, reason: 'no_findings' }
  }
  if (
    findings.length >= TRIAGE_THRESHOLDS.redFindingCount ||
    maxConfidence >= TRIAGE_THRESHOLDS.redConfidence
  ) {
    return { level: 'red', score: Math.max(0.8, maxConfidence), confidentWording, reason: 'high_findings' }
  }
  if (maxConfidence >= TRIAGE_THRESHOLDS.yellowConfidence) {
    return { level: 'yellow', score: maxConfidence, confidentWording, reason: 'moderate_findings' }
  }
  return { level: 'green', score: maxConfidence, confidentWording, reason: 'low_confidence_findings' }
}
