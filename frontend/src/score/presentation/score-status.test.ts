import { describe, expect, it } from 'vitest'
import { getScoreStatus } from './score-status'

describe('getScoreStatus', () => {
  it.each([
    [0, 'Ojo con este resultado'],
    [39, 'Ojo con este resultado'],
    [40, 'Vale la pena revisar'],
    [69, 'Vale la pena revisar'],
    [70, 'Se ve bien'],
    [100, 'Se ve bien'],
  ])('maps score %i to %s', (score, expectedTitle) => {
    expect(getScoreStatus(score).title).toBe(expectedTitle)
  })
})
