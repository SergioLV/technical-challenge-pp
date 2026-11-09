import { UnsupportedScoringAlgorithmError } from "../application/errors/unsupported-scoring-algorithm-error.js";
import type { ScoreCalculator } from "../application/ports/score-calculator.js";
import { RollingHashScoreCalculator } from "./rolling-hash-score-calculator.js";
import { Sha256ScoreCalculator } from "./sha256-score-calculator.js";

export type ScoringAlgorithmSelection = "sha256" | "rolling-hash";

export function createScoreCalculator(selection: string): ScoreCalculator {
  if (selection === "sha256") {
    return new Sha256ScoreCalculator();
  }

  if (selection === "rolling-hash") {
    return new RollingHashScoreCalculator();
  }

  throw new UnsupportedScoringAlgorithmError(selection);
}
