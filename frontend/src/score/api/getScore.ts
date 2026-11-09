import { environment } from '../../config/environment'
import { ApiError } from '../../shared/api/ApiError'

export interface ScoreResult {
  rut: string
  score: number
  fecha: string
}

interface ErrorApiResponse {
  success: false
  message: string
}

function isScoreResult(value: unknown): value is ScoreResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.rut === 'string' &&
    typeof candidate.score === 'number' &&
    typeof candidate.fecha === 'string'
  )
}

export async function getScore(
  rut: string,
  accessToken: string,
): Promise<ScoreResult> {
  const response = await fetch(
    `${environment.apiUrl}/score/${encodeURIComponent(rut)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  const body = (await response.json()) as unknown

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as ErrorApiResponse).message === 'string'
        ? (body as ErrorApiResponse).message
        : 'Unable to retrieve score'

    throw new ApiError(response.status, message)
  }

  if (!isScoreResult(body)) {
    throw new ApiError(502, 'The API returned an invalid score response')
  }

  return body
}
