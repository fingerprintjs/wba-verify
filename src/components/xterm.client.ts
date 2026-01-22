import * as Xterm from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { spinnerXterm, type Spinner } from './spinner'
import { verification, type VerificationState } from '../stores/verification.ts'
import { isMuted } from '../stores/audio.ts'
import { varValue } from '../utils/cssVar.ts'
import { debounce } from '../utils/debounce.ts'
import WriteSoundUrl from '../assets/audio/xterm-write.mp3'
import { renderWbavResult } from '../utils/wbavMessagesUtils.ts'

import { CURL_ENDPOINT_URL, FINGERPRINT_DASHBOARD_ROOT, SUBMIT_BOT_URL } from '../constants.ts'

export const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  fg: {
    dim: '\x1b[38;2;166;104;84m',
    gray: '\x1b[90m',
    green: '\x1b[38;2;89;243;34m',
    blue: '\x1b[38;2;34;213;243m',
    red: '\x1b[38;2;243;34;121m',
    yellow: '\x1b[38;2;224;159;0m',
    orange: '\x1b[38;2;243;88;32m',
    white: '\x1b[38;2;255;221;200m',
    black: '\x1b[38;2;0;0;0m',
  },
  bg: {
    red: '\x1b[48;2;243;34;121m',
    green: '\x1b[48;2;89;243;34m',
    yellow: '\x1b[48;2;224;159;0m',
  },
}

const INTRO =
  'To use this tool:\r\n' +
  `${ANSI.fg.dim}1.${ANSI.reset} Have your bot open this URL, like in Agent mode.\r\n` +
  `${ANSI.fg.dim}2.${ANSI.reset} If verification fails, ensure your bot has the required headers.\r\n` +
  `${ANSI.fg.dim}3.${ANSI.reset} Enter ${ANSI.bold}curl${ANSI.reset} for API, ${ANSI.bold}help${ANSI.reset} for commands.\r\n`

const CURL_CMD = `${ANSI.fg.dim}curl -H "Accept: application/json" \\
     -H "Signature: sig1=${ANSI.reset}...${ANSI.fg.dim}" \\
     -H "Signature-Input: sig1=${ANSI.reset}...${ANSI.fg.dim}" \\
     -H "Signature-Agent: https://chatgpt.com" \\
     ${CURL_ENDPOINT_URL}${ANSI.reset}`

const MAX_HISTORY = 100

// Command definitions
type CommandHandler = (args: string[], term: Xterm.Terminal) => Promise<void> | void

type CommandSpec = {
  category: 'info' | 'commands' | 'alias'
  description: string
  handler: CommandHandler
  isBlocking?: boolean
  isHidden?: boolean
}

const commands: Record<string, CommandSpec> = {
  c: {
    category: 'commands',
    description: 'Copy the API response to clipboard',
    handler: copyCommand,
  },
  clear: {
    category: 'commands',
    description: 'Clear the terminal',
    handler: (_args, term) => {
      term.clear()
      term.write(INTRO)
    },
  },
  curl: {
    category: 'commands',
    description: 'Show curl example and optionally copy it',
    handler: curlCommand,
  },
  // TODO: add docs link once it is live
  // docs: {
  //   category: 'info',
  //   description: 'Open docs in a new tab',
  //   handler: docsCommand,
  // },
  fp: {
    category: 'info',
    description: 'Open fingerprint.com in a new tab',
    handler: fpCommand,
  },
  help: {
    category: 'info',
    description: 'List the commands available to use',
    handler: helpCommand,
  },
  r: {
    category: 'commands',
    description: 'Run the WBAV test',
    handler: retryCommand,
    isBlocking: true,
  },
  copy: {
    category: 'alias',
    description: "Alias for 'c'",
    handler: async (_args, term) => {
      term.write(`\r\n${ANSI.fg.red}Unknown command 'copy'. Did you mean 'c'?${ANSI.reset}`)
    },
    isHidden: true,
  },
  retry: {
    category: 'alias',
    description: "Alias for 'r'",
    handler: async (_args, term) => {
      term.write(`\r\n${ANSI.fg.red}Unknown command 'retry'. Did you mean 'r'?${ANSI.reset}`)
    },
    isHidden: true,
  },
}

