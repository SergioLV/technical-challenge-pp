export type LogContext = Readonly<Record<string, string | number | boolean>>;

export interface Logger {
  info(event: string, context?: LogContext): void;
  warn(event: string, context?: LogContext): void;
  error(event: string, context?: LogContext): void;
}

function writeLog(
  level: "info" | "warn" | "error",
  event: string,
  context: LogContext = {},
): void {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  });

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}

export const consoleLogger: Logger = {
  info: (event, context) => writeLog("info", event, context),
  warn: (event, context) => writeLog("warn", event, context),
  error: (event, context) => writeLog("error", event, context),
};
