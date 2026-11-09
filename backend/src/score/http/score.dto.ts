import type { ApiErrorResponse } from "../../shared/http/api-error-response.js";

export interface ScoreSuccessResponseDto {
  rut: string;
  score: number;
  fecha: string;
}

export type ScoreResponseDto = ScoreSuccessResponseDto | ApiErrorResponse;
