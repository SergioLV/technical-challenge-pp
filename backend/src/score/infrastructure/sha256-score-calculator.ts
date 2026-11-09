import { createHash } from "node:crypto";

import type { ScoreCalculator } from "../application/ports/score-calculator.js";

export class Sha256ScoreCalculator implements ScoreCalculator {
  calculate(normalizedRut: string): number {
    const digest = createHash("sha256").update(normalizedRut).digest();

    return digest.readUInt32BE(0) % 101;
  }
}
