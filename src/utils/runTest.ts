import { delay } from './delay'

type testError = {
  message?: unknown
}

export async function runTest(baseUrl?: string) {
  const url = baseUrl ? baseUrl : '/api/mock.json' // fallback for client-side

  const [res] = await Promise.all([
    fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    }),
    delay(800),
  ])
  if (!res.status && !res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const data = await res.json()

  if (data?.status === 'error' && Array.isArray(data.errors)) {
    return {
      ok: false as const,
      errors: data.errors.map((e: testError) => String(e?.message ?? 'Unknown error')),
      raw: data,
    }
  }

  if (typeof data?.message === 'string') {
    return {
      ok: true as const,
      message: data.message,
      raw: data,
    }
  }

  throw new Error('Unrecognized WBAV response format')
}
