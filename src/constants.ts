// API endpoints
export const CURL_ENDPOINT_URL = 'https://webbotauth-api.fpjs.io/api/verify'

// URLs
export const FINGERPRINT_DASHBOARD_ROOT = 'https://dashboard.fingerprint.com'
export const SUBMIT_BOT_URL = `${FINGERPRINT_DASHBOARD_ROOT}/submit-bot`

export const GITHUB_REPO_URL = 'https://github.com/fingerprintjs/wba-verify'
export const WBA_SPEC_URL = 'https://datatracker.ietf.org/wg/webbotauth/about/'

type WBAVMessage = {
  title: string
  body: string
}

export const WBAV_MESSAGES: Record<string, WBAVMessage> = {
  SUCCESS: {
    title: 'SUCCESS: 200',
    body: 'Your Web Bot Auth signature was successfully verified!\n\nThe request was properly signed, the key is valid, and everything checks out.\n\nNo action needed; your implementation is correct. You can use the same signing logic in production.',
  },

  MISSING_SIGNATURE_HEADERS: {
    title: 'MISSING_SIGNATURE_HEADERS: 400',
    body: 'Required Web Bot Auth headers are missing.\n\nEvery request must include Signature, Signature-Input, and Signature-Agent.\n\nIf you are seeing this message while visiting the page in a regular browser, that is expected. This page is meant to be accessed by a bot, not a human. Try in ChatGPT Agent mode or sign your requests programmatically.',
  },

  INVALID_SIGNATURE_AGENT: {
    title: 'INVALID_SIGNATURE_AGENT: 400',
    body: 'Signature-Agent header is malformed or invalid.\n\nThis header must contain a quoted HTTPS URL pointing to your public key directory. Validation will fail if the scheme is missing, HTTP is used, or the value is not enclosed in double quotes.',
  },

  SIGNATURE_EXPIRED: {
    title: 'SIGNATURE_EXPIRED: 400',
    body: 'Signature has expired.\n\nThe expires parameter in Signature-Input is in the past. Signatures should be generated shortly before sending to prevent replay attacks. A short expiry (around one minute) is recommended.',
  },

  SIGNATURE_TOO_OLD: {
    title: 'SIGNATURE_TOO_OLD: 400',
    body: 'Signature created timestamp is too old.\n\nThe created timestamp indicates the signature was generated over an hour ago. Always generate signatures immediately before sending and ensure your system clock is accurate.',
  },

  SIGNATURE_TIMESTAMP_FUTURE: {
    title: 'SIGNATURE_TIMESTAMP_FUTURE: 400',
    body: 'Signature created timestamp is too far in the future.\n\nThis is usually caused by clock drift. Ensure your system time is synchronized and regenerate the signature using the current time.',
  },

  KEY_DIRECTORY_FETCH_FAILED: {
    title: 'KEY_DIRECTORY_FETCH_FAILED: 400',
    body: 'Failed to fetch key directory from the Signature-Agent URL.\n\nThe directory must be publicly reachable over HTTPS at /.well-known/http-message-signatures-directory and return a valid JSON Web Key Set.',
  },

  KEY_EXPIRED: {
    title: 'KEY_EXPIRED: 400',
    body: 'JSON Web Key has expired.\n\nThe key includes an exp value that is in the past. Rotate your key pair, update the directory, and sign again with the new key.',
  },

  KEY_NOT_YET_VALID: {
    title: 'KEY_NOT_YET_VALID: 400',
    body: 'JSON Web Key is not yet valid.\n\nThe nbf value is set in the future. Wait until the key becomes valid or update the directory with a correct not-before time.',
  },

  KEY_NOT_FOUND: {
    title: 'KEY_NOT_FOUND: 400',
    body: 'No matching key found in the directory for the provided keyid.\n\nEnsure the key directory contains a key with the exact same identifier and that it has not been rotated or mistyped.',
  },

  VERIFICATION_FAILED: {
    title: 'VERIFICATION_FAILED: 400',
    body: 'Cryptographic signature verification failed.\n\nEnsure you are signing the final request with the correct key and components listed in Signature-Input. Changes after signing will invalidate the signature.',
  },

  VALIDATION_FAILED: {
    title: 'VALIDATION_FAILED: 400',
    body: 'Generic validation failure.\n\nOne or more checks failed. Review required headers, timestamps, and signed components, then retry with a freshly generated signature.',
  },

  INTERNAL_ERROR: {
    title: 'INTERNAL_ERROR: 500',
    body: 'Internal server error.\n\nAn unexpected error occurred while processing the request. The payload may still be valid; please try again later.',
  },
}

// Misc
export const VERSION = '1.0.0'
export const FIGLET = `██╗    ██╗██████╗  █████╗ ██╗   ██╗\n██║    ██║██╔══██╗██╔══██╗██║   ██║\n██║ █╗ ██║██████╔╝███████║██║   ██║\n██║███╗██║██╔══██╗██╔══██║╚██╗ ██╔╝\n╚███╔███╔╝██████╔╝██║  ██║ ╚████╔╝ \n ╚══╝╚══╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  \n WEB BOT AUTH VERIFICATION v${VERSION}`
