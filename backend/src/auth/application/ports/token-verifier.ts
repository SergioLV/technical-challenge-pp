import type { AuthPrincipal } from "../../domain/auth-principal.js";

export interface TokenVerifier {
  verify(token: string): AuthPrincipal;
}
