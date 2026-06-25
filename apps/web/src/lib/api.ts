const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type ApiEnvelope<T> = { success: boolean; data: T; message?: string }

type FetchOpts = { token?: string | null; method?: string; body?: unknown }

type StatFetchOpts = FetchOpts & { revalidate?: number }

const baseRequest = async <T>(
  path: string,
  opts: FetchOpts & { cache?: RequestCache; next?: NextFetchRequestConfig },
): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    cache: opts.cache,
    next: opts.next,
  })
  const json = (await res.json()) as ApiEnvelope<T>
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `request_failed_${res.status}`)
  }
  return json.data
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
