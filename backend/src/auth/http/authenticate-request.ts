import type { RequestHandler } from "express";

import { InvalidTokenError } from "../application/errors/invalid-token-error.js";
import type { TokenVerifier } from "../application/ports/token-verifier.js";

const bearerTokenPattern = /^Bearer\s+(\S+)$/i;

export function createAuthenticateRequest(
  tokenVerifier: TokenVerifier,
): RequestHandler {
  return (request, response, next) => {
    const match = request.header("authorization")?.match(bearerTokenPattern);

    if (!match?.[1]) {
      response.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    try {
      response.locals.principal = tokenVerifier.verify(match[1]);
      next();
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        response.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      throw error;
    }
  };
}
