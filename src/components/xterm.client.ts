import * as Xterm from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

import { spinnerXterm, type Spinner } from './spinner'
import { verification, type VerificationState } from '../stores/verification.ts'
import { isMuted } from '../stores/audio.ts'
import { varValue } from '../utils/cssVar.ts'
import WriteSoundUrl from '../assets/audio/xterm-write.mp3'
import type { Terminal } from '@xterm/xterm'

// ANSI colors
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  fg: {
    dim: '\x1b[38;2;166;104;84m',
    gray: '\x1b[90m',
    blue: '\x1b[38;2;34;213;243m',
    red: '\x1b[38;2;243;34;121m',
    orange: '\x1b[38;2;243;88;32m',
    white: '\x1b[38;2;255;255;255m',
  },
  bg: {
    red: '\x1b[48;2;243;34;121m',
  },
}

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
      renderIntro(term)
    },
  },
  curl: {
    category: 'commands',
    description: 'Show curl example and optionally copy it',
    handler: curlCommand,
  },
  docs: {
    category: 'info',
    description: 'Open the documentation',
    handler: docsCommand,
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
function helpCommand(_args: string[], term: Xterm.Terminal) {
  for (const category of ['info', 'commands'] as const) {
    const entries = Object.entries(commands).filter(([, spec]) => spec.category === category && !spec.isHidden)
    if (!entries.length) continue

    term.write(`${ANSI.bold}${ANSI.fg.dim}${category.charAt(0).toUpperCase() + category.slice(1)}${ANSI.reset}\r\n`)
    for (const [i, [name, spec]] of entries.entries()) {
      term.write(
        `  ${name.padEnd(8)} ${ANSI.fg.dim}: ${spec.description}${ANSI.reset}\r${i === entries.length - 1 ? '' : '\n'}`
      )
    }
  }
  // Extra callouts so users discover key commands
  term.write(`\r\n${ANSI.bold}${ANSI.fg.dim}Examples${ANSI.reset}\r\n`)
  term.write(
    `  ${ANSI.bold}curl${ANSI.reset}     ${ANSI.fg.dim}: Show an API curl example and optionally copy it${ANSI.reset}\r\n`
  )
}

function renderIntro(term: Terminal) {
  term.write(intro)
}

const CURL_CMD = `curl -H "Accept: application/json" \\
     -H "Signature: sig1=..." \\
     -H "Signature-Input: sig1=..." \\
     -H "Signature-Agent: https://chatgpt.com" \\
     https://wba-quickstart.vercel.app`

type PendingPrompt = { type: 'copy-curl'; text: string } | null

let pendingPrompt: PendingPrompt = null

function curlCommand(_args: string[], term: Xterm.Terminal) {
  term.writeln('')
  term.writeln(`${ANSI.fg.dim}Use this to call the endpoint and get JSON back (instead of HTML).${ANSI.reset}`)
  term.writeln(
    `${ANSI.fg.dim}Replace the ${ANSI.bold}...${ANSI.reset}${ANSI.fg.dim} values with real Signature headers.${ANSI.reset}`
  )
  term.writeln('')
  term.writeln(CURL_CMD)
  term.writeln('')
  term.write('Copy to clipboard [Y]/n: ')
  pendingPrompt = { type: 'copy-curl', text: CURL_CMD }
}

async function copyCommand(_args: string[], term: Xterm.Terminal) {
  const v = verification.get(verification)

  if (!v.raw) {
    term.write(
      `${ANSI.fg.dim}No API response to copy.${ANSI.reset} Enter ${ANSI.bold}r${ANSI.reset} to run the test.\r\n`
    )
    return
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(v.raw, null, 2))
    term.write(`${ANSI.fg.blue}✓ API response copied to clipboard${ANSI.reset}`)
  } catch (err) {
    term.write(`${ANSI.fg.red}Error:${ANSI.reset} ${(err as Error).message}`)
  }
}

function docsCommand(_args: string[], term: Xterm.Terminal) {
  const url = 'https://docs.fingerprint.com'
  window.open(url, '_blank', 'noopener,noreferrer')
  term.writeln('')
  term.writeln('\x1b[2mOpened docs in a new tab\x1b[0m')
}

async function retryCommand(_args: string[], term: Xterm.Terminal) {
  // Trigger the WBAV test. xterm is updated via store subscription.
  await verification.run()
}

// Dispatcher
let isBusy = false
const PROMPT = '$ '

async function dispatchCommand(input: string, term: Xterm.Terminal): Promise<void> {
  const trimmed = input.trim()

  if (pendingPrompt) {
    const answer = trimmed.toLowerCase()
    const shouldCopy = answer === '' || answer === 'y' || answer === 'yes'

    if (shouldCopy) {
      try {
        await navigator.clipboard.writeText(pendingPrompt.text)
        term.write(`\r\n${ANSI.fg.blue}✅ Copied to clipboard.${ANSI.reset}`)
      } catch {
        term.write(`\r\n${ANSI.fg.red}❌ Failed to copy to clipboard.${ANSI.reset}`)
      }
    } else {
      term.write(`\r\n${ANSI.fg.dim}Ok, not copied.${ANSI.reset}`)
    }

    pendingPrompt = null
    term.write(`\r\n${PROMPT}`)
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
    term.write(`\r\n${PROMPT}`)
  }
}

// Terminal setup and mounting
const intro =
  'To use this tool:\r\n' +
  `${ANSI.fg.dim}1.${ANSI.reset} Have your bot open this URL, like in Agent mode.\r\n` +
  `${ANSI.fg.dim}2.${ANSI.reset} If verification fails, ensure your bot has the required headers.\r\n` +
  `${ANSI.fg.dim}3.${ANSI.reset} Enter ${ANSI.bold}curl${ANSI.reset} for API, ${ANSI.bold}help${ANSI.reset} for commands.\r\n\n`

let term: Xterm.Terminal | null = null

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

  // Initial fit
  requestAnimationFrame(() => fit.fit())

  // Write the intro text
  renderIntro(t)

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
    // Only handle UI updates here. The command logic is in retryCommand.
    switch (v.status) {
      case 'pending':
        spinner?.stop()
        spinner = spinnerXterm(t, 'Verifying Bot...')
        break
      case 'success':
        spinner?.stop()
        spinner = null
        t.writeln('\x1b[32mVerification OK\x1b[0m')
        break
      case 'error':
        spinner?.stop()
        spinner = null
        t.writeln(
          `${ANSI.bg.red}${ANSI.fg.white}Verification Failed${ANSI.reset}\r\n\n${ANSI.fg.red}${v.error ?? ''}${ANSI.reset}`
        )
        break
    }
  })

  // xterm input handling
  let buffer = ''

  t.onData((data) => {
    switch (data) {
      case '\r': // Enter Key
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
        break

      case '\u007f': // Backspace
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1)
          t.write('\b \b')
        }
        break

      default: // Printable characters
        if (data >= ' ' && data <= '~') {
          buffer += data
          t.write(data)
        }
    }
  })

  // write the $ prompt and focus the terminal
  t.write(PROMPT)
  t.focus()

  return term
}

// Focus helper for external use like clicking a button in navbar
export function focusXterm() {
  term?.focus()
}
