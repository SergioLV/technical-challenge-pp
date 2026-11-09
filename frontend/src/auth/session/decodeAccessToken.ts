import type { AuthPrincipal } from '../domain/auth-principal'

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')

    if (parts.length !== 3 || !parts[1]) {
      return null
    }

    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(atob(paddedBase64)) as unknown

    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export function decodeAccessToken(token: string): AuthPrincipal | null {
  const payload = decodePayload(token)

  if (
    !payload ||
    typeof payload.sub !== 'string' ||
    typeof payload.exp !== 'number' ||
    payload.exp <= Date.now() / 1000
  ) {
    return null
  }

  if (payload.role === 'admin') {
    return {
      id: payload.sub,
      role: 'admin',
      expiresAt: payload.exp,
    }
  }

  if (
    payload.role === 'user' &&
    typeof payload.rut === 'string' &&
    payload.rut.trim()
  ) {
    return {
      id: payload.sub,
      role: 'user',
      rut: payload.rut,
      expiresAt: payload.exp,
    }
  }

  return null
}
