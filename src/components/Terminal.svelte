<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { verification } from '../stores/verification'
  import { CURL_ENDPOINT_URL, mountXterm, unmountXterm } from './xterm.client'

  import { spinnerEl, type Spinner } from './spinner'

  // Figlet banner
  const FIGLET =
    '██╗    ██╗██████╗  █████╗ ██╗   ██╗\n██║    ██║██╔══██╗██╔══██╗██║   ██║\n██║ █╗ ██║██████╔╝███████║██║   ██║\n██║███╗██║██╔══██╗██╔══██║╚██╗ ██╔╝\n╚███╔███╔╝██████╔╝██║  ██║ ╚████╔╝ \n ╚══╝╚══╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  \n WEB BOT AUTH VERIFICATION v0.0.1'
  const figletLines = FIGLET.split('\n').map((line) => (line.length === 0 ? '\u00A0' : line))

  // Create loading spinner and xterm.js terminal
  let bootLoader: HTMLElement
  let spinner: Spinner | null = null

  let xtermEl: HTMLDivElement
  let xtermMounted = false

  $: if (xtermEl && !xtermMounted) {
    mountXterm(xtermEl)
    xtermMounted = true
  }

  // Status text
  type StatusText = [string, string]

  let lastStatusText: StatusText | null = null

  $: statusText = (() => {
    const next: StatusText | null =
      $verification.status === 'success'
        ? ['Verification Successful', 'Your bot is signed']
        : $verification.status === 'error'
          ? ['Verification Failed', 'Your bot is not signed']
          : null

    if (next) lastStatusText = next
    return $verification.status === 'pending' ? lastStatusText : next
  })()

  $: statusLine = statusText
    ? `${statusText[0]} ${'/'.repeat(Math.max(0, 50 - statusText[0].length))} ` +
      `${statusText[1]} ${'/'.repeat(Math.max(0, 50 - statusText[1].length))}`
    : ''

  // API response text
  $: apiText = $verification?.raw
    ? JSON.stringify($verification.raw, null, 2)
    : "// No response. Type 'r' in the CLI to run the test."

  // Clock
  let eightiesDate = new Date()

  function calculateEightiesDate() {
    const now = new Date()
    const eightiesYear = 1980 + (now.getFullYear() % 10)

    now.setFullYear(eightiesYear)
    eightiesDate = now
  }

  // Lifecycle
  let hasBooted = false

  $: {
    if (!hasBooted && ($verification.status === 'success' || $verification.status === 'error')) {
      hasBooted = true
    }
  }

  onMount(() => {
    spinner = spinnerEl(bootLoader, 'VERIFYING BOT...')
    verification.run(CURL_ENDPOINT_URL)
    calculateEightiesDate()
  })

  onDestroy(() => {
    spinner?.stop()
    unmountXterm()
  })
</script>

