import type { AuthUser } from "../../domain/auth-user.js";

export interface UserAuthenticator {
  authenticate(username: string, password: string): AuthUser | null;
}
