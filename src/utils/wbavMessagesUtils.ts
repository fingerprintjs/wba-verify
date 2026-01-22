import * as Xterm from '@xterm/xterm'
import { WBAV_MESSAGES } from '../constants.ts'
import type { VerificationState } from '../stores/verification.ts'
import { ANSI } from '../components/xterm.client.ts'

export type Severity = 'success' | 'warning' | 'error'

type WbavStyle = {
  symbol: string
  titleFg: string
  titleBg: string
  bodyFg: string
}

export function resolveWbavMessage(v: VerificationState) {
  if (v.status === 'success') {
    return WBAV_MESSAGES.SUCCESS
  }

  const code = v.errorCode ?? 'VALIDATION_FAILED'
  return WBAV_MESSAGES[code] ?? WBAV_MESSAGES.VALIDATION_FAILED
}

export function renderWbavResult(term: Xterm.Terminal, v: VerificationState) {
  const msg = resolveWbavMessage(v)
  const severity = getSeverity(v)
  const styles = stylesFor(severity)

  term.writeln('')
  term.writeln(`${styles.titleBg}${styles.titleFg}${ANSI.bold}${styles.symbol} ${msg.title} ${ANSI.reset}`)
  term.writeln('')
  term.writeln(`${styles.bodyFg}${msg.body}${ANSI.reset}`)
}

export function getSeverity(v: VerificationState): Severity {
  if (v.status === 'success') return 'success'
  return v.errorCode === 'INTERNAL_ERROR' ? 'error' : 'warning'
}

function stylesFor(sev: Severity): WbavStyle {
  switch (sev) {
    case 'success':
      return {
        symbol: '✔',
        titleFg: ANSI.fg.black,
        titleBg: ANSI.bg.green,
        bodyFg: ANSI.fg.green,
      }
    case 'warning':
      return {
        symbol: '!',
        titleFg: ANSI.fg.black,
        titleBg: ANSI.bg.yellow,
        bodyFg: ANSI.fg.yellow,
      }
    case 'error':
      return {
        symbol: 'X',
        titleFg: ANSI.fg.white,
        titleBg: ANSI.bg.red,
        bodyFg: ANSI.fg.red,
      }
  }
}
