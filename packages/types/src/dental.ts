export type ToothPosition = number // 1-32 (FDI notation)

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface DentalAdvice {
  id: string
  title: string
  description: string
  severity: SeverityLevel
  category: DentalCategory
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type DentalCategory =
  | 'cleaning'
  | 'cavity'
  | 'gum-disease'
  | 'braces'
  | 'whitening'
  | 'pain'
  | 'emergency'
  | 'general'

export interface DentalQuestion {
  id: string
  userId: string
  question: string
  symptom?: string
  affectedTooth?: ToothPosition
  severity?: SeverityLevel
  createdAt: string
}

export interface DentalAnswer {
  id: string
  questionId: string
  advice: DentalAdvice
  respondedBy: 'ai' | 'dentist'
  createdAt: string
}
