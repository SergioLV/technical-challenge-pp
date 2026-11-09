import jwt from "jsonwebtoken";

import { InvalidTokenError } from "../application/errors/invalid-token-error.js";
import type { TokenVerifier } from "../application/ports/token-verifier.js";
import type { AuthPrincipal } from "../domain/auth-principal.js";

export class JwtTokenVerifier implements TokenVerifier {
  constructor(private readonly secret: string) {}

  verify(token: string): AuthPrincipal {
    try {
      const payload = jwt.verify(token, this.secret, {
        algorithms: ["HS256"],
      });

      if (typeof payload === "string" || typeof payload.sub !== "string") {
        throw new InvalidTokenError();
      }

      if (payload.role === "admin") {
        return { id: payload.sub, role: "admin" };
      }

      if (payload.role === "user" && typeof payload.rut === "string") {
        return {
          id: payload.sub,
          role: "user",
          rut: payload.rut,
        };
      }

      throw new InvalidTokenError();
    } catch {
      throw new InvalidTokenError();
    }
  }
}
