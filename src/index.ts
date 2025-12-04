#!/usr/bin/env node

import { logger } from "./logger.js";
import { startMCPServer } from "./mcp.js";

async function main() {
  logger.info("Starting index9 MCP server");
  await startMCPServer();
}

process.on("unhandledRejection", (error) => {
  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    "Unhandled rejection",
  );
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    "Uncaught exception",
  );
  process.exit(1);
});

main().catch((error) => {
  logger.error(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    "Failed to start",
  );
  process.exit(1);
});
