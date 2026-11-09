import type { RequestHandler } from "express";

import type { GetScoreUseCase } from "../application/get-score-use-case.js";
import { InvalidRutError } from "../domain/errors/invalid-rut-error.js";
import type { ScoreResponseDto } from "./score.dto.js";

export function createGetScoreHandler(
  getScoreUseCase: GetScoreUseCase,
): RequestHandler<{ rut: string }> {
  return (request, response) => {
    try {
      const result: ScoreResponseDto = getScoreUseCase.execute({
        rut: request.params.rut,
      });

      response.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidRutError) {
        const errorResponse: ScoreResponseDto = {
          success: false,
          message: error.message,
        };

        response.status(400).json(errorResponse);
        return;
      }

      throw error;
    }
  };
}
