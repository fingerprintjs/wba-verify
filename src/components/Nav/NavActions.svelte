<script lang="ts">
  import { isImportTypeAssertionContainer } from 'typescript'
  import { isMuted } from '../../stores/audio.ts'
  import { focusXterm, runTerminalCommand } from '../xterm.client.ts'

  // xterm.js terminal should be focused after button clicks
  function handleRetry() {
    runTerminalCommand('r')
    focusXterm()
  }

  function handleCopy() {
    // copyResponse()
    runTerminalCommand('c')
    focusXterm()
  }

  function handleMute() {
    isMuted.update((val) => !val)
    focusXterm()
  }
</script>

<ul class="navbar-nav navbar-nav--no-js">
  <li>
    <button class="btn btn--primary" onclick={handleCopy}>
      Copy Response<span class="hidden md:inline">&nbsp;[C]</span>
    </button>
  </li>

  <li>
    <button class="btn btn--primary-outline rounded-none" onclick={handleRetry}>
      Retry<span class="hidden md:inline">&nbsp;[R]</span>
    </button>
  </li>

  <li class="hidden md:inline">
    <button class="btn btn--primary-outline" onclick={handleMute}>
      <span style={$isMuted ? 'text-decoration: line-through' : ''}>Aud</span><span class="hidden md:inline"
        >&nbsp;[M]</span
      >
    </button>
  </li>
</ul>

<noscript>
  <style>
    .navbar-nav--no-js {
      display: none !important;
    }
  </style>
</noscript>

<style>
  .navbar-nav {
    list-style: none;
    display: flex;
    flex-direction: row;
    gap: 2px;
  }

  li:focus-within {
    z-index: 1;
  }

  li:first-of-type .btn {
    border-radius: 2px 0 0 2px;
  }
  li:last-of-type .btn {
    border-radius: 0 2px 2px 0;
  }
</style>
