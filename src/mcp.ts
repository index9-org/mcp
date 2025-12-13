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
      description: `Search and filter 300+ AI models using natural language queries or precise criteria. Returns ranked results with pricing, context windows, and capabilities.

You MUST call this function first to discover model IDs needed by 'get_model' and 'test_model' UNLESS the user explicitly provides a model ID in the format 'provider/model-name' (e.g., 'openai/gpt-4o', 'anthropic/claude-3-sonnet').

Usage Strategy:
1. For exploratory searches, use natural language queries (e.g., 'fast cheap coding model', 'vision model with 128k context')
2. For precise filtering, combine filters (provider, min_context, max_price_per_m, capabilities)
3. Use semantic search when the user's intent is clear but specific criteria are vague
4. Use exact filters when the user specifies precise requirements (e.g., 'at least 128k context', 'under $1 per million tokens')

Selection Process:
1. Analyze the query to understand what model characteristics the user needs
2. Return the most relevant matches based on:
   - Semantic relevance to the query (when using natural language)
   - Price constraints (when specified)
   - Context window requirements (when specified)
   - Required capabilities (vision, audio, tool_calling, json_mode, video)
   - Provider preference (when specified)
3. Sort results by relevance (default), price, context size, or release date as appropriate

Response Format:
- Each result includes: model ID (format: 'provider/model-name'), name, description, pricing (per million tokens), context window, capabilities, and relevance score
- Use the model ID from results to call 'get_model' for full specifications
- Use the model ID from results to call 'test_model' for performance testing
- If multiple good matches exist, present top results and explain why they match
- If no matches exist, suggest relaxing filters or trying a different query

Best Practices:
- Start with semantic search for broad exploration, then refine with filters
- Use higher limit (20-50) for broad exploration, lower limit (5-10) for focused comparisons
- Combine natural language query with filters for best results
- Check 'total' count in response to determine if pagination is needed`,
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
      description: `Fetch complete specifications for a specific model by ID. Returns comprehensive details including per-token pricing (input/output), context window limits, max output tokens, capabilities, architecture, training cutoff dates, and per-request limits.

You MUST call this function after 'find_models' to get full details for selection or comparison, OR when the user explicitly provides a model ID in the format 'provider/model-name' (e.g., 'openai/gpt-4o', 'anthropic/claude-3-sonnet').

When to Use:
1. After 'find_models' - to get comprehensive specs for models that match search criteria
2. With known model ID - when user specifies a model they want details about
3. For comparison - to get detailed specs for multiple models side-by-side
4. Before 'test_model' - to understand model capabilities before testing

Information Provided:
- Pricing: Per-token costs for input and output (in USD per million tokens)
- Context Window: Maximum tokens the model can process
- Max Output Tokens: Maximum tokens the model can generate
- Capabilities: Vision, audio, tool_calling, json_mode, video support
- Architecture: Tokenizer and instruction type
- Training Cutoff: Knowledge cutoff date
- Per-Request Limits: Maximum prompt and completion tokens per request
- Extended Pricing: Image, audio, web search, cache, and other pricing details (when available)

Response Format:
- Returns complete model specification as structured JSON
- Use pricing information to calculate costs for specific use cases
- Use capabilities to determine if model supports required features
- Use context window and max output tokens to plan prompt and response sizes
- Returns 404 error if model ID not found - suggest using 'find_models' to discover valid IDs

Best Practices:
- Always verify model ID format is 'provider/model-name' (case-sensitive)
- Use this tool to compare pricing and capabilities between models
- Check per-request limits to ensure your use case fits within constraints
- Review extended pricing for multimodal features if needed`,
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
      description: `Execute live API calls to 1-5 models simultaneously via OpenRouter. Compare real performance with custom prompts or preset test types. Returns actual output text, latency (ms), token usage, cost estimates (USD), and detected tool calls.

You MUST call this function after 'find_models' or 'get_model' to validate model performance before final selection. Requires OPEN_ROUTER_API_KEY in MCP client configuration. Costs are billed to your OpenRouter account.

When to Use:
1. After narrowing down model candidates - to validate real-world performance
2. For cost estimation - to measure actual token usage and costs for your use case
3. For latency comparison - to compare response times across models
4. For capability testing - to verify models handle specific tasks correctly
5. Before production selection - to make data-driven decisions

Test Type Selection:
- 'quick': Simple math or basic tasks (fastest, lowest cost) - use for initial screening
- 'code': Function generation or code completion - use when evaluating coding capabilities
- 'reasoning': Logic puzzles or complex reasoning - use when evaluating reasoning abilities
- 'instruction': Following complex multi-step directions - use when evaluating instruction following
- 'tool_calling': Function calling capability - use when evaluating tool/function calling support
- Custom prompt: Provide your own prompt for domain-specific testing

Model Selection:
- Test 1 model: For focused evaluation of a single candidate
- Test 2-5 models: For side-by-side comparison (all models receive identical prompts)
- Use model IDs from 'find_models' or 'get_model' results
- Ensure model IDs are in format 'provider/model-name' (case-sensitive)

Interpreting Results:
- Latency (ms): Lower is better for real-time applications
- Token Usage: Check prompt_tokens, completion_tokens, and total_tokens
- Cost Estimates: Use input_cost and output_cost to calculate total cost
- Output Quality: Review actual output text to assess quality
- Tool Calls: Check tool_calls_detected and tool_calls array for function calling capability
- Errors: Review error field if a model fails

Cost Considerations:
- Each test makes real API calls that cost money
- Costs vary by model (check pricing via 'get_model' first)
- Use 'quick' test type for initial screening to minimize costs
- Use custom prompts with lower max_tokens for cost-effective testing
- Costs are billed directly to the OpenRouter account associated with OPEN_ROUTER_API_KEY

Best Practices:
- Start with 'quick' test type to screen multiple models cost-effectively
- Use preset test types that match your use case (code, reasoning, etc.)
- Test 2-3 top candidates side-by-side for fair comparison
- Use custom prompts that reflect your actual use case for most accurate results
- Set appropriate max_tokens based on expected response length (100-500 for quick tests, 1000-2000 for code/reasoning, 4000+ for long-form)
- Always verify OPEN_ROUTER_API_KEY is configured before calling this tool`,
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