// Command handlers
function curlCommand(_args: string[], term: Xterm.Terminal) {
  term.writeln(`Use this to call the endpoint and get JSON back (instead of HTML).`)
  term.writeln(`Replace the ${ANSI.fg.dim}...${ANSI.reset} values with real Signature headers.`)
  term.writeln('')
  term.writeln(CURL_CMD)
  term.writeln('')

  const confirm = createConfirmPrompt({
    question: 'Copy curl to clipboard',
    defaultYes: true,
    onYes: async (t) => {
      try {
        await navigator.clipboard.writeText(CURL_CMD)
        t.write(`\r\n${ANSI.fg.green}✓ curl copied to clipboard${ANSI.reset}`)
      } catch {
        t.write(`\r\n${ANSI.fg.red}Failed to copy to clipboard${ANSI.reset}`)
      }
    },
    onNo: (t) => {
      t.write(`\r\n${ANSI.fg.dim}Ok, not copied.${ANSI.reset}`)
    },
  })

  confirm.ask(term)
  nextLineHandler = confirm.onLine
}

export async function copyCommand(_args: string[], term: Xterm.Terminal) {
  const v = verification.get(verification)

  if (!v.raw) {
    term.write(`${ANSI.fg.dim}No API response to copy.${ANSI.reset} Enter ${ANSI.bold}r${ANSI.reset} to run the test.`)
    return
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(v.raw, null, 2))
    term.write(`${ANSI.fg.green}✓ API response copied to clipboard${ANSI.reset}`)
  } catch (err) {
    term.write(`${ANSI.fg.red}Error:${ANSI.reset} ${(err as Error).message}`)
  }
}

// TODO: add docs command once it is live
// function docsCommand(_args: string[], term: Xterm.Terminal) {
//   window.open(WBAV_DOCS_URL, '_blank', 'noopener,noreferrer')
//   term.writeln(`${ANSI.fg.dim}Opened docs in a new tab${ANSI.reset}`)
// }

function fpCommand(_args: string[], term: Xterm.Terminal) {
  window.open(FINGERPRINT_DASHBOARD_ROOT, '_blank', 'noopener,noreferrer')
  term.writeln(`${ANSI.fg.dim}Opened fingerprint.com in a new tab${ANSI.reset}`)
}

function helpCommand(_args: string[], term: Xterm.Terminal) {
  const categories = ['info', 'commands']

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]

    const entries: [string, (typeof commands)[string]][] = []

    for (const name in commands) {
      const spec = commands[name]
      if (spec.category !== category) continue
      if (spec.isHidden) continue
      entries.push([name, spec])
    }

    if (entries.length === 0) continue

    if (i > 0) {
      term.write('\n')
    }

    term.write(`${ANSI.bold}${ANSI.fg.dim}${category.charAt(0).toUpperCase() + category.slice(1)}${ANSI.reset}\r\n`)

    for (let j = 0; j < entries.length; j++) {
      const name = entries[j][0]
      const spec = entries[j][1]

      term.write(
        `  ${name.padEnd(8)} ${ANSI.fg.dim}: ${spec.description}${ANSI.reset}\r${
          i === categories.length - 1 && j === entries.length - 1 ? '' : '\n'
        }`
      )
    }
  }
}

async function retryCommand(_args: string[], term: Xterm.Terminal) {
  verification.run(CURL_ENDPOINT_URL)

  const v: VerificationState = await new Promise((resolve) => {
    const unsubscribe = verification.subscribe((state) => {
      if (state.status === 'success' || state.status === 'error') {
        unsubscribe()
        resolve(state)
      }
    })
  })

  renderWbavResult(term, v)

  if (v.status === 'success') {
    promptOnSuccess(term)
  }
}

function promptOnSuccess(term: Xterm.Terminal) {
  term.write('\r\n')

  term.writeln(`${ANSI.fg.green}Your bot request was verified using Web Bot Auth standard.${ANSI.reset}`)
  term.writeln('')
  term.writeln(
    `${ANSI.fg.white}Optional next step: submit your bot to Fingerprint’s Authorized Bots directory.${ANSI.reset}`
  )

  term.write('\r\n')

  const confirm = createConfirmPrompt({
    question: 'Submit your bot',
    description: '(opens dashboard.fingerprint.com)',
    onYes: (t) => {
      window.open(SUBMIT_BOT_URL, '_blank', 'noopener,noreferrer')
      t.write(`\r\n${ANSI.fg.dim}Opened docs in a new tab.${ANSI.reset}`)
    },
    onNo: (t) => {
      t.write(`\r\n${ANSI.fg.dim}Ok — you can run ${ANSI.bold}docs${ANSI.reset}${ANSI.fg.dim} anytime.${ANSI.reset}`)
    },
  })

  confirm.ask(term)
  nextLineHandler = confirm.onLine
}

