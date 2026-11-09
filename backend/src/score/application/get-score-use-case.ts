import { createRut } from "../domain/rut.js";
import type { Clock } from "./ports/clock.js";
import type { ScoreCalculator } from "./ports/score-calculator.js";

export interface GetScoreQuery {
  rut: string;
}

export interface GetScoreResult {
  rut: string;
  score: number;
  fecha: string;
}

export class GetScoreUseCase {
  constructor(
    private readonly calculator: ScoreCalculator,
    private readonly clock: Clock,
  ) {}

  execute(query: GetScoreQuery): GetScoreResult {
    const rut = createRut(query.rut);

    return {
      rut: rut.formatted,
      score: this.calculator.calculate(rut.normalized),
      fecha: this.clock.now().toISOString(),
    };
  }
}
