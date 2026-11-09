export type AuthUser =
  | Readonly<{
      id: string;
      username: string;
      role: "admin";
    }>
  | Readonly<{
      id: string;
      username: string;
      role: "user";
      rut: string;
    }>;
