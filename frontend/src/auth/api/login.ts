import { environment } from '../../config/environment'
import { ApiError } from '../../shared/api/ApiError'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  expiresIn: number
}

interface LoginApiResponse {
  success: true
  token: string
  expiresIn: number
}

interface ErrorApiResponse {
  success: false
  message: string
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const response = await fetch(`${environment.apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  const body = (await response.json()) as LoginApiResponse | ErrorApiResponse

  if (!response.ok || !body.success) {
    throw new ApiError(
      response.status,
      body.success ? 'Unable to authenticate' : body.message,
    )
  }

  return {
    token: body.token,
    expiresIn: body.expiresIn,
  }
}
