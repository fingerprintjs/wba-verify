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
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="hidden md:inline"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18 22H6V20H18V22ZM6 20H4V6H6V20ZM20 20H18V6H20V20ZM14 6V4H10V6H14ZM16 8H8V6H6V4H8V2H16V4H18V6H16V8Z"
          fill="currentColor"
        />
      </svg>
      Copy Response<span class="hidden md:inline">&nbsp;[C]</span>
    </button>
  </li>

  <li>
    <button class="btn btn--primary-outline rounded-none" onclick={handleRetry}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="hidden md:inline"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18 20H12V18H18V20ZM20 18H18V16H20V18ZM8 12H10V14H8V16H6V14H4V12H6V8H8V12ZM22 16H20V8H22V16ZM4 12H2V10H4V12ZM12 12H10V10H12V12ZM10 8H8V6H10V8ZM20 8H18V6H20V8ZM18 6H10V4H18V6Z"
          fill="currentColor"
        />
      </svg>
      Retry<span class="hidden md:inline">&nbsp;[R]</span>
    </button>
  </li>

  <li class="hidden md:inline">
    <button class="btn btn--primary-outline" onclick={handleMute}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="hidden md:inline"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d={$isMuted
            ? 'M14 22H10V20H12V4H10V2H14V22ZM10 20H8V18H10V20ZM8 18H6V16H8V18ZM6 16H2V8H6V10H4V14H6V16ZM18 15H16V13H18V15ZM22 15H20V13H22V15ZM20 13H18V11H20V13ZM18 11H16V9H18V11ZM22 11H20V9H22V11ZM8 8H6V6H8V8ZM10 6H8V4H10V6Z'
            : 'M14 22H10V20H12V4H10V2H14V22ZM22 21H20V19H22V21ZM10 20H8V18H10V20ZM20 19H18V17H20V19ZM8 18H6V16H8V18ZM18 17H16V15H18V17ZM6 16H2V8H6V10H4V14H6V16ZM18 13H16V11H18V13ZM22 13H20V11H22V13ZM18 9H16V7H18V9ZM8 8H6V6H8V8ZM20 7H18V5H20V7ZM10 6H8V4H10V6ZM22 5H20V3H22V5Z'}
          fill="currentColor"
        />
      </svg>
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
