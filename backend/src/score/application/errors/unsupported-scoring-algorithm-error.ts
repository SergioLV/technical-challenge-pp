export class UnsupportedScoringAlgorithmError extends Error {
  override readonly name = "UnsupportedScoringAlgorithmError";

  constructor(readonly selection: string) {
    super(`Unsupported scoring algorithm: ${selection}`);
  }
}
