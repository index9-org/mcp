import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { logger } from "./logger.js";
import { checkRateLimit } from "./utils/rateLimiter.js";
import { findModelsTool } from "./tools/find_models.js";
import { getModelTool } from "./tools/get_model.js";
import { testModelTool } from "./tools/test_model.js";
import { OPEN_ROUTER_API_KEY } from "./config.js";
import {
  findModelsSchema,
  getModelSchema,
  testModelSchema,
  findModelsOutputSchema,
  getModelOutputSchema,
  testModelOutputSchema,
} from "./schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8")) as {
  version: string;
};

export function createMCPServer() {
  const server = new McpServer({
    name: "index9",
    version: packageJson.version,
  });

  server.registerTool(
    "find_models",
    {
      title: "Find AI Models",
      description: `Search and filter 300+ AI models. Returns ranked results with pricing, context windows, and capabilities.

Call this tool first to discover model IDs, unless the user provides one (format: 'provider/model-name').

Parameters:
- query: Natural language search (e.g., 'fast cheap coding model')
- provider, min_context, max_price_per_m, capabilities: Exact filters
- sort_by: 'relevance' (default), 'price_asc', 'price_desc', 'date_desc', 'context_desc'
- limit, offset: Pagination

Use model IDs from results with get_model for full specs or test_model for live testing.`,
      inputSchema: findModelsSchema,
      outputSchema: findModelsOutputSchema,
    },
    async (input) => {
      if (!checkRateLimit("find_models")) {
        logger.warn({ tool: "find_models" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      try {
        const result = await findModelsTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "find_models", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  server.registerTool(
    "get_model",
    {
      title: "Get Model Details",
      description: `Get complete specs for a model by ID. Returns pricing, context window, capabilities, architecture, and per-request limits.

Call after find_models to get full details, or when the user provides a model ID (format: 'provider/model-name').

Returns 404 if model not found. Use find_models to discover valid IDs.`,
      inputSchema: getModelSchema,
      outputSchema: getModelOutputSchema,
    },
    async (input) => {
      if (!checkRateLimit("get_model")) {
        logger.warn({ tool: "get_model" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      try {
        const result = await getModelTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "get_model", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  server.registerTool(
    "test_model",
    {
      title: "Test AI Models",
      description: `Make live API calls to 1-5 models via OpenRouter. Returns output text, latency (ms), token usage, and cost estimates.

Requires OPENROUTER_API_KEY in MCP client configuration. Costs are billed to your OpenRouter account.

Parameters:
- model_ids: 1-5 model IDs to test (all receive identical prompts)
- test_type: 'quick' (math), 'code', 'reasoning', 'instruction', 'tool_calling'
- prompt: Custom prompt (overrides test_type)
- max_tokens: Response length limit (default 1000)

Use find_models or get_model first to identify model IDs.`,
      inputSchema: testModelSchema,
      outputSchema: testModelOutputSchema,
    },
    async (input) => {
      if (!checkRateLimit("test_model")) {
        logger.warn({ tool: "test_model" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      try {
        if (!OPEN_ROUTER_API_KEY) {
          logger.warn({ tool: "test_model" }, "Missing OpenRouter API key");
          return {
            content: [
              {
                type: "text",
                text: "Error: OPEN_ROUTER_API_KEY is required to use test_model. This tool runs live tests against AI models via OpenRouter API.\n\nTo use this tool:\n1. Get your API key from https://openrouter.ai/keys\n2. Add OPEN_ROUTER_API_KEY to your MCP client configuration (e.g., in Cursor settings or Claude Desktop config)\n3. Restart your MCP client\n\nCharges are billed directly to your OpenRouter account.",
              },
            ],
            isError: true,
          };
        }

        const result = await testModelTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "test_model", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  return server;
}

export async function startMCPServer() {
  // Minimal startup logging to avoid stdio interference
  if (process.env.DEBUG_MCP === "true") {
    logger.info("Starting MCP server with stdio transport");
  }

  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  if (process.env.DEBUG_MCP === "true") {
    logger.info("MCP server ready - awaiting requests");
  }

  process.on("SIGINT", async () => {
    logger.info("Shutting down MCP server");
    await server.close();
    process.exit(0);
  });
}
