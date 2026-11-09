import { createApp } from "./app.js";
import { consoleLogger } from "./shared/logging/logger.js";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

const port = Number(process.env.PORT ?? 3000);
const app = createApp({ jwtSecret, logger: consoleLogger });

app.listen(port, () => {
  consoleLogger.info("server.started", { port });
});
