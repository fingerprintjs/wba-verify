// Outputs: /api/mock.json
export function GET({ params, request }) {
  return new Response(
    JSON.stringify({
      status: 'error',
      errors: [
        {
          code: 'MISSING_SIGNATURE_HEADERS',
          message:
            'Required Web Bot Auth headers are missing.\n\nEvery request must include Signature, Signature-Input, and Signature-Agent.\n\nIf you are seeing this message while visiting the page in a regular browser,\nthat is expected. This page is meant to be accessed by a bot, not a human.\n\nTo test as a human, open this page using https://chatgpt.com/?hints=agent\nor send a request manually using curl or your bot code.',
        },
      ],
      headers: {
        'Content-Type': 'application/json',
      },
    })
  )
}
