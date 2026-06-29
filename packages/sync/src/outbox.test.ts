import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Outbox } from './outbox.js'
import { MemoryStore } from './adapters/memory.js'
import type { ScreeningCreate } from '@pinequest/types'

const makeScreening = (id = 'sc-1'): ScreeningCreate => ({
  id,
  childKey: 'abc123',
  classId: 'class-1',
  schoolId: 'school-1',
  seasonId: '2026-spring',
  screenedById: 'user-1',
  imageRefs: ['img-1'],
  findings: [],
  symptoms: {},
  triage: { level: 'green', score: 0.1, confidentWording: true },
  modelName: 'yolov8',
  capturedAt: '2026-01-01T00:00:00.000Z',
})

describe('Outbox', () => {
  let store: MemoryStore
  let outbox: Outbox

  beforeEach(() => {
    store = new MemoryStore()
    outbox = new Outbox(store)
  })

  it('enqueues a screening and marks it pending', async () => {
    await outbox.add(makeScreening())
    const pending = await outbox.getPending()
    expect(pending).toHaveLength(1)
    expect(pending[0].data.id).toBe('sc-1')
  })

  it('sends pending entries and marks them sent on 201', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    await outbox.add(makeScreening())
    const stats = await outbox.sync('http://api', 'tok')
    expect(stats).toEqual({ sent: 1, failed: 0, skipped: 0 })
    expect(await outbox.getPending()).toHaveLength(0)
  })

  it('marks entry failed on non-ok response and increments attempts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: 'conflict' }),
    })
    await outbox.add(makeScreening())
    const stats = await outbox.sync('http://api', 'tok')
    expect(stats.failed).toBe(1)
    const all = store.all()
    expect(all[0].attempts).toBe(1)
    expect(all[0].lastError).toBe('conflict')
  })

  it('does not send entries that exceeded MAX_ATTEMPTS (they become stuck)', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock
    await outbox.add(makeScreening())
    for (let i = 0; i < 5; i++) await store.markFailed('sc-1', 'err')
    const stats = await outbox.sync('http://api', 'tok')
    expect(stats.sent).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await outbox.getStuck()).toHaveLength(1)
  })
})
