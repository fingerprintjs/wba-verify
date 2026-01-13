import type { Terminal } from '@xterm/xterm'

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const DELAY = 80

export type Spinner = {
  stop: () => void
}

export function spinnerEl(el: HTMLElement, text = 'Verifying...'): Spinner {
  let i = 0
  let last = 0
  let id: number

  const loop = (time: number) => {
    if (time - last > DELAY) {
      el.innerText = `${FRAMES[i++ % FRAMES.length]} ${text}`
      last = time
    }
    id = requestAnimationFrame(loop)
  }

  id = requestAnimationFrame(loop)

  const stop = () => {
    cancelAnimationFrame(id)
    el.innerText = ''
  }

  return { stop }
}

export function spinnerXterm(term: Terminal, text = 'Verifying...'): Spinner {
  let i = 0

  term.write('\x1b[?25l') // hide cursor

  const id = setInterval(() => {
    term.write(`\r\x1b[K${FRAMES[i++ % FRAMES.length]} ${text}`)
  }, DELAY)

  const stop = () => {
    clearInterval(id)
    term.write('\r\x1b[K\x1b[?25h') // clear line and show cursor
  }

  return { stop }
}
