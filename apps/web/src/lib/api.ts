const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type ApiEnvelope<T> = { success: boolean; data: T; message?: string }

type FetchOpts = { token?: string | null; method?: string; body?: unknown }

/** Typed fetch to the Fastify API. Throws on non-2xx / unsuccessful envelopes. */
export const apiFetch = async <T>(path: string, opts: FetchOpts = {}): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    cache: 'no-store',
  })
  const json = (await res.json()) as ApiEnvelope<T>
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `request_failed_${res.status}`)
  }
  return json.data
}
