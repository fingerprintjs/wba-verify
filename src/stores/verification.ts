import { get, writable } from 'svelte/store'
import { runWBAVTest } from '../utils/runWBAVTest.ts'
import { WBAV_ERROR_MESSAGES } from '../utils/wbavErrors.ts'

type VerificationErrorItem = {
  code: string
  message: string
}

type RunWBAVTestSuccess = {
  ok: true
  details: {
    method: string
    url: string
    headers: Record<string, string>
    timestamp: string
    keyId?: string
    keySource?: string
  }
  raw: unknown
  httpStatus: number
}

type RunWBAVTestError = {
  ok: false
  errors: VerificationErrorItem[]
  raw: unknown
  httpStatus: number
}

type RunWBAVTestResult = RunWBAVTestSuccess | RunWBAVTestError

function formatWbavError(e: VerificationErrorItem): string {
  if (e && typeof e === 'object') {
    const code = e.code != null ? String(e.code) : null
    const mapped = code ? WBAV_ERROR_MESSAGES[code] : null
    const message = e.message != null ? String(e.message) : null
    return mapped ?? message ?? 'Unknown error'
  }
  return String(e ?? 'Unknown error')
}

export type VerificationState = {
  status: 'idle' | 'pending' | 'success' | 'error'
  raw: unknown | null
  error: string | null
}

const initialState: VerificationState = {
  status: 'idle',
  raw: null,
  error: null,
}

// Store
function createVerification() {
  const { subscribe, set, update } = writable<VerificationState>(initialState)
  let runId = 0

  async function run(baseUrl: string) {
    const id = ++runId

    update((state) => ({
      ...state,
      status: 'pending',
      error: null,
    }))

    try {
      const result = (await runWBAVTest(baseUrl)) as RunWBAVTestResult
      if (id !== runId) return

      if (result.ok) {
        set({
          status: 'success',
          raw: result.details,
          error: null,
        })
      } else {
        const errors = result.errors
        const errorText = errors.map(formatWbavError).join('\n')

        set({
          status: 'error',
          raw: result.raw,
          error: errorText,
        })
      }
    } catch (err) {
      if (id !== runId) return

      set({
        status: 'error',
        raw: null,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  function reset() {
    runId++
    set(initialState)
  }

  return {
    get,
    subscribe,
    run,
    reset,
  }
}

export const verification = createVerification()
