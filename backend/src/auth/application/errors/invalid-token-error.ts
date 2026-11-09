export class InvalidTokenError extends Error {
  override readonly name = "InvalidTokenError";

  constructor() {
    super("Invalid or expired token");
  }
}