// Dispatcher
let isBusy = false
const PROMPT = '$ '

type NextLineHandler = (line: string, term: Xterm.Terminal) => Promise<void> | void

let nextLineHandler: NextLineHandler | null = null

type ConfirmPrompt = {
  question: string
  description?: string
  defaultYes?: boolean
  onYes: (term: Xterm.Terminal) => Promise<void> | void
  onNo: (term: Xterm.Terminal) => Promise<void> | void
}

function createConfirmPrompt(cfg: ConfirmPrompt) {
  const defaultYes = cfg.defaultYes ?? true

  return {
    ask(term: Xterm.Terminal) {
      const suffix = defaultYes ? `${ANSI.fg.white}[Y]/n ${ANSI.reset}` : `${ANSI.fg.white}y/[N] ${ANSI.reset}`

      term.write(
        `${ANSI.bold}${ANSI.fg.white}${cfg.question}?${ANSI.reset}${ANSI.fg.dim}${cfg.description ? ` ${cfg.description}` : ''}${ANSI.reset} ${suffix}`
      )
    },
    async onLine(line: string, term: Xterm.Terminal) {
      const answer = line.trim().toLowerCase()
      const isYes = answer === 'y' || answer === 'yes' || (defaultYes && answer === '')

      if (isYes) {
        await cfg.onYes(term)
        term.write(`\r\n${PROMPT}`)
      } else {
        await cfg.onNo(term)
        term.write(`\r\n${PROMPT}`)
      }
    },
  }
}

async function dispatchCommand(input: string, term: Xterm.Terminal): Promise<void> {
  const trimmed = input.trim()

  if (nextLineHandler) {
    const handler = nextLineHandler
    nextLineHandler = null
    await handler(input, term)
    return
  }

  if (!trimmed) {
    term.write(`\r\n${PROMPT}`)
    return
  }

  const [cmdName, ...args] = trimmed.split(/\s+/)
  const commandConfig = commands[cmdName]

  if (!commandConfig) {
    term.write(`\r\n\x1b[38;2;170;64;24mUnknown command:\x1b[0m ${cmdName}`)
    term.write(`\r\n${PROMPT}`)
    return
  }

  // Prevent concurrent commands if command is blocking
  const shouldBlock = commandConfig.isBlocking || false

  if (shouldBlock) {
    isBusy = true
  }

  term.write('\r\n') // Move to new line before command output

  try {
    await commandConfig.handler(args, term) // Await the handler
  } catch (error) {
    term.write(`Error: ${error}\r\n`)
  } finally {
    if (shouldBlock) {
      isBusy = false
    }
    // Always add prompt unless an next line handler takes over
    if (!nextLineHandler) {
      term.write(`\r\n${PROMPT}`)
    }
  }
}

// Terminal setup and mounting
let term: Xterm.Terminal | null = null
// Controls whether the terminal is mounted or not
let hasBooted = false

