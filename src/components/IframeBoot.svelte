<script lang="ts">
    import { onMount } from 'svelte'
    import { FIGLET } from '../constants'
    import '../iframe/styles.css'

    onMount(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return

        const root = document.documentElement

        if (root.getAttribute('data-wbav-iframe-boot') === 'true') return
        root.setAttribute('data-wbav-iframe-boot', 'true')

        const figlet = document.querySelector<HTMLElement>('.terminal__figlet')
        if (!figlet) return

        const figletLines = FIGLET.split('\n').map((line) =>
            line.length === 0 ? '\u00A0' : line
        )

        const frag = document.createDocumentFragment()

        figletLines.forEach((line, i) => {
            const lineEl = document.createElement('pre')
            lineEl.className = 'terminal__figlet-line'
            lineEl.style.setProperty('--i', String(i))
            lineEl.textContent = line
            frag.appendChild(lineEl)
        })

        figlet.appendChild(frag)

        const terminalBootEl = document.querySelector<HTMLElement>('.terminal__boot')
        if (terminalBootEl) {
            terminalBootEl.style.setProperty('--i', String(figletLines.length + 2))
        }

        const unhide = (() => {
            let done = false
            return () => {
                if (done) return
                done = true
                document.documentElement.removeAttribute('data-wbav-boot')
            }
        })()

        unhide()
        window.addEventListener('load', unhide, { once: true })
        setTimeout(unhide, 600)
    })
</script>