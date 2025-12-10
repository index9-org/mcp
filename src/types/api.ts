/**
 * API Types - Request and response types for HTTP API endpoints
 */

import type {
  ListModelsFilters,
  ModelPricing,
  ModelCapabilities,
  ModelArchitecture,
  ExtendedPricing,
  ModelLimits,
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

export interface DeploymentPricing {
  input: number | null;
  output: number | null;
}

export interface Deployment {
  platform: string;
  model_id: string;
  is_available: boolean;
  pricing: ModelPricing;
}

export interface GetModelCapabilities extends Omit<ModelCapabilities, "audio"> {
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
  deployments: Deployment[];
}

// Search Models
export interface SearchModelsRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface SearchModelCapabilities {
  vision: boolean | null;
  tool_calling: boolean | null;
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

// Compare Models
export interface CompareModelsRequest {
  model_ids: string[];
}

export interface CompareModelCapabilities {
  vision: boolean | null;
  tool_calling: boolean | null;
  custom: string[];
}

export interface CompareModelsResponse {
  models: Array<{
    id: string;
    name: string;
    provider: string;
    limits: ModelLimits;
    pricing: ModelPricing;
    capabilities: CompareModelCapabilities;
    deployments: Deployment[];
  }>;
  not_found?: string[];
  suggestions?: Record<string, Array<{ id: string; name: string; similarity: number }>>;
}

// Recommend Model
export interface RecommendModelRequest {
  use_case: string;
  max_price_per_m?: number;
  min_context?: number;
  required_capabilities?: string[];
  limit?: number;
}

export interface RecommendModelResponse {
  use_case: string;
  recommendations: Array<{
    id: string;
    name: string;
    score: number;
    context_window: number | null;
    pricing: ModelPricing;
    confidence?: "high" | "medium" | "low";
    matched_features?: string[];
    pricing_available: boolean;
  }>;
  suggestions?: string[];
  warning?: string;
}

// Test Model
export interface TestModelRequest {
  model_ids: string[];
  test_type?: "quick" | "code" | "reasoning" | "instruction" | "tool_calling";
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
  error: string | null;
}

export interface TestModelResponse {
  test_type: string;
  prompt: string;
  results: TestModelResult[];
}