export function mountXterm(el: HTMLElement) {
  if ((el as any).__xterm__) return
  ;(el as any).__xterm__ = true

  term = new Xterm.Terminal({
    cursorBlink: true,
    convertEol: true,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 14,
    theme: {
      background: 'rgba(0,0,0,0)',
      foreground: varValue('--terminal-text-primary'),
      cursor: varValue('--terminal-text-primary'),
      selectionBackground: varValue('--terminal-selection-bg'),
      selectionForeground: varValue('--terminal-selection-color'),
    },
  })

  const t = term

  const fit = new FitAddon()
  t.loadAddon(fit)
  t.open(el)

  // Attach click and resize listeners
  const container = document.querySelector('.terminal') as HTMLElement | null
  if (container) {
    container.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.xterm')) return

      requestAnimationFrame(() => {
        const selection = window.getSelection()
        if (selection && selection.type === 'Range') return
        t.focus()
      })
    })
  }

  // Handle terminal resizing and initial fit
  const debouncedFit = debounce(() => {
    fit.fit()
  }, 250)

  if (container) {
    const resizeObserver = new ResizeObserver(debouncedFit)
    resizeObserver.observe(container)
  }

  requestAnimationFrame(() => fit.fit())

  // Write the intro
  t.write(INTRO)

  // SFX
  const writeSound = new Audio(WriteSoundUrl)
  writeSound.preload = 'auto'
  isMuted.subscribe((muted) => {
    writeSound.muted = muted
  })

  // Subscribe to verification store
  // Retry can be triggered by command or externally i.e. navbar
  let spinner: Spinner | null = null

  verification.subscribe((v: VerificationState) => {
    switch (v.status) {
      case 'pending':
        spinner?.stop()
        spinner = spinnerXterm(t, 'Verifying Bot...')
        break

      case 'success':
      case 'error':
        spinner?.stop()
        spinner = null

        if (!hasBooted) {
          hasBooted = true
          renderWbavResult(t, v)

          if (v.status === 'success') {
            promptOnSuccess(t)
          } else {
            t.write(`\r\n${PROMPT}`)
          }
        }

        break
    }
  })

  // xterm input handling
  let buffer = ''
  let cursor = 0

  // cmd history
  let history: string[] = []
  let historyIndex = -1

  function pushHistory(cmd: string) {
    if (cmd.trim().length === 0) return
    history.push(cmd)
    // Remove oldest command if size is exceeded
    if (history.length > MAX_HISTORY) {
      history.shift()
    }
  }

  // on xterm data input
  t.onData((data) => {
    switch (data) {
      case '\r': // Enter Key
        if (buffer.trim()) {
          pushHistory(buffer)
          historyIndex = -1
        }

        if (isBusy) {
          t.write(`\r\n${PROMPT}`)
          return
        }
        if (writeSound) {
          writeSound.currentTime = 0
          writeSound.play().catch(() => {})
        }

        dispatchCommand(buffer, t)
        buffer = ''
        cursor = 0
        break

      case '\u007f': // Backspace
        if (cursor > 0) {
          buffer = buffer.slice(0, cursor - 1) + buffer.slice(cursor)

          cursor--
          t.write('\b \b')

          if (cursor < buffer.length) {
            t.write(buffer.slice(cursor))
            t.write(`\x1b[${buffer.length - cursor}D`)
          }
        }
        break

      case '\u001b[A': // Up Arrow
        if (history.length === 0) break
        if (historyIndex === -1) {
          historyIndex = history.length - 1
        } else if (historyIndex > 0) {
          historyIndex--
        }
        // Clear current line
        t.write(`\x1b[2K\r${PROMPT}${history[historyIndex]}`)
        buffer = history[historyIndex]
        cursor = buffer.length
        break

      case '\u001b[B': // Down Arrow
        if (history.length === 0) break
        if (historyIndex === -1) break
        if (historyIndex < history.length - 1) {
          historyIndex++
          t.write(`\x1b[2K\r${PROMPT}${history[historyIndex]}`)
          buffer = history[historyIndex]
          cursor = buffer.length
        } else {
          historyIndex = -1
          t.write(`\x1b[2K\r${PROMPT}`)
          buffer = ''
        }
        break

      case '\x1b[D': // Left Arrow
        if (cursor > 0) {
          cursor--
          t.write('\x1b[D')
        }
        break

      case '\x1b[C': // Right Arrow
        if (cursor < buffer.length) {
          cursor++
          t.write('\x1b[C')
        }
        break

      default: // Printable characters
        if (data >= ' ' && data <= '~') {
          buffer = buffer.slice(0, cursor) + data + buffer.slice(cursor)

          t.write(data)

          if (cursor < buffer.length - 1) {
            t.write(buffer.slice(cursor + 1))
            t.write(`\x1b[${buffer.length - cursor - 1}D`)
          }

          cursor++
        }
    }
  })

  // focus the terminal
  t.focus()

  return term
}

// Focus helper for external use like clicking a button in navbar
export function focusXterm() {
  term?.focus()
}

// Run commands externally like clicking a button in navbar
export function executeXtermCommand(cmd: string) {
  if (!term) return
  term.write(`\x1b[2K\r${PROMPT}${ANSI.fg.dim}${cmd}${ANSI.reset}`)
  dispatchCommand(cmd, term)
}
