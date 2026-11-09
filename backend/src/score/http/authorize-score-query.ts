import type { RequestHandler } from "express";

import type { AuthPrincipal } from "../../auth/domain/auth-principal.js";
import { InvalidRutError } from "../domain/errors/invalid-rut-error.js";
import { createRut } from "../domain/rut.js";

export const authorizeScoreQuery: RequestHandler<{ rut: string }> = (
  request,
  response,
  next,
) => {
  const principal = response.locals.principal as AuthPrincipal | undefined;

  if (!principal) {
    response.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }

  if (principal.role === "admin") {
    next();
    return;
  }

  let requestedRut;

  try {
    requestedRut = createRut(request.params.rut);
  } catch (error) {
    if (error instanceof InvalidRutError) {
      next();
      return;
    }

    throw error;
  }

  let authenticatedRut;

  try {
    authenticatedRut = createRut(principal.rut);
  } catch (error) {
    if (error instanceof InvalidRutError) {
      response.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    throw error;
  }

  if (requestedRut.normalized !== authenticatedRut.normalized) {
    response.status(403).json({
      success: false,
      message: "You are not allowed to query this RUT",
    });
    return;
  }

  next();
};
