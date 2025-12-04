import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { logger } from "./logger.js";
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
      title: "List Models",
      description:
        "List AI models with optional filters. Filter by: provider or owner (openai, anthropic, google, etc.), min_context (e.g. 100000), modality (text, vision, audio, video, image), max_price_per_m (USD per million tokens), supports_tool_calling (boolean), supports_json_mode (boolean), tokenizer (model family: GPT, Claude, Llama3), output_modality (text, image, embeddings). Returns pricing, context window, max output tokens, input_modalities array, output_modalities array, capabilities (vision, audio, tool_calling, json_mode), and architecture (tokenizer family) for each model.",
      inputSchema: listModelsSchema,
    },
    async (input) => {
      try {
        const result = await listModelsTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
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
      title: "Search Models",
      description:
        'Semantic search across 1000+ AI models using natural language queries. Uses vector embeddings (semantic search) combined with fuzzy text matching to find relevant models. Examples: "fast cheap model for code generation", "vision model under $1 per million tokens", "best reasoning model with large context". Returns models ranked by similarity score (0-1, default threshold 0.5) with descriptions, pricing, context window, and capabilities (vision, tool_calling).',
      inputSchema: searchModelsSchema,
    },
    async (input) => {
      try {
        const result = await searchModelsTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
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
      title: "Get Model",
      description:
        "Get complete details for a specific model by ID. Returns: description, context window, max output tokens, pricing (input/output per million tokens), extended pricing (image, audio, web_search, cache_read, cache_write), capabilities (vision, audio, function_calling, tool_calling, json_mode, custom), supported_parameters, input/output modalities, architecture (tokenizer, instruct_type), is_moderated, per_request_limits, and deployments. If exact match fails, semantic search may be used to find similar models.",
      inputSchema: getModelSchema,
    },
    async (input) => {
      try {
        const result = await getModelTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
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
      title: "Compare Models",
      description:
        "Compare 2-10 models side-by-side. Returns unified view of: context windows, max output tokens, pricing (input/output), and capabilities (vision, tool_calling, custom). Includes not_found array for any model IDs that couldn't be located. Useful for making final selection between candidate models.",
      inputSchema: compareModelsSchema,
    },
    async (input) => {
      try {
        const model_ids = Array.from(new Set((input.model_ids as string[]) || []));
        if (model_ids.length < 2) {
          throw new Error("At least 2 unique model IDs are required");
        }
        const result = await compareModelsTool({ model_ids });
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
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
      title: "Recommend Model",
      description:
        "Get ranked model recommendations for a use case. Describe what you're building (e.g. 'coding assistant', 'customer support chatbot', 'RAG pipeline'). Optionally set max_price_per_m, min_context, and required_capabilities (vision, tool_calling, audio, video). Returns scored recommendations (higher score = better match) optimized for your requirements with context window and pricing.",
      inputSchema: recommendModelSchema,
    },
    async (input) => {
      try {
        const result = await recommendModelTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
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
      title: "Test Model",
      description:
        "Run live tests against 1-5 models via OpenRouter API. **Requires OPEN_ROUTER_API_KEY environment variable** - set this in your MCP client configuration to enable. Test types: 'quick' (basic math), 'code' (Python function), 'reasoning' (logic puzzle), 'instruction' (follow formatting), 'tool_calling' (verify tool use works). Returns latency, output, token usage, cost estimates, and for tool_calling tests: tool_calls_detected boolean. Use to validate models before committing. Charges are billed directly to your OpenRouter account. Get your API key from: https://openrouter.ai/keys",
      inputSchema: testModelSchema,
    },
    async (input) => {
      try {
        if (!OPEN_ROUTER_API_KEY) {
          return {
            content: [
              {
                type: "text",
                text: "Error: OPEN_ROUTER_API_KEY is required to use test_model. This tool allows you to run live tests against AI models via OpenRouter API.\n\nTo use this tool:\n1. Get your API key from https://openrouter.ai/keys\n2. Add OPEN_ROUTER_API_KEY to your MCP client configuration (e.g., in Cursor settings or Claude Desktop config)\n3. Restart your MCP client\n\nCharges are billed directly to your OpenRouter account.",
              },
            ],
            isError: true,
          };
        }
        const result = await testModelTool(input);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
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
  logger.info("Starting MCP server with stdio transport");

  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info("MCP server ready - awaiting requests");

  process.on("SIGINT", async () => {
    logger.info("Shutting down MCP server");
    await server.close();
    process.exit(0);
  });
}
