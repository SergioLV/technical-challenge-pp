import type { AuthUser } from "../../domain/auth-user.js";

export interface IssuedToken {
  token: string;
  expiresIn: number;
}

export interface TokenIssuer {
  issue(user: AuthUser): IssuedToken;
}
