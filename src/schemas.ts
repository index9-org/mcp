import { z } from "zod";

/**
 * Find Models Tool Schema
 * Unified search and filter for AI models
 */
export const findModelsSchema = z.object({
  query: z
    .string()
    .max(500)
    .describe(
      "Natural language search query describing desired model characteristics (e.g., 'fastest coding model under $1', 'vision model with 128k context', 'cheapest tool-calling model'). Uses semantic search with fuzzy matching. Optional - omit to use filters only.",
    )
    .optional(),
  provider: z
    .string()
    .describe(
      "Filter by exact provider name (e.g., 'openai', 'anthropic', 'google', 'meta'). Case-sensitive. Use find_models without filters first to discover available providers.",
    )
    .optional(),
  min_context: z
    .number()
    .min(0)
    .describe(
      "Minimum context window size in tokens (e.g., 8192, 32000, 128000). Filters out models with smaller context windows. Common values: 4096 (small), 32000 (medium), 128000+ (large).",
    )
    .optional(),
  max_context: z
    .number()
    .min(0)
    .describe(
      "Maximum context window size in tokens. Filters out models with larger context windows. Use to find smaller, faster models.",
    )
    .optional(),
  max_price_per_m: z
    .number()
    .min(0)
    .describe(
      "Maximum acceptable price per million input tokens in USD (e.g., 0.5 for $0.50/M tokens). Filters out more expensive models. Note: only considers input pricing for filtering.",
    )
    .optional(),
  capabilities: z
    .array(z.enum(["vision", "audio", "tool_calling", "json_mode", "video"]))
    .describe(
      "Required capabilities array - model must support ALL specified capabilities (AND logic). Examples: ['vision'] for image input, ['tool_calling', 'json_mode'] for structured outputs, ['vision', 'tool_calling'] for multimodal agents. Available: vision, audio, tool_calling, json_mode, video.",
    )
    .optional(),
  sort_by: z
    .enum(["relevance", "price_asc", "price_desc", "date_desc", "context_desc"])
    .default("relevance")
    .describe(
      "Sort order for results. Options: 'relevance' (best semantic match, default), 'price_asc' (cheapest first by input price), 'price_desc' (most expensive first), 'date_desc' (newest models first), 'context_desc' (largest context window first). Defaults to 'relevance'.",
    )
    .optional(),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(10)
    .describe(
      "Maximum number of results to return (1-100). Defaults to 10. Use higher values (20-50) for broad exploration, lower values (5-10) for focused comparisons.",
    ),
  offset: z
    .number()
    .min(0)
    .default(0)
    .describe(
      "Number of results to skip for pagination (0-based). Defaults to 0. Example: offset=10 with limit=10 returns results 11-20. Use with 'total' in response for pagination.",
    ),
});

/**
 * Get Model Tool Schema
 * Retrieve complete details for a specific model
 */
export const getModelSchema = z.object({
  model_id: z
    .string()
    .min(1)
    .describe(
      "Exact model identifier in format 'provider/model-name' (e.g., 'openai/gpt-5.2', 'anthropic/claude-opus-4.5', 'google/gemini-2.5-flash-preview-09-2025'). Case-sensitive. Use find_models first to discover valid model IDs. Returns 404 if model not found.",
    ),
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
    .describe(
      "Array of 1-5 model IDs to test simultaneously in format 'provider/model-name' (e.g., ['openai/gpt-5.1-codex-max', 'anthropic/claude-haiku-4.5']). All models receive identical prompts. Use find_models or get_model first to identify model IDs.",
    ),
  test_type: z
    .enum(["quick", "code", "reasoning", "instruction", "tool_calling"])
    .default("quick")
    .describe(
      "Preset test scenario. Ignored if custom 'prompt' provided. Options: 'quick' (simple math, fastest), 'code' (function generation), 'reasoning' (logic puzzle), 'instruction' (following complex directions), 'tool_calling' (function calling capability). Defaults to 'quick'.",
    ),
  prompt: z
    .string()
    .describe(
      "Custom user message to send to all models. Overrides 'test_type' when provided. Use for debugging specific issues, comparing exact outputs, or testing domain-specific prompts. Example: 'Write a Python function to validate email addresses'.",
    )
    .optional(),
  max_tokens: z
    .number()
    .min(1)
    .max(8192)
    .default(1000)
    .describe(
      "Maximum tokens for model response (1-8192). Higher values allow longer outputs but increase cost and latency. Defaults to 1000. Use 100-500 for quick tests, 1000-2000 for code/reasoning, 4000+ for long-form content.",
    )
    .optional(),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .describe(
      "Sampling temperature (0-2). Lower values are more deterministic, higher values more creative. Defaults to 0.7.",
    )
    .optional(),
  system_prompt: z
    .string()
    .max(4000)
    .describe(
      "System message to set model behavior. Example: 'You are a helpful coding assistant.'",
    )
    .optional(),
});

