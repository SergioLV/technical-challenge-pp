interface TestJwtClaims {
  sub?: string
  role: string
  rut?: string
  exp?: number
}

function encodeSegment(value: object): string {
  return btoa(JSON.stringify(value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

export function createTestJwt(claims: TestJwtClaims): string {
  const payload = {
    sub: 'test-user',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  }

  return `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment(payload)}.signature`
}
