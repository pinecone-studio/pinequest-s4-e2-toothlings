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

/**
 * Incoming-call ringtone (callee). A warm, recognizable telephone ring — two detuned
 * sines (440+480 Hz, the classic ringback pair, which beat pleasantly together) played
 * in a "brring · gap · brring · long-pause" cadence. This replaced a single flat beep
 * that sounded like a busy/hang-up tone.
 */
export const startRingtone = (): (() => void) => {
  if (typeof window === 'undefined') return () => {}
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
  if (!AC) return () => {}
  const ctx = new AC()
  const gain = ctx.createGain()
  gain.gain.value = 0
  gain.connect(ctx.destination)
  const oscs = [440, 480].map((f) => {
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.connect(gain)
    o.start()
    return o
  })

  let alive = true
  let timer: ReturnType<typeof setTimeout>
  // [volume, holdMs] steps looped: two short rings, then a long silent gap.
  const steps: [number, number][] = [[0.14, 400], [0, 200], [0.14, 400], [0, 2000]]
  let i = 0
  const step = () => {
    if (!alive) return
    const [vol, dur] = steps[i % steps.length]
    gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.02)
    i++
    timer = setTimeout(step, dur)
  }
  step()

  return () => {
    alive = false
    clearTimeout(timer)
    oscs.forEach((o) => { try { o.stop() } catch { /* already stopped */ } })
    void ctx.close()
  }
}

/** Outgoing "calling…" ringback (caller). */
export const startRingback = (): (() => void) => makeTone(440, 1000, 2000)
