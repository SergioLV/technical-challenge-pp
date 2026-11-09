const defaultApiUrl = 'http://localhost:3000'

export const environment = {
  apiUrl: (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/$/, ''),
} as const
