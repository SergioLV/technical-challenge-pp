import type { ApiErrorResponse } from "../../shared/http/api-error-response.js";

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginSuccessResponseDto {
  success: true;
  token: string;
  expiresIn: number;
}

export type LoginResponseDto = LoginSuccessResponseDto | ApiErrorResponse;
