/**
 * Minimal JWT payload reader. The signature is never checked here — the server
 * is the only authority on validity. This exists purely so the UI can show who
 * is logged in without an extra round trip.
 */
export type JwtPayload = {
  sub: string
  role: string
  exp: number
}

export function decodeJwt(token: string): JwtPayload | null {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims: unknown = JSON.parse(json)
    if (
      typeof claims !== 'object' ||
      claims === null ||
      typeof (claims as JwtPayload).sub !== 'string'
    ) {
      return null
    }
    return claims as JwtPayload
  } catch {
    return null
  }
}
