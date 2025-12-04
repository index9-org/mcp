import { z } from "zod";

export const listModelsSchema = z.object({
  provider: z.string().optional(),
  owner: z.string().optional(),
  min_context: z.number().min(0).optional(),
  modality: z.enum(["text", "vision", "audio", "video", "image"]).optional(),
  supports_tool_calling: z.boolean().optional(),
  supports_json_mode: z.boolean().optional(),
  tokenizer: z.string().optional(),
  output_modality: z.enum(["text", "image", "embeddings"]).optional(),
  max_price_per_m: z.number().min(0).optional(),
  limit: z.number().min(1).max(100).default(10),
});

export const searchModelsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.5),
});

export const getModelSchema = z.object({
  model_id: z.string().min(1),
});

export const compareModelsSchema = z.object({
  model_ids: z.array(z.string()).min(2).max(10),
});

export const recommendModelSchema = z.object({
  use_case: z.string().min(1),
  max_price_per_m: z.number().min(0).optional(),
  min_context: z.number().min(0).optional(),
  required_capabilities: z.array(z.string()).optional(),
  limit: z.number().min(1).max(20).default(5),
});

export const testModelSchema = z.object({
  model_ids: z.array(z.string()).min(1).max(5),
  test_type: z.enum(["quick", "code", "reasoning", "instruction", "tool_calling"]).default("quick"),
});

export type ListModelsInput = z.infer<typeof listModelsSchema>;
export type SearchModelsInput = z.infer<typeof searchModelsSchema>;
export type GetModelInput = z.infer<typeof getModelSchema>;
export type CompareModelsInput = z.infer<typeof compareModelsSchema>;
export type RecommendModelInput = z.infer<typeof recommendModelSchema>;
export type TestModelInput = z.infer<typeof testModelSchema>;
