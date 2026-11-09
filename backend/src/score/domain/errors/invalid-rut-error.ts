export class InvalidRutError extends Error {
  override readonly name = "InvalidRutError";

  constructor() {
    super("Invalid RUT");
  }
}
