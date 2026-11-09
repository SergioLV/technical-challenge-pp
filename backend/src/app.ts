import cors from "cors";
import express from "express";

import { LoginUseCase } from "./auth/application/login-use-case.js";
import { createAuthenticateRequest } from "./auth/http/authenticate-request.js";
import { createLoginHandler } from "./auth/http/login-handler.js";
import { JwtTokenIssuer } from "./auth/infrastructure/jwt-token-issuer.js";
import { JwtTokenVerifier } from "./auth/infrastructure/jwt-token-verifier.js";
import { MockUserAuthenticator } from "./auth/infrastructure/mock-user-authenticator.js";
import { GetScoreUseCase } from "./score/application/get-score-use-case.js";
import { authorizeScoreQuery } from "./score/http/authorize-score-query.js";
import { createGetScoreHandler } from "./score/http/get-score-handler.js";
import { createScoreCalculator } from "./score/infrastructure/create-score-calculator.js";
import { SystemClock } from "./score/infrastructure/system-clock.js";
import { createRequestLogger } from "./shared/http/request-logger.js";
import {
  consoleLogger,
  type Logger,
} from "./shared/logging/logger.js";

export type AppConfig = Readonly<{
  jwtSecret: string;
  scoringAlgorithmSelection: string;
  logger?: Logger;
}>;

export function createApp(config: AppConfig) {
  const app = express();
  const loginUseCase = new LoginUseCase(
    new MockUserAuthenticator(),
    new JwtTokenIssuer(config.jwtSecret),
  );
  const getScoreUseCase = new GetScoreUseCase(
    createScoreCalculator(config.scoringAlgorithmSelection),
    new SystemClock(),
  );
  const authenticateRequest = createAuthenticateRequest(
    new JwtTokenVerifier(config.jwtSecret),
  );
  const logger = config.logger ?? consoleLogger;

  app.use(createRequestLogger(logger));
  app.use(cors());
  app.use(express.json());
  app.post("/login", createLoginHandler(loginUseCase));
  app.get(
    "/score/:rut",
    authenticateRequest,
    authorizeScoreQuery,
    createGetScoreHandler(getScoreUseCase),
  );

  return app;
}
