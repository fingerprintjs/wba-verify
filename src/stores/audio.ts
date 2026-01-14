import { writable, type Writable } from 'svelte/store'

export const isMuted: Writable<boolean> = writable(false)
