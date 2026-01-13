import { get, writable } from 'svelte/store'
import { runTest } from '../utils/runTest'

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

  async function run(baseUrl?: string) {
    const id = ++runId

    update((state) => ({
      ...state,
      status: 'pending',
      error: null,
    }))

    try {
      const result = await runTest(baseUrl)
      if (id !== runId) return

      if (result.ok) {
        set({
          status: 'success',
          raw: result.raw,
          error: null,
        })
      } else {
        set({
          status: 'error',
          raw: result.raw,
          error: result.errors.join('\n'),
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
