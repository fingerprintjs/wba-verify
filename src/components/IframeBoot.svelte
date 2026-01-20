<script lang="ts">
  import { onMount } from 'svelte'

  import { bootIframe } from '../iframe/iframe'

  onMount(() => {
    bootIframe()

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