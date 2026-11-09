export type AuthPrincipal =
  | Readonly<{
      id: string;
      role: "admin";
    }>
  | Readonly<{
      id: string;
      role: "user";
      rut: string;
    }>;
