import { useState, type ReactNode } from 'react'
import {
  login as requestLogin,
  type LoginCredentials,
} from '../api/login'
import type { AuthPrincipal } from '../domain/auth-principal'
import { decodeAccessToken } from '../session/decodeAccessToken'
import { AuthContext } from './auth-context'

const accessTokenKey = 'accessToken'

interface AuthSession {
  accessToken: string
  principal: AuthPrincipal
}

function readStoredSession(): AuthSession | null {
  const accessToken = sessionStorage.getItem(accessTokenKey)

  if (!accessToken) {
    return null
  }

  const principal = decodeAccessToken(accessToken)

  if (!principal) {
    sessionStorage.removeItem(accessTokenKey)
    return null
  }

  return { accessToken, principal }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession)

  async function login(credentials: LoginCredentials): Promise<void> {
    const result = await requestLogin(credentials)
    const principal = decodeAccessToken(result.token)

    if (!principal) {
      throw new Error('The API returned an invalid access token')
    }

    sessionStorage.setItem(accessTokenKey, result.token)
    setSession({ accessToken: result.token, principal })
  }

  function logout(): void {
    sessionStorage.removeItem(accessTokenKey)
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken: session?.accessToken ?? null,
        principal: session?.principal ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
