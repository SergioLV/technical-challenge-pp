import type { ScoreCalculator } from "../application/ports/score-calculator.js";

export class RollingHashScoreCalculator implements ScoreCalculator {
  calculate(normalizedRut: string): number {
    let hash = 0;

    for (const character of normalizedRut) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    return hash % 101;
  }
}
