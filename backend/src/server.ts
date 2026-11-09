import { createApp } from "./app.js";
import { consoleLogger } from "./shared/logging/logger.js";

const jwtSecret = process.env.JWT_SECRET;
const scoringAlgorithmSelection = process.env.SCORING_ALGORITHM_SELECTION;

if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

if (!scoringAlgorithmSelection) {
  throw new Error(
    "Missing required environment variable: SCORING_ALGORITHM_SELECTION",
  );
}

const port = Number(process.env.PORT ?? 3000);
const app = createApp({
  jwtSecret,
  scoringAlgorithmSelection,
  logger: consoleLogger,
});

app.listen(port, () => {
  consoleLogger.info("server.started", { port });
});
