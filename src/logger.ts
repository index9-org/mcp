import pino from "pino";

// Minimize stderr logs to avoid interfering with JSON-RPC; log only warnings/errors.
const logger = pino(
  {
    name: "index9",
    level: process.env.LOG_LEVEL || "warn",
    enabled: process.env.NODE_ENV !== "production" || process.env.DEBUG_MCP === "true",
  },
  process.stderr,
);

export { logger };
