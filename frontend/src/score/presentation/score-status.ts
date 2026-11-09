export interface ScoreStatus {
  emoji: string
  title: string
  message: string
  containerClassName: string
  titleClassName: string
  progressClassName: string
}

const lowScoreStatus: ScoreStatus = {
  emoji: '👀',
  title: 'Ojo con este resultado',
  message: 'El score es bajo. Revisa más antecedentes antes de avanzar.',
  containerClassName: 'border-red-200 bg-red-50',
  titleClassName: 'text-[var(--color-error)]',
  progressClassName: 'bg-[var(--color-error)]',
}

const mediumScoreStatus: ScoreStatus = {
  emoji: '⚠️',
  title: 'Vale la pena revisar',
  message: 'El score está a mitad de camino. Revisa un poco más antes de decidir.',
  containerClassName: 'border-amber-200 bg-amber-50',
  titleClassName: 'text-[var(--color-warning)]',
  progressClassName: 'bg-[var(--color-warning)]',
}

const healthyScoreStatus: ScoreStatus = {
  emoji: '✅',
  title: 'Se ve bien',
  message: 'El score está en un rango favorable.',
  containerClassName: 'border-green-200 bg-green-50',
  titleClassName: 'text-[var(--color-success)]',
  progressClassName: 'bg-[var(--color-success)]',
}

export function getScoreStatus(score: number): ScoreStatus {
  if (score < 40) {
    return lowScoreStatus
  }

  if (score < 70) {
    return mediumScoreStatus
  }

  return healthyScoreStatus
}
