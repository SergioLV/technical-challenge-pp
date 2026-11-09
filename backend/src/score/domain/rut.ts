import { InvalidRutError } from "./errors/invalid-rut-error.js";

export type Rut = Readonly<{
  normalized: string;
  formatted: string;
}>;

export function createRut(value: string): Rut {
  const normalized = value.trim().replaceAll(".", "").toUpperCase();
  const match = normalized.match(/^(\d{7,8})-([\dK])$/);

  if (!match) {
    throw new InvalidRutError();
  }

  const [, body, checkDigit] = match;

  return {
    normalized,
    formatted: `${formatBody(body)}-${checkDigit}`,
  };
}

function formatBody(body: string): string {
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
