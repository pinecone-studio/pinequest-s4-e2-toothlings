/**
 * Gemini эцэг эхэд зориулсан ЗӨВЛӨМЖ (advice) + нас тохирсон дэлгэрэнгүй заавар
 * (guidance) гаргана — detection/triage биш. triage логик TS (packages/core) дотор
 * үлдэнэ; загвар/AI зөвхөн илрүүлэлт + зөвлөмж. Prompt → geminiPrompt, parse → geminiParsing.
 */
import type { InferenceDetection, ScreeningGuidance, SymptomSet, TriageLevel } from '@pinequest/types'
import { buildAdvicePrompt } from './geminiPrompt.js'
import { GUIDANCE_SCHEMA, arrayBufferToBase64, extractGeminiResponseText, parseGuidance } from './geminiParsing.js'

export { fallbackAdvice } from './geminiPrompt.js'

// Gemini зөвлөмж зөвхөн нэмэлт текст учир хэт удвал таслаад fallback руу шилжинэ.
const GEMINI_TIMEOUT_MS = 20_000

/**
 * Gemini дүгнэлт (advice) + нас тохирсон дэлгэрэнгүй зөвлөмж (guidance) гаргана
 * (зураг + илрүүлэлт + асуумж дээр тулгуурлан). Тохиргоо/сүлжээ алдаа гарвал null
 * буцаана — дуудагч fallback хийнэ.
 */
export const runGeminiAdvice = async (params: {
  apiKey: string
  model: string
  triageLevel: TriageLevel
  detections: InferenceDetection[]
  symptoms: SymptomSet
  age?: string
  image?: File
}): Promise<{ advice: string; guidance?: ScreeningGuidance } | null> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    params.model,
  )}:generateContent?key=${params.apiKey}`

  const promptText = buildAdvicePrompt({
    triageLevel: params.triageLevel,
    detections: params.detections,
    symptoms: params.symptoms,
    age: params.age ?? '',
  })

  const parts: Array<Record<string, unknown>> = [{ text: promptText }]
  if (params.image) {
    try {
      const base64 = arrayBufferToBase64(await params.image.arrayBuffer())
      parts.push({ inlineData: { mimeType: params.image.type || 'image/jpeg', data: base64 } })
    } catch {
      // image optional — fall back to text-only prompt
    }
  }

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0,
      // 6 талбартай structured JSON + thinking загварт хүрэлцэхээр өргөн авав.
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
      responseSchema: GUIDANCE_SCHEMA,
    },
  }

  // Cap how long we wait on Gemini: it is advice-only, so if it stalls we abort
  // and let the caller fall back to triage-level boilerplate rather than hanging
  // the whole analyze request (and the mobile capture screen) behind it.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error('Gemini advice request failed:', await res.text().catch(() => ''))
      return null
    }
    const text = extractGeminiResponseText(await res.json())
    return text ? parseGuidance(text) : null
  } catch (err) {
    console.error('Gemini advice error:', err)
    return null
  } finally {
    clearTimeout(timer)
  }
}
