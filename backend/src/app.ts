import cors from "cors";
import express from "express";

import { LoginUseCase } from "./auth/application/login-use-case.js";
import { createLoginHandler } from "./auth/http/login-handler.js";
import { JwtTokenIssuer } from "./auth/infrastructure/jwt-token-issuer.js";
import { MockUserAuthenticator } from "./auth/infrastructure/mock-user-authenticator.js";
import { createRequestLogger } from "./shared/http/request-logger.js";
import {
  consoleLogger,
  type Logger,
} from "./shared/logging/logger.js";

export type AppConfig = Readonly<{
  jwtSecret: string;
  logger?: Logger;
}>;

export function createApp(config: AppConfig) {
  const app = express();
  const loginUseCase = new LoginUseCase(
    new MockUserAuthenticator(),
    new JwtTokenIssuer(config.jwtSecret),
  );
  const logger = config.logger ?? consoleLogger;

  app.use(createRequestLogger(logger));
  app.use(cors());
  app.use(express.json());
  app.post("/login", createLoginHandler(loginUseCase));

  return app;
}
