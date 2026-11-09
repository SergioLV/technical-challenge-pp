import { useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/context/useAuth'
import { ApiError } from '../../shared/api/ApiError'
import { getScore, type ScoreResult } from '../api/getScore'
import { getScoreStatus } from '../presentation/score-status'

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatQueryDate(value: string): string {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

export function ScorePage() {
  const { accessToken, principal, logout } = useAuth()
  const [rut, setRut] = useState(principal?.role === 'user' ? principal.rut : '')
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scoreStatus = result ? getScoreStatus(result.score) : null

  if (!accessToken || !principal) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!accessToken) {
      return
    }

    setErrorMessage(null)
    setIsLoading(true)

    try {
      const score = await getScore(rut.trim(), accessToken)
      setResult(score)
    } catch (error) {
      setResult(null)

      if (error instanceof ApiError && error.status === 401) {
        logout()
        return
      }

      if (error instanceof ApiError && error.status === 403) {
        setErrorMessage('No tienes permisos para consultar este RUT.')
      } else if (error instanceof ApiError && error.status === 400) {
        setErrorMessage('El RUT ingresado no es válido.')
      } else {
        setErrorMessage(
          'No fue posible consultar el score. Inténtalo nuevamente.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="https://www2.prontopaga.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
          >
            <img
              src="/prontopaga_logo.svg"
              alt="ProntoPaga"
              className="h-7 w-auto sm:h-8"
            />
          </a>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-[var(--color-primary-action)] sm:inline-flex">
              {principal.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-brand)] hover:text-[var(--color-primary-action)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase">
            Riesgo financiero
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            Consulta de score
          </h1>
          <p className="mt-3 leading-7 text-[var(--color-text-secondary)]">
            {principal.role === 'admin'
              ? 'Consulta el score financiero asociado a cualquier RUT.'
              : 'Consulta el score financiero asociado a tu RUT.'}
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_16px_45px_rgba(36,33,36,0.06)] sm:p-8">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Datos de consulta
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              El resultado siempre será el mismo para un RUT específico.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="rut"
                  className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
                >
                  {principal.role === 'user' ? 'Tu RUT' : 'RUT a consultar'}
                </label>
                <input
                  id="rut"
                  name="rut"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  required
                  readOnly={principal.role === 'user'}
                  aria-describedby={
                    principal.role === 'user'
                      ? 'rut-security-help'
                      : 'rut-format-help'
                  }
                  value={rut}
                  onChange={(event) => setRut(event.target.value)}
                  placeholder="12.345.678-5"
                  className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3.5 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[var(--color-brand)]/15 read-only:cursor-not-allowed read-only:bg-slate-50 read-only:text-[var(--color-text-secondary)]"
                />
                {principal.role === 'user' ? (
                  <p
                    id="rut-security-help"
                    className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]"
                  >
                    Por seguridad, solo puedes consultar el RUT asociado a tu
                    sesión.
                  </p>
                ) : (
                  <p
                    id="rut-format-help"
                    className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]"
                  >
                    Formato: 7 u 8 dígitos, guion y dígito verificador (número o
                    K). Los puntos son opcionales. Ej.: 12.345.678-5.
                  </p>
                )}
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-input)] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-[var(--color-error)]"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer rounded-[var(--radius-input)] bg-[var(--color-primary-action)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-hover)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Consultando…' : 'Consultar score'}
              </button>
            </form>
          </section>

          <section
            aria-live="polite"
            className="h-[34rem] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_16px_45px_rgba(36,33,36,0.06)] sm:p-8"
          >
            {result && scoreStatus ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                      RUT consultado
                    </p>
                    <p className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">
                      {result.rut}
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                    Consulta completada
                  </span>
                </div>

                <div className="py-8 text-center">
                  <p className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
                    Score financiero
                  </p>
                  <div className="mt-3 flex items-end justify-center gap-2">
                    <output className="text-6xl font-bold tracking-tight text-[var(--color-primary-action)] sm:text-7xl">
                      {result.score}
                    </output>
                    <span className="mb-2 text-lg font-medium text-[var(--color-text-secondary)]">
                      / 100
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label="Score financiero"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={result.score}
                    className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${scoreStatus.progressClassName}`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>

                  <div
                    className={`mt-6 flex items-start gap-3 rounded-[var(--radius-input)] border p-4 text-left ${scoreStatus.containerClassName}`}
                  >
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {scoreStatus.emoji}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-bold ${scoreStatus.titleClassName}`}
                      >
                        {scoreStatus.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                        {scoreStatus.message}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                    Úsalo como referencia, no como una decisión final.
                  </p>
                </div>

                <p className="mt-auto border-t border-[var(--color-border)] pt-5 text-center text-sm text-[var(--color-text-secondary)]">
                  Consultado el {formatQueryDate(result.fecha)}
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-lg font-bold text-[var(--color-primary-action)]">
                  0–100
                </div>
                <h2 className="mt-5 text-lg font-bold text-[var(--color-text-primary)]">
                  Tu resultado aparecerá aquí
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
                  Ingresa un RUT y realiza la consulta para obtener su score
                  financiero.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
