const REQUEST_TIMEOUT_MS = 15_000

/** Browser uses same-origin `/api/*` (Next.js rewrite). SSR uses full URL. */
const resolveApiUrl = (): string => {
  if (typeof window !== 'undefined') return ''
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    'https://screener-api.ariunzul.workers.dev'
  )
}

type ApiEnvelope<T> = { success: boolean; data: T; message?: string }

type FetchOpts = { token?: string | null; method?: string; body?: unknown }

type StatFetchOpts = FetchOpts & { revalidate?: number }

const baseRequest = async <T>(
  path: string,
  opts: FetchOpts & { cache?: RequestCache; next?: NextFetchRequestConfig },
): Promise<T> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${resolveApiUrl()}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: opts.cache,
      next: opts.next,
      signal: controller.signal,
    })

    let json: ApiEnvelope<T>
    try {
      json = (await res.json()) as ApiEnvelope<T>
    } catch {
      throw new Error('invalid_response')
    }

    if (!res.ok || !json.success) {
      throw new Error(json.message ?? `request_failed_${res.status}`)
    }
    return json.data
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('request_timeout')
    }
    if (err instanceof TypeError) {
      throw new Error('network_error')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** Typed fetch to the Hono API. Throws on non-2xx / unsuccessful envelopes. */
export const apiFetch = <T>(path: string, opts: FetchOpts = {}): Promise<T> =>
  baseRequest<T>(path, { ...opts, cache: 'no-store' })

/** Like apiFetch but for stats endpoints — supports Next.js ISR revalidation.
 *  Pass revalidate (seconds) for daily aggregates; omit for mutable data. */
export const apiStatFetch = <T>(path: string, opts: StatFetchOpts = {}): Promise<T> =>
  baseRequest<T>(path, {
    ...opts,
    cache: opts.revalidate !== undefined ? undefined : 'no-store',
    next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
  })

export const authErrorText = (message: string): string => {
  if (message === 'invalid_credentials') return 'Имэйл эсвэл нууц үг буруу байна'
  if (message === 'request_timeout') return 'Хүсэлт хэт удаан — интернэт холболтоо шалгаад дахин оролдоно уу'
  if (message === 'network_error') return 'Серверт холбогдож чадсангүй — API ажиллаж байгаа эсэхийг шалгана уу'
  if (message === 'invalid_response') return 'Серверийн хариу буруу байна — дахин оролдоно уу'
  return 'Нэвтрэхэд алдаа гарлаа — дахин оролдоно уу'
}
