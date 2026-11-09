import type { RequestHandler } from "express";

import { InvalidCredentialsError } from "../application/errors/invalid-credentials-error.js";
import type { LoginUseCase } from "../application/login-use-case.js";
import type {
  LoginRequestDto,
  LoginResponseDto,
} from "./login.dto.js";

function isLoginRequest(body: unknown): body is LoginRequestDto {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.username === "string" &&
    typeof candidate.password === "string" &&
    Boolean(candidate.username.trim()) &&
    Boolean(candidate.password.trim())
  );
}

export function createLoginHandler(loginUseCase: LoginUseCase): RequestHandler {
  return (request, response) => {
    if (!isLoginRequest(request.body)) {
      const errorResponse: LoginResponseDto = {
        success: false,
        message: "Username and password are required",
      };

      response.status(400).json(errorResponse);
      return;
    }

    try {
      const result = loginUseCase.execute(request.body);
      const loginResponse: LoginResponseDto = {
        success: true,
        ...result,
      };

      response.status(200).json(loginResponse);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        const errorResponse: LoginResponseDto = {
          success: false,
          message: error.message,
        };

        response.status(401).json(errorResponse);
        return;
      }

      throw error;
    }
  };
}