<div class="terminal">
  <div class="terminal__inner">
    <!-- Banner -->
    <div class="terminal__figlet">
      {#each figletLines as line, i}
        <pre class="figlet__line" style="--i:{i}" aria-hidden="true">{line}</pre>
      {/each}
    </div>

    <!-- Meta details -->
    <pre class="terminal__meta">
        <code style="--i:1">WBAV / FINGERPRINTJS INC.</code>
        <code style="--i:2">(c) 1986 </code>
        <code>&nbsp;</code>
        <code>&nbsp;</code>
        <code>&nbsp;</code>
        <code style="--i:3">Real cryptographic verification for Web Bot Auth </code>
        <code style="--i:4"
        >using <a href="https://datatracker.ietf.org/doc/html/rfc9421" target="_blank">RFC 9421</a
        > HTTP Message Signatures </code>
      </pre>

    <!-- Loading text -->
    {#if !hasBooted}
      <pre class="terminal__boot" bind:this={bootLoader}></pre>
    {/if}

    {#if hasBooted}
      <!-- Verification status -->
      {#if $verification.status !== 'idle'}
        <div class="terminal__status">
          <div class="terminal__status-inner">
            <div class="terminal__status-marquee">
              <pre style:opacity={$verification.status === 'pending' ? '0.5' : ''}>{statusLine}</pre>
              <pre style:opacity={$verification.status === 'pending' ? '0.5' : ''}>{statusLine}</pre>
              <pre style:opacity={$verification.status === 'pending' ? '0.5' : ''}>{statusLine}</pre>
              <pre style:opacity={$verification.status === 'pending' ? '0.5' : ''}>{statusLine}</pre>
            </div>
          </div>
        </div>
      {/if}
    {/if}

    <!-- API response -->
    {#if hasBooted}
      <div class="terminal__response">
        <!-- Human-readable message -->
        <div class="terminal__pane terminal__response-human">
          <pre class="terminal__pane-title">[cli]</pre>
          <!-- Render xterm on screens larger than 1024px -->
          <div id="xterm" class="prose" bind:this={xtermEl}></div>
          <!-- On screens less than 1024px wide, render a simple text and buttons -->
          <!-- <div class="prose overflow-y-auto overscroll-contain custom-scrollbar lg:hidden">
              <pre style:opacity={$verification.status === 'pending' ? '0.5' : ''}>{apiText}</pre>
            </div> -->
        </div>

        <!-- Bot-friendly raw response -->
        {#if $verification.status !== 'idle'}
          <div class="terminal__pane terminal__response-bot">
            <div class="terminal__bot-text custom-scrollbar-container">
              <pre class="terminal__pane-title">[apiResponse]</pre>
              <div class="prose overflow-y-auto overscroll-contain custom-scrollbar">
                <pre style:opacity={$verification.status === 'pending' ? '0.5' : ''}>{apiText}</pre>
              </div>
            </div>
          </div>
        {/if}
      </div>
      <!-- Terminal commands -->
      <ul class="terminal__commands">
        <li><pre>[c] Copy Response</pre></li>
        <li class="hidden md:inline"><pre>[r] Retry</pre></li>
        <li><pre>[help] List Commands</pre></li>
        <li class="hidden md:inline ml-auto"><pre>{eightiesDate.toDateString()}</pre></li>
      </ul>
    {/if}
  </div>
  <!-- Static effect -->
  <div class="static" aria-hidden="true"></div>
</div>

<style>
  /* TERMINAL CONTAINER */
  .terminal {
    --padding: 3px;
    --border-radius: 13px;
    position: relative;
    overflow: hidden;
    width: 100%;
    min-height: 576px;
    height: 100%;
    padding: var(--padding);
    background-color: black;
    border-radius: var(--border-radius);
    box-shadow: 0 1px 0 white;
  }

  .terminal__inner::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(var(--terminal__inner-bg) 80%, transparent),
      linear-gradient(to bottom, rgb(255 255 255 / 0%), rgb(255 255 255 / 5%) 50%, rgb(0 0 0 / 5%) 70%, rgb(0 0 0 / 5%));
    border: 0.5px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
    background-size:
      100%,
      100% 4px;
    /* animation: scanlines 1s linear 0s infinite normal none running; */
  }

  @keyframes scanlines {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(4px);
    }
  }

  /* TERMINAL SCREEN */
  .terminal__inner {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px 12px;
    border-radius: calc(var(--border-radius) - var(--padding));
    box-shadow:
      inset 0px -1px 4px rgba(255, 255, 255, 0.2),
      inset 0px 1px 4px rgba(255, 255, 255, 0.1);
  }

  /* TERMINAL VERIFICATION STATUS */
  .terminal__status {
    margin-bottom: 16px;
    border: 1px solid var(--ansi-red);
    box-shadow:
      inset 0 0 1px 0 var(--ansi-red),
      0 0 1px 0 var(--ansi-red);
  }
  .terminal__status-inner {
    display: inherit;
    overflow-x: hidden;
    padding: 8px;
  }

  .terminal__status-marquee {
    overflow-x: hidden;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
  }

  .terminal__status-marquee pre {
    color: var(--ansi-red);
    text-shadow: 0 0px 6px var(--ansi-red);
  }

  /* TERMINAL PANES */
  .terminal__pane {
    box-shadow:
      inset 0 0 1px 0 var(--terminal-text-shadow),
      0 0 1px 0 var(--terminal-text-shadow);
  }

  .terminal__pane-title {
    margin-top: -18px;
    background-color: var(--terminal-pane-title-bg);
    align-self: start;
    user-select: none;
  }

  .terminal__response {
    display: grid;
    grid-template: 100% / 7fr 4fr;
    height: 100%;
    min-height: 0;
    gap: 8px;
  }

  .terminal__response-human,
  .terminal__response-bot {
    position: relative;
    flex-basis: 0;
    flex-grow: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    border: 1px solid var(--terminal-text-primary);
  }

  .terminal__response-bot {
    padding: 0;
  }

  .terminal__bot-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    padding: 8px;
  }

  .terminal .terminal__bot-text pre {
    white-space: pre-wrap;
  }

  .terminal__commands {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    margin-top: 8px;
    padding: 0 6px;
    user-select: none;
  }

  .terminal__commands pre {
    color: var(--ansi-dim);
  }

  /* TERMINAL TEXT */
  .terminal .terminal__figlet,
  .terminal .terminal__meta {
    color: var(--terminal-text-primary);
    font-family: monospace;
    font-size: 14px;
    white-space: pre;
    margin-bottom: 12px;
  }

  .terminal__meta {
    position: absolute;
    top: 12px;
    right: 11px;
    text-align: right;
  }

  pre {
    color: var(--terminal-text-primary);
    line-height: normal;
    letter-spacing: -0.025em;
    font-size: 14px;
    font-family: var(--terminal-font-family);
  }

  .prose pre {
    margin: 0;
  }

  /* VERIFICATION STATUS MARQUEE */
  .terminal__status-marquee pre {
    animation: marquee 30s steps(180) infinite;
  }

  @keyframes marquee {
    from {
      transform: translate(0);
    }
    to {
      transform: translate(-100%);
    }
  }

  /* BLOOM EFFECT */
  #xterm,
  pre {
    text-shadow: 0 0px 6px var(--terminal-text-shadow);
  }

  /*
  LOW-RES EFFECT
  Target direct children instead of entire terminal to save on GPU memory
  */
  .terminal__figlet,
  .terminal__boot,
  .terminal__status,
  .terminal__meta,
  .terminal__response,
  .terminal__commands {
    filter: blur(0.3px);
  }

  /* STATIC EFFECT */

  .static {
    position: absolute;
    inset: var(--padding);
    z-index: 1;
    pointer-events: none;
    opacity: 0.13;
    background-image: url('../assets/images/static.jpg');
    background-size: 128px 128px;
    border-radius: calc(var(--border-radius) - var(--padding));
    animation: static 500ms steps(1) infinite;
  }

  @keyframes static {
    0% {
      background-position: 40px 0px;
    }

    10% {
      background-position: 0px 40px;
    }

    20% {
      background-position: 24px 12px;
    }

    30% {
      background-position: 2px 48px;
    }

    40% {
      background-position: 2px 12px;
    }

    50% {
      background-position: 12px 80px;
    }

    60% {
      background-position: 80px 12px;
    }

    70% {
      background-position: 24px 48px;
    }

    80% {
      background-position: 72px 8px;
    }

    90% {
      background-position: 80px 12px;
    }

    100% {
      background-position: 40px 4px;
    }
  }

  /* XTERM */
  #xterm {
    min-height: 0;
    height: 100%;
  }

  /*
  prevent removal of unused CSS selectors,
  xterm markup is generated client-side
  https://github.com/sveltejs/svelte/issues/5804
  */
  :global(.xterm .xterm-scrollable-element > .invisible.fade, .xterm .xterm-scrollable-element > .visible) {
    transition: none;
  }

  /* ANIMATIONS */
  .figlet__line {
    opacity: 0;
    animation: flicker 100ms var(--ease-flicker) forwards;
    animation-delay: calc(25ms * var(--i));
  }

  .terminal__status,
  .terminal__response,
  .terminal__commands {
    opacity: 0;
    animation: flicker 150ms var(--ease-flicker) forwards;
    animation-delay: var(--delay, 75ms);
  }

  .terminal__response {
    --delay: 250ms;
  }
  .terminal__commands {
    --delay: 350ms;
  }

  .terminal__meta code {
    opacity: 0;
    animation: fadeIn 150ms steps(1, start) forwards;
    animation-delay: calc(350ms + 75ms * var(--i));
  }

  /* MISC */
  .terminal a {
    color: var(--terminal-text-primary);
    text-decoration: underline;
    text-decoration-style: dashed;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }

  ::selection {
    background: var(--terminal-selection-bg);
    color: var(--terminal-selection-color);
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .terminal__meta {
      display: none;
    }
  }
  @media (max-width: 1024px) {
    .terminal {
      height: 100dvh;
    }

    .terminal__response {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .terminal__pane {
      flex: 1;
      min-height: 0;
    }
  }
</style>
