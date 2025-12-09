import { z } from "zod";

/**
 * List Models Tool Schema
 * Filters AI models using exact technical criteria
 */
export const listModelsSchema = z.object({
  provider: z
    .string()
    .describe("Filter by model provider (e.g., openai, anthropic, google)")
    .optional(),
  owner: z.string().describe("Filter by model owner organization").optional(),
  min_context: z.number().min(0).describe("Minimum context window size in tokens").optional(),
  modality: z
    .enum(["text", "vision", "audio", "video", "image"])
    .describe("Primary input modality the model supports")
    .optional(),
  supports_tool_calling: z
    .boolean()
    .describe("Filter to models that support function/tool calling")
    .optional(),
  supports_json_mode: z
    .boolean()
    .describe("Filter to models with native JSON output mode")
    .optional(),
  tokenizer: z
    .string()
    .describe("Filter by tokenizer type (e.g., cl100k_base, tiktoken)")
    .optional(),
  output_modality: z
    .enum(["text", "image", "embeddings"])
    .describe("Type of output the model generates")
    .optional(),
  max_price_per_m: z
    .number()
    .min(0)
    .describe("Maximum price per million tokens (combined input + output)")
    .optional(),
  limit: z.number().min(1).max(100).default(10).describe("Number of results to return (1-100)"),
});

/**
 * Search Models Tool Schema
 * Natural language semantic search across AI models
 */
export const searchModelsSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe(
      "Natural language query describing desired model characteristics (e.g., 'fast cheap code generation model')",
    ),
  limit: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum number of results to return (1-50)"),
  threshold: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe("Minimum similarity score for results (0-1, where 1 is exact match)"),
});

/**
 * Get Model Tool Schema
 * Retrieve complete details for a specific model
 */
export const getModelSchema = z.object({
  model_id: z
    .string()
    .min(1)
    .describe("Exact model identifier (e.g., 'openai/gpt-4', 'anthropic/claude-sonnet-4')"),
});

/**
 * Compare Models Tool Schema
 * Side-by-side comparison of multiple models
 */
export const compareModelsSchema = z.object({
  model_ids: z
    .array(z.string())
    .min(2)
    .max(10)
    .describe("Array of 2-10 model IDs to compare side-by-side"),
});

/**
 * Recommend Model Tool Schema
 * AI-powered model recommendations based on use case
 */
export const recommendModelSchema = z.object({
  use_case: z
    .string()
    .min(1)
    .describe(
      "Description of your use case (e.g., 'coding assistant', 'customer support chatbot', 'RAG pipeline with long documents')",
    ),
  max_price_per_m: z
    .number()
    .min(0)
    .describe("Budget constraint: maximum acceptable price per million tokens")
    .optional(),
  min_context: z
    .number()
    .min(0)
    .describe("Minimum required context window size in tokens")
    .optional(),
  required_capabilities: z
    .array(z.string())
    .describe("Required model capabilities (e.g., ['tool_calling', 'vision', 'json_mode'])")
    .optional(),
  limit: z
    .number()
    .min(1)
    .max(20)
    .default(5)
    .describe("Number of recommendations to return (1-20)"),
});

/**
 * Test Model Tool Schema
 * Run live API tests against models via OpenRouter
 */
export const testModelSchema = z.object({
  model_ids: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Array of 1-5 model IDs to test with real API calls"),
  test_type: z
    .enum(["quick", "code", "reasoning", "instruction", "tool_calling"])
    .default("quick")
    .describe(
      "Type of test to run: 'quick' (math), 'code' (generation), 'reasoning' (logic), 'instruction' (following), 'tool_calling' (function calls)",
    ),
});

// Type exports for TypeScript inference
export type ListModelsInput = z.infer<typeof listModelsSchema>;
export type SearchModelsInput = z.infer<typeof searchModelsSchema>;
export type GetModelInput = z.infer<typeof getModelSchema>;
export type CompareModelsInput = z.infer<typeof compareModelsSchema>;
export type RecommendModelInput = z.infer<typeof recommendModelSchema>;
export type TestModelInput = z.infer<typeof testModelSchema>;
