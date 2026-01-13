<script lang="ts">
  import { verification } from '../../stores/verification.ts'
  import { isMuted } from '../../stores/audio.ts'

  // xterm.js terminal should be focused after button clicks
  import { focusXterm } from '../xterm.client.ts'

  function handleRetry() {
    verification.run()
    focusXterm()
  }

  function handleCopy() {
    // copyResponse()
    console.log('copy')
    focusXterm()
  }

  function handleMute() {
    isMuted.update((val) => !val)
    focusXterm()
  }
</script>

<ul class="navbar-nav">
  <li>
    <button class="btn btn--primary" on:click={handleCopy}>
      Copy Response<span class="hidden md:inline">&nbsp;[C]</span>
    </button>
  </li>

  <li>
    <button class="btn btn--primary-outline rounded-none" on:click={handleRetry}>
      Retry<span class="hidden md:inline">&nbsp;[R]</span>
    </button>
  </li>

  <li class="hidden md:inline">
    <button class="btn btn--primary-outline" on:click={handleMute}>
      <span style={$isMuted ? 'text-decoration: line-through' : ''}>Aud</span><span class="hidden md:inline"
        >&nbsp;[M]</span
      >
    </button>
  </li>
</ul>

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
