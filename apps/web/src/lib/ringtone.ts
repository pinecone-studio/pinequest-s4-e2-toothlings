// Looping call tones via the Web Audio API — no binary mp3 assets needed.
// Each starter returns a stop() that silences and releases the audio context.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

const makeTone = (freq: number, onMs: number, offMs: number): (() => void) => {
  if (typeof window === 'undefined') return () => {}
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
  if (!AC) return () => {}
  const ctx = new AC()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.value = 0
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()

  let alive = true
  let timer: ReturnType<typeof setTimeout>
  const beep = () => {
    if (!alive) return
    gain.gain.setTargetAtTime(0.16, ctx.currentTime, 0.01)
    timer = setTimeout(() => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.01)
      timer = setTimeout(beep, offMs)
    }, onMs)
  }
  beep()

  return () => {
    alive = false
    clearTimeout(timer)
    try { osc.stop() } catch { /* already stopped */ }
    void ctx.close()
  }
}

/** Incoming-call ringtone (callee). */
export const startRingtone = (): (() => void) => makeTone(480, 400, 600)

/** Outgoing "calling…" ringback (caller). */
export const startRingback = (): (() => void) => makeTone(440, 1000, 2000)
