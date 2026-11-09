import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { createTestJwt } from '../../test/createTestJwt'
import { AuthProvider } from '../context/AuthProvider'
import { LoginPage } from './LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the login form', () => {
    renderLoginPage()

    expect(
      screen.getByRole('heading', { name: 'Consulta de riesgo financiero' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('authenticates and stores the access token', async () => {
    const token = createTestJwt({ role: 'user', rut: '12345678-5' })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          token,
          expiresIn: 3600,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Usuario'), 'user')
    await user.type(screen.getByLabelText('Contraseña'), 'user123')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(sessionStorage.getItem('accessToken')).toBe(token)
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'user', password: 'user123' }),
      }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sesión iniciada correctamente',
    )
  })

  it('shows a clear message for invalid credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, message: 'Invalid credentials' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Usuario'), 'user')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Usuario o contraseña incorrectos',
    )
    expect(sessionStorage.getItem('accessToken')).toBeNull()
  })
})
