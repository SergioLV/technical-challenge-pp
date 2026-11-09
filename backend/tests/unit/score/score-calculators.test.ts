import { describe, expect, it } from "@jest/globals";

import { UnsupportedScoringAlgorithmError } from "../../../src/score/application/errors/unsupported-scoring-algorithm-error.js";
import type { ScoreCalculator } from "../../../src/score/application/ports/score-calculator.js";
import { createScoreCalculator } from "../../../src/score/infrastructure/create-score-calculator.js";
import { RollingHashScoreCalculator } from "../../../src/score/infrastructure/rolling-hash-score-calculator.js";
import { Sha256ScoreCalculator } from "../../../src/score/infrastructure/sha256-score-calculator.js";

const algorithms: ReadonlyArray<[string, () => ScoreCalculator]> = [
  ["sha256", () => new Sha256ScoreCalculator()],
  ["rolling-hash", () => new RollingHashScoreCalculator()],
];

describe.each(algorithms)("%s score calculator", (_name, createCalculator) => {
  it("returns the same score for the same normalized RUT", () => {
    const first = createCalculator().calculate("12345678-5");
    const second = createCalculator().calculate("12345678-5");

    expect(second).toBe(first);
  });

  it("returns a score between 0 and 100", () => {
    const score = createCalculator().calculate("12345678-5");

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("varies between different RUTs", () => {
    const calculator = createCalculator();

    expect(calculator.calculate("12345678-5")).not.toBe(
      calculator.calculate("98765432-1"),
    );
  });
});

describe("createScoreCalculator", () => {
  it("selects the configured algorithm", () => {
    expect(createScoreCalculator("sha256")).toBeInstanceOf(
      Sha256ScoreCalculator,
    );
    expect(createScoreCalculator("rolling-hash")).toBeInstanceOf(
      RollingHashScoreCalculator,
    );
  });

  it("rejects an unsupported algorithm", () => {
    expect(() => createScoreCalculator("random")).toThrow(
      UnsupportedScoringAlgorithmError,
    );
  });
});
