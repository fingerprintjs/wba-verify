<script lang="ts">
  import { FIGLET, VERSION } from '../constants'

  // Figlet banner
  const figletLines = FIGLET.split('\n').map((line) => (line.length === 0 ? '\u00A0' : line))
</script>

<div class="terminal">
  <div class="terminal__inner">
    <h1 class="sr-only">Web Bot Auth Verification v{VERSION}</h1>
    <!-- Banner -->
    <div class="terminal__figlet" aria-hidden="true">
      {#each figletLines as line, i}
        <pre class="terminal__figlet-line" style="--i:{i}">{line}</pre>
      {/each}
    </div>
    <pre class="terminal__boot" style="--i: {figletLines.length + 2}"><b style="color: var(--ansi-dim)"
        >Test your bot?&nbsp;</b
      >[Y]/n<span class="cursor"></span></pre>
  </div>
  <div class="static" aria-hidden="true"></div>
</div>
