import { FIGLET } from '../constants'
import './styles.css'
;(() => {
  const figlet = document.querySelector<HTMLElement>('.terminal__figlet')
  if (!figlet) return

  // Split the figlet into an array of lines, replacing empty lines with a non-breaking space
  const figletLines = FIGLET.split('\n').map((line) => (line.length === 0 ? '\u00A0' : line))

  const frag = document.createDocumentFragment()

  // Render each line of the figlet with a staggered animation delay
  for (let i = 0; i < figletLines.length; i++) {
    const lineEl = document.createElement('pre')
    lineEl.className = 'terminal__figlet-line'
    lineEl.style.setProperty('--i', String(i))
    lineEl.textContent = figletLines[i]
    frag.appendChild(lineEl)
  }

  figlet.appendChild(frag)

  // Render the terminal boot text after the figlet appears
  const terminalBootEl = document.querySelector<HTMLElement>('.terminal__boot')
  if (terminalBootEl) {
    terminalBootEl.style.setProperty('--i', String(figletLines.length + 2))
  }
})()
