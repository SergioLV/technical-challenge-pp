import { useState, type FormEvent } from 'react'
import { ApiError } from '../../shared/api/ApiError'
import { useAuth } from '../context/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      await login({ username, password })
      setSuccessMessage('Sesión iniciada correctamente')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage('Usuario o contraseña incorrectos')
      } else {
        setErrorMessage(
          'No fue posible iniciar sesión. Inténtalo nuevamente.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background)] px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[var(--color-brand)]/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 -bottom-32 h-96 w-96 rounded-full bg-[var(--color-primary-action)]/7 blur-3xl"
      />

      <section className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <a
            href="https://www2.prontopaga.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
          >
            <img
              src="/prontopaga_logo.svg"
              alt="ProntoPaga"
              className="h-8 w-auto"
            />
          </a>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_55px_rgba(36,33,36,0.08)] sm:p-8">
          <header className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase">
              Acceso seguro
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              Consulta de riesgo financiero
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Ingresa tus credenciales para consultar el score financiero por
              RUT.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[var(--color-brand)]/15"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[var(--color-brand)]/15"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-[var(--radius-input)] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-[var(--color-error)]"
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p
                role="status"
                className="rounded-[var(--radius-input)] border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-[var(--color-success)]"
              >
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-[var(--radius-input)] bg-[var(--color-primary-action)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-hover)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <aside className="mt-6 rounded-[var(--radius-input)] bg-slate-50 px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
            <p className="font-semibold text-[var(--color-text-primary)]">
              Credenciales de prueba
            </p>
            <p>Usuario: user / user123</p>
            <p>Administrador: admin / admin123</p>
          </aside>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
          Tu sesión se conserva únicamente en esta pestaña.
        </p>
      </section>
    </main>
  )
}
