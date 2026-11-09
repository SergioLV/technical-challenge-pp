import type { UserAuthenticator } from "../application/ports/user-authenticator.js";
import type { AuthUser } from "../domain/auth-user.js";

type MockUserRecord = AuthUser & Readonly<{ password: string }>;

const mockUsers: readonly MockUserRecord[] = [
  {
    id: "admin-1",
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user-1",
    username: "user",
    password: "user123",
    role: "user",
    rut: "12345678-5",
  },
];

export class MockUserAuthenticator implements UserAuthenticator {
  authenticate(username: string, password: string): AuthUser | null {
    const user = mockUsers.find(
      (candidate) =>
        candidate.username === username && candidate.password === password,
    );

    if (!user) {
      return null;
    }

    if (user.role === "user") {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        rut: user.rut,
      };
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }
}