/**
 * Output Schemas for Tool Results
 * Define expected return structures for better LLM understanding
 */
export const findModelsOutputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      score: z.number(),
      provider: z.string(),
      context_window: z.number().nullable(),
      pricing: z.object({
        input: z.number().nullable(),
        output: z.number().nullable(),
      }),
      capabilities: z.object({
        vision: z.boolean().nullable(),
        audio: z.boolean().nullable(),
        tool_calling: z.boolean().nullable(),
        json_mode: z.boolean().nullable(),
        video: z.boolean().nullable(),
      }),
      matched_features: z.array(z.string()).optional(),
      hugging_face_id: z.string().nullable().optional(),
      release_date: z.string().nullable().optional(),
    }),
  ),
  total: z.number().optional(),
});

export const getModelOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  description: z.string().nullable(),
  family: z.string().nullable(),
  version: z.string().nullable(),
  release_date: z.string().nullable(),
  limits: z.object({
    context_window: z.number(),
    max_output_tokens: z.number().nullable(),
  }),
  pricing: z.object({
    input: z.number().nullable(),
    output: z.number().nullable(),
  }),
  extended_pricing: z
    .object({
      image: z.number().nullable(),
      audio: z.number().nullable(),
      web_search: z.number().nullable(),
      cache_read: z.number().nullable(),
      cache_write: z.number().nullable(),
      discount: z.number().nullable(),
      internal_reasoning: z.number().nullable(),
    })
    .nullable(),
  capabilities: z.object({
    vision: z.boolean(),
    audio: z.boolean(),
    tool_calling: z.boolean(),
    json_mode: z.boolean(),
    video: z.boolean(),
    function_calling: z.boolean(),
    custom: z.array(z.string()),
  }),
  supported_parameters: z.array(z.string()),
  is_moderated: z.boolean(),
  input_modalities: z.array(z.string()),
  output_modalities: z.array(z.string()),
  architecture: z.object({
    tokenizer: z.string().nullable(),
    instruct_type: z.string().nullable(),
  }),
  per_request_limits: z
    .object({
      prompt_tokens: z.number().nullable(),
      completion_tokens: z.number().nullable(),
    })
    .nullable(),
});

export const testModelOutputSchema = z.object({
  test_type: z.string(),
  prompt: z.string(),
  results: z.array(
    z.object({
      model_id: z.string(),
      model_name: z.string(),
      latency_ms: z.number(),
      output: z.string().nullable(),
      tokens_used: z
        .object({
          prompt_tokens: z.number(),
          completion_tokens: z.number(),
          total_tokens: z.number(),
        })
        .nullable(),
      cost_estimate: z.object({
        input_cost: z.number().nullable(),
        output_cost: z.number().nullable(),
        total_cost: z.number().nullable(),
      }),
      tool_calls_detected: z.boolean().optional(),
      tool_calls: z
        .array(
          z.object({
            name: z.string(),
            arguments: z.record(z.string(), z.unknown()),
          }),
        )
        .optional(),
      error: z.string().nullable(),
    }),
  ),
});

// Type exports for TypeScript inference
export type FindModelsInput = z.infer<typeof findModelsSchema>;
export type GetModelInput = z.infer<typeof getModelSchema>;
export type TestModelInput = z.infer<typeof testModelSchema>;
export type FindModelsOutput = z.infer<typeof findModelsOutputSchema>;
export type GetModelOutput = z.infer<typeof getModelOutputSchema>;
export type TestModelOutput = z.infer<typeof testModelOutputSchema>;
