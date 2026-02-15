#!/usr/bin/env node
import { createServer } from "./server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

createServer()
  .then(async (server) => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  })
  .catch((error) => {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  });
