import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '../../auth/context/AuthProvider'
import { createTestJwt } from '../../test/createTestJwt'
import { ScorePage } from './ScorePage'

function renderScorePage(token: string) {
  sessionStorage.setItem('accessToken', token)

  return render(
    <MemoryRouter>
      <AuthProvider>
        <ScorePage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ScorePage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('allows an admin to query any RUT and displays its score', async () => {
    const token = createTestJwt({ role: 'admin' })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          rut: '98.765.432-1',
          score: 73,
          fecha: '2025-06-27T14:35:00.000Z',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderScorePage(token)

    const rutInput = screen.getByLabelText('RUT a consultar')

    expect(
      screen.getByText(/Formato: 7 u 8 dígitos, guion y dígito verificador/),
    ).toBeInTheDocument()
    await user.type(rutInput, '98.765.432-1')
    await user.click(screen.getByRole('button', { name: 'Consultar score' }))

    expect(await screen.findByText('73')).toBeInTheDocument()
    expect(screen.getByText('98.765.432-1')).toBeInTheDocument()
    expect(screen.getByText('Se ve bien')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '73',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/score/98.765.432-1',
      expect.objectContaining({
        headers: { Authorization: `Bearer ${token}` },
      }),
    )
  })

  it('restricts a user to the RUT contained in their token', async () => {
    const token = createTestJwt({ role: 'user', rut: '12345678-5' })
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            rut: '12.345.678-5',
            score: 55,
            fecha: '2025-06-27T14:35:00.000Z',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )
    renderScorePage(token)

    const rutInput = screen.getByLabelText('Tu RUT')

    expect(rutInput).toHaveValue('12345678-5')
    expect(rutInput).toHaveAttribute('readonly')
  })

  it('clears the session when the backend rejects the token', async () => {
    const token = createTestJwt({ role: 'admin' })
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid or expired token',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )
    const user = userEvent.setup()
    renderScorePage(token)

    await user.type(screen.getByLabelText('RUT a consultar'), '12345678-5')
    await user.click(screen.getByRole('button', { name: 'Consultar score' }))

    await waitFor(() => {
      expect(sessionStorage.getItem('accessToken')).toBeNull()
    })
  })
})
