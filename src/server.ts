import {
  CAPABILITIES,
  FindModelsToolResultSchema,
  GetModelsToolResultSchema,
  LIMITS,
  OUTPUT_MODALITIES,
  PARAM_DESCRIPTIONS,
  ResponseFormatSchema,
  TOOLS,
  UserContentPartSchema,
  WORKFLOW_INSTRUCTIONS,
} from "@index9/core";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { loadConfig } from "./config.js";
import { handleGetModels, handleSearchModels, handleTestModels } from "./tools.js";

export async function createServer(): Promise<McpServer> {
  const ctx = loadConfig();
  const server = new McpServer(
    { name: "index9", version: "4.0.0" },
    { instructions: WORKFLOW_INSTRUCTIONS },
  );

  server.registerTool(
    "find_models",
    {
      title: TOOLS.find_models.title,
      description: TOOLS.find_models.description,
      inputSchema: {
        q: z.string().min(1).optional().describe(PARAM_DESCRIPTIONS.q),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Page size (1-100, default 20)."),
        cursor: z.string().min(1).optional().describe(PARAM_DESCRIPTIONS.cursor),
        sortBy: z
          .enum(["relevance", "created", "price"])
          .default("relevance")
          .describe(PARAM_DESCRIPTIONS.sortBy),
        sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort order. Defaults by sortBy."),
        createdAfter: z.string().optional().describe("Lower bound for model created timestamp."),
        createdBefore: z.string().optional().describe("Upper bound for model created timestamp."),
        minPrice: z
          .number()
          .min(0)
          .optional()
          .describe("Minimum prompt price in USD per million tokens."),
        maxPrice: z
          .number()
          .min(0)
          .optional()
          .describe("Maximum prompt price in USD per million tokens."),
        minContext: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Minimum context window in tokens."),
        capabilitiesAll: z
          .array(z.enum(CAPABILITIES))
          .optional()
          .describe(PARAM_DESCRIPTIONS.capabilitiesAll),
        capabilitiesAny: z
          .array(z.enum(CAPABILITIES))
          .optional()
          .describe(PARAM_DESCRIPTIONS.capabilitiesAny),
        modality: z.enum(OUTPUT_MODALITIES).optional().describe(PARAM_DESCRIPTIONS.modality),
        provider: z.string().min(1).optional().describe(PARAM_DESCRIPTIONS.provider),
      },
      outputSchema: FindModelsToolResultSchema.shape,
      annotations: { readOnlyHint: true },
    },
    async (args) => handleSearchModels(ctx, args),
  );

  server.registerTool(
    "get_models",
    {
      title: TOOLS.get_models.title,
      description: TOOLS.get_models.description,
      inputSchema: {
        ids: z
          .array(z.string().min(1))
          .min(1)
          .max(100)
          .describe("Model identifiers or aliases. Up to 100."),
        maxDescriptionChars: z
          .number()
          .int()
          .min(0)
          .max(2000)
          .optional()
          .describe("Truncate descriptions to this many characters."),
      },
      outputSchema: GetModelsToolResultSchema.shape,
      annotations: { readOnlyHint: true },
    },
    async (args) => handleGetModels(ctx, args),
  );

  server.registerTool(
    "test_model",
    {
      title: TOOLS.test_model.title,
      description: TOOLS.test_model.description,
      inputSchema: {
        prompt: z.string().min(1).optional().describe("Prompt sent to each model."),
        userContent: z
          .array(UserContentPartSchema)
          .min(1)
          .optional()
          .describe("Multimodal user content. At least one of prompt or userContent required."),
        dryRun: z
          .boolean()
          .optional()
          .describe(
            "When true, returns estimated token usage and cost without calling OpenRouter (no API key required).",
          ),
        expectedCompletionTokens: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe(PARAM_DESCRIPTIONS.expectedCompletionTokens),
        models: z
          .array(z.string().min(1))
          .min(1)
          .max(LIMITS.testModelsMax)
          .describe(`Model IDs to evaluate (1-${LIMITS.testModelsMax}).`),
        timeoutMs: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Per-model timeout in ms (default 15000, max 60000)."),
        maxTokens: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe(
            "Completion token cap. For reasoning-capable models, set ≥ 2000 (or omit) — reasoning tokens count against this before visible output, and too-low caps cause finish_reason=length.",
          ),
        systemPrompt: z
          .string()
          .min(1)
          .optional()
          .describe("System instruction prepended to prompt."),
        temperature: z.number().min(0).max(2).optional().describe("Sampling temperature (0-2)."),
        topP: z.number().gt(0).max(1).optional().describe("Nucleus sampling (0-1]."),
        seed: z.number().int().optional().describe("Seed for repeatable outputs."),
        responseFormat: ResponseFormatSchema.describe(
          "Structured output shape request forwarded to OpenRouter (e.g., { type: 'json_object' }).",
        ),
        enforceJson: z.boolean().optional().describe("When true, output must parse as JSON."),
        retries: z
          .number()
          .int()
          .min(0)
          .max(3)
          .optional()
          .describe("Retries for transient failures."),
      },
      // No outputSchema: test_model returns a z.union of dry-run and live shapes.
      // The SDK supports only ZodRawShape | AnySchema for outputSchema; a discriminated-union
      // output is represented accurately in the tool description instead.
      annotations: { readOnlyHint: false },
    },
    async (args) => handleTestModels(ctx, args),
  );

  return server;
}
