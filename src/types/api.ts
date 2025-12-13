/**
 * API Types - Request and response types for HTTP API endpoints
 */

import type {
  ListModelsFilters,
  ModelPricing,
  ModelCapabilities,
  ModelArchitecture,
  ExtendedPricing,
  PerRequestLimits,
} from "./models.js";

// List Models
export interface ListModelsQueryParams extends ListModelsFilters {
  owner?: string;
}

export interface ListModelsResponse {
  models: Array<{
    id: string;
    name: string;
    provider: string;
    context_window: number | null;
    max_output_tokens: number | null;
    input_modalities: string[];
    output_modalities: string[];
    pricing: ModelPricing;
    capabilities: ModelCapabilities;
    architecture: Pick<ModelArchitecture, "tokenizer">;
  }>;
}

export interface GetModelCapabilities {
  vision: boolean;
  audio: boolean;
  tool_calling: boolean;
  json_mode: boolean;
  video: boolean;
  function_calling: boolean;
  custom: string[];
}

export interface GetModelResponse {
  id: string;
  name: string;
  provider: string;
  description: string | null;
  family: string | null;
  version: string | null;
  release_date: string | null;
  limits: {
    context_window: number;
    max_output_tokens: number | null;
  };
  pricing: ModelPricing;
  extended_pricing: ExtendedPricing | null;
  capabilities: GetModelCapabilities;
  supported_parameters: string[];
  is_moderated: boolean;
  input_modalities: string[];
  output_modalities: string[];
  architecture: ModelArchitecture;
  per_request_limits: PerRequestLimits | null;
}

// Search Models
export interface SearchModelsRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface SearchModelCapabilities {
  vision: boolean | null;
  audio: boolean | null;
  tool_calling: boolean | null;
  json_mode: boolean | null;
  video: boolean | null;
}

export interface SearchModelsResponse {
  results: Array<{
    id: string;
    name: string;
    description: string | null;
    similarity: number;
    provider: string;
    context_window: number | null;
    pricing: ModelPricing;
    capabilities: SearchModelCapabilities;
  }>;
}

// Find Models (unified search + filter)
export interface FindModelsRequest {
  query?: string;
  provider?: string;
  min_context?: number;
  max_context?: number;
  max_price_per_m?: number;
  capabilities?: string[];
  sort_by?: "relevance" | "price_asc" | "price_desc" | "date_desc" | "context_desc";
  limit?: number;
  offset?: number;
}

export interface FindModelsResponse {
  results: Array<{
    id: string;
    name: string;
    description: string | null;
    score: number;
    provider: string;
    context_window: number | null;
    pricing: ModelPricing;
    capabilities: SearchModelCapabilities;
    matched_features?: string[];
    hugging_face_id?: string | null;
    release_date: string | null;
  }>;
  total?: number;
}

// Test Model
export interface TestModelRequest {
  model_ids: string[];
  test_type?: "quick" | "code" | "reasoning" | "instruction" | "tool_calling";
  custom_prompt?: string;
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface TokensUsed {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CostEstimate {
  input_cost: number | null;
  output_cost: number | null;
  total_cost: number | null;
}

export interface TestModelResult {
  model_id: string;
  model_name: string;
  latency_ms: number;
  output: string | null;
  tokens_used: TokensUsed | null;
  cost_estimate: CostEstimate;
  tool_calls_detected?: boolean;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
  error: string | null;
}

export interface TestModelResponse {
  test_type: string;
  prompt: string;
  results: TestModelResult[];
}
