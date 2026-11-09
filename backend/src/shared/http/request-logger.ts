import type { RequestHandler } from "express";

import type { Logger } from "../logging/logger.js";

export function createRequestLogger(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const startedAt = Date.now();

    response.on("finish", () => {
      const route =
        typeof request.route?.path === "string"
          ? request.route.path
          : "unmatched";

      logger.info("http.request.completed", {
        method: request.method,
        route,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
}
