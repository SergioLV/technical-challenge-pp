import { createContext } from 'react'
import type { LoginCredentials } from '../api/login'
import type { AuthPrincipal } from '../domain/auth-principal'

export interface AuthContextValue {
  accessToken: string | null
  principal: AuthPrincipal | null
  login(credentials: LoginCredentials): Promise<void>
  logout(): void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
