import { describe, expect, it, jest } from "@jest/globals";

import { GetScoreUseCase } from "../../../src/score/application/get-score-use-case.js";
import type { Clock } from "../../../src/score/application/ports/clock.js";
import type { ScoreCalculator } from "../../../src/score/application/ports/score-calculator.js";
import { InvalidRutError } from "../../../src/score/domain/errors/invalid-rut-error.js";

const fixedDate = new Date("2025-06-27T14:35:00.000Z");

function createSubject() {
  const calculate = jest.fn<(normalizedRut: string) => number>(() => 73);
  const calculator: ScoreCalculator = { calculate };
  const clock: Clock = { now: () => fixedDate };

  return {
    calculate,
    useCase: new GetScoreUseCase(calculator, clock),
  };
}

describe("GetScoreUseCase", () => {
  it("returns the score and query date for a valid RUT", () => {
    const { calculate, useCase } = createSubject();

    const result = useCase.execute({ rut: "12.345.678-5" });

    expect(result).toEqual({
      rut: "12.345.678-5",
      score: 73,
      fecha: "2025-06-27T14:35:00.000Z",
    });
    expect(calculate).toHaveBeenCalledWith("12345678-5");
  });

  it("normalizes equivalent RUT representations before scoring", () => {
    const { calculate, useCase } = createSubject();

    const result = useCase.execute({ rut: " 12.345.678-k " });

    expect(result.rut).toBe("12.345.678-K");
    expect(calculate).toHaveBeenCalledWith("12345678-K");
  });

  it.each([
    "",
    "   ",
    "123456785",
    "12.345.678-X",
    "123456-5",
    "123456789-5",
  ])("rejects an invalid RUT: %p", (rut) => {
    const { calculate, useCase } = createSubject();

    expect(() => useCase.execute({ rut })).toThrow(InvalidRutError);
    expect(calculate).not.toHaveBeenCalled();
  });
});
