import { delay } from './delay'

type VerificationError = {
  status: 'error'
  errors: {
    code: string
    message: string
  }[]
}

type VerificationSuccess = {
  status: 'success'
  details: {
    method: string
    url: string
    headers: Record<string, string>
    timestamp: string
    keyId?: string
    keySource?: string
  }
}

type VerificationResponse = VerificationError | VerificationSuccess

export async function runWBAVTest(baseUrl: string) {
  const [res] = await Promise.all([
    fetch(baseUrl, {
      headers: {
        Accept: 'application/json',
      },
    }),
    delay(800),
  ])

  const resForText = res.clone()

  let data: VerificationResponse
  try {
    data = (await res.json()) as VerificationResponse
  } catch {
    const text = await resForText.text().catch(() => '')
    throw new Error(`Non-JSON response (HTTP ${res.status}). ${text ? `Body: ${text.slice(0, 200)}` : ''}`.trim())
  }

  if (data.status === 'error') {
    return {
      ok: false as const,
      errors: data.errors,
      raw: data,
      httpStatus: res.status,
    }
  }

  if (data.status === 'success') {
    return {
      ok: true as const,
      details: data.details,
      raw: data,
      httpStatus: res.status,
    }
  }

  throw new Error('Unrecognized WBAV response format')
}
