// URLs
export const GITHUB_REPO_URL = 'https://github.com/fingerprintjs/wba-verify'
export const WBA_SPEC_URL = 'https://datatracker.ietf.org/wg/webbotauth/about/'

// Figlet banner for terminal
export const FIGLET =
  '██╗    ██╗██████╗  █████╗ ██╗   ██╗\n██║    ██║██╔══██╗██╔══██╗██║   ██║\n██║ █╗ ██║██████╔╝███████║██║   ██║\n██║███╗██║██╔══██╗██╔══██║╚██╗ ██╔╝\n╚███╔███╔╝██████╔╝██║  ██║ ╚████╔╝ \n ╚══╝╚══╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  \n WEB BOT AUTH VERIFICATION v0.0.1'

// Error messages for WBAV test
export const WBAV_ERROR_MESSAGES: Record<string, string> = {
  MISSING_SIGNATURE_HEADERS: 'Missing required signature headers: Signature, Signature-Input, and Signature-Agent.',
  INVALID_SIGNATURE_AGENT: 'Signature-Agent header is malformed or invalid (must be an HTTPS root domain).',
  SIGNATURE_EXPIRED: 'Signature has expired (current time is past the expires parameter).',
  SIGNATURE_TOO_OLD: 'Signature created timestamp is too old (created more than 1 hour ago).',
  SIGNATURE_TIMESTAMP_FUTURE: 'Signature created timestamp is too far in the future (more than 5 minutes ahead).',
  KEY_DIRECTORY_FETCH_FAILED: 'Failed to fetch the key directory from the Signature-Agent URL.',
  KEY_EXPIRED: "JWK has expired (current time is past the key's exp field).",
  KEY_NOT_YET_VALID: "JWK is not yet valid (current time is before the key's nbf field).",
  KEY_NOT_FOUND: 'No matching key found in the directory for the provided keyid.',
  VERIFICATION_FAILED: 'Cryptographic signature verification failed.',
  VALIDATION_FAILED: 'Generic validation failure (catch-all).',
  INTERNAL_ERROR: 'Internal server error.',
}
