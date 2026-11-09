import jwt from "jsonwebtoken";

import type {
  IssuedToken,
  TokenIssuer,
} from "../application/ports/token-issuer.js";
import type { AuthUser } from "../domain/auth-user.js";

const tokenExpirationSeconds = 60 * 60;

export class JwtTokenIssuer implements TokenIssuer {
  constructor(private readonly secret: string) {}

  issue(user: AuthUser): IssuedToken {
    const claims =
      user.role === "user"
        ? { role: user.role, rut: user.rut }
        : { role: user.role };

    return {
      token: jwt.sign(claims, this.secret, {
        subject: user.id,
        expiresIn: tokenExpirationSeconds,
      }),
      expiresIn: tokenExpirationSeconds,
    };
  }
}
