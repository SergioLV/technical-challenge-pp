export type AuthPrincipal =
  | Readonly<{
      id: string
      role: 'admin'
      expiresAt: number
    }>
  | Readonly<{
      id: string
      role: 'user'
      rut: string
      expiresAt: number
    }>
