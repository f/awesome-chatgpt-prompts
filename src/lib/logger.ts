import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  
  // Structured JSON format for DigitalOcean App Platform log forwarding
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
      app: "prompts-chat",
    }),
  },

  // Add timestamp in ISO format for better log aggregation
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base context added to all logs
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version || "unknown",
  },

  // Redact sensitive fields
  redact: {
    paths: [
      "password",
      "token",
      "apiKey",
      "api_key",
      "authorization",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});

// Create child loggers for specific contexts
export const createLogger = (context: string) => {
  return logger.child({ context });
};

// Pre-configured loggers for common use cases
export const dbLogger = createLogger("database");
export const authLogger = createLogger("auth");
export const apiLogger = createLogger("api");

// Helper for request logging
export const logRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string
) => {
  const log = apiLogger.child({
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    ...(userId && { userId }),
  });

  if (statusCode >= 500) {
    log.error("Request failed");
  } else if (statusCode >= 400) {
    log.warn("Request error");
  } else {
    log.info("Request completed");
  }
};

// Helper for error logging with stack traces
export const logError = (
  error: Error | unknown,
  context?: string,
  meta?: Record<string, unknown>
) => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  logger.error(
    {
      err: {
        message: errorObj.message,
        name: errorObj.name,
        stack: errorObj.stack,
      },
      context,
      ...meta,
    },
    errorObj.message
  );
};

export default logger;
