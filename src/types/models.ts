/**
 * Model Types - Normalized model interface for OpenRouter models
 */

export interface ModelPricing {
  input: number | null;
  output: number | null;
}

export interface ModelCapabilities {
  vision: boolean;
  audio: boolean;
  tool_calling: boolean;
  json_mode: boolean;
}

export interface ModelArchitecture {
  tokenizer: string | null;
  instruct_type: string | null;
}

export interface ExtendedPricing {
  image: number | null;
  audio: number | null;
  web_search: number | null;
  cache_read: number | null;
  cache_write: number | null;
  discount: number | null;
  internal_reasoning: number | null;
}

export interface PerRequestLimits {
  prompt_tokens: number | null;
  completion_tokens: number | null;
}

export interface NormalizedModel {
  id: string; // canonical: "openai/gpt-4o"
  name: string;
  provider: string;
  context_window: number | null;
  max_output_tokens: number | null;
  pricing: ModelPricing;
  capabilities: ModelCapabilities;
  description: string | null;
  release_date: string | null;
  input_modalities: string[]; // ["text", "image", "audio", "video", "file"]
  output_modalities: string[]; // ["text", "image", "embeddings"]
  supported_parameters: string[];
  architecture: ModelArchitecture;
  extended_pricing: ExtendedPricing | null;
  is_moderated: boolean;
  per_request_limits: PerRequestLimits | null;
  hugging_face_id: string | null;
}

export interface ProviderAdapter {
  id: string;
  name: string;
  fetchModels(): Promise<NormalizedModel[]>;
}

export interface ListModelsFilters {
  provider?: string;
  min_context?: number;
  modality?: "text" | "vision" | "audio" | "video" | "image";
  max_price_per_m?: number;
  supports_tool_calling?: boolean;
  supports_json_mode?: boolean;
  tokenizer?: string;
  output_modality?: "text" | "image" | "embeddings";
  limit?: number;
}
