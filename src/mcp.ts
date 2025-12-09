import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { logger } from "./logger.js";
import { checkRateLimit } from "./utils/rateLimiter.js";
import { listModelsTool } from "./tools/list_models.js";
import { searchModelsTool } from "./tools/search_models.js";
import { getModelTool } from "./tools/get_model.js";
import { compareModelsTool } from "./tools/compare_models.js";
import { recommendModelTool } from "./tools/recommend_model.js";
import { testModelTool } from "./tools/test_model.js";
import { OPEN_ROUTER_API_KEY } from "./config.js";
import {
  listModelsSchema,
  searchModelsSchema,
  getModelSchema,
  compareModelsSchema,
  recommendModelSchema,
  testModelSchema,
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
    "list_models",
    {
      title: "List AI Models",
      description:
        "Filter AI models by exact criteria (provider, context window, pricing, capabilities). Returns up to 100 models with full details. Use search_models for natural language queries.",
      inputSchema: listModelsSchema,
    },
    async (input) => {
      if (!checkRateLimit("list_models")) {
        logger.warn({ tool: "list_models" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      try {
        const result = await listModelsTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "list_models", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  server.registerTool(
    "search_models",
    {
      title: "Search AI Models",
      description:
        "Search 1000+ AI models using natural language (e.g., 'fast cheap coding model'). Uses semantic search and fuzzy matching. Returns ranked results with similarity scores.",
      inputSchema: searchModelsSchema,
    },
    async (input) => {
      if (!checkRateLimit("search_models")) {
        logger.warn({ tool: "search_models" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      try {
        const result = await searchModelsTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "search_models", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  server.registerTool(
    "get_model",
    {
      title: "Get Model Details",
      description:
        "Get complete details for a specific model by ID: pricing, capabilities, context window, parameters, and deployment info. Most detailed view available.",
      inputSchema: getModelSchema,
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
    "compare_models",
    {
      title: "Compare AI Models",
      description:
        "Compare 2-10 AI models side-by-side with unified pricing, context windows, and capabilities. Perfect for final selection decisions.",
      inputSchema: compareModelsSchema,
    },
    async (input) => {
      if (!checkRateLimit("compare_models")) {
        logger.warn({ tool: "compare_models" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      const model_ids = Array.from(new Set((input.model_ids as string[]) || []));
      try {
        if (model_ids.length < 2) {
          throw new Error("At least 2 unique model IDs are required");
        }
        const result = await compareModelsTool({ model_ids });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "compare_models", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  server.registerTool(
    "recommend_model",
    {
      title: "Get Model Recommendations",
      description:
        "Get AI-powered model recommendations for your use case (e.g., 'coding assistant'). Optionally specify budget, context needs, and required capabilities. Returns ranked suggestions.",
      inputSchema: recommendModelSchema,
    },
    async (input) => {
      if (!checkRateLimit("recommend_model")) {
        logger.warn({ tool: "recommend_model" }, "Rate limit exceeded");
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      try {
        const result = await recommendModelTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error({ tool: "recommend_model", error: errorMessage }, "Tool execution failed");
        throw error;
      }
    },
  );

  server.registerTool(
    "test_model",
    {
      title: "Test AI Models",
      description:
        "Test 1-5 models with real API calls via OpenRouter to check latency, performance, and tool calling. Shows actual costs and behavior. Test types: quick (math), code, reasoning, instruction, tool_calling.",
      inputSchema: testModelSchema,
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
