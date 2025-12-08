import axios, { type AxiosError } from "axios";
import { API_URL, API_TIMEOUT, TEST_MODEL_TIMEOUT } from "./config.js";
import type {
  ListModelsResponse,
  GetModelResponse,
  SearchModelsResponse,
  CompareModelsResponse,
  RecommendModelResponse,
  TestModelResponse,
  ListModelsQueryParams,
} from "./types/index.js";

const createAxiosClient = (timeout: number) => {
  const client = axios.create({ baseURL: API_URL, timeout });

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 404) {
        const message = error.response?.data?.message || "Resource not found";
        throw new Error(message);
      }
      const message =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED" ? `Request timeout` : null) ||
        (error.code === "ECONNREFUSED" ? `Unable to connect to API server` : null) ||
        error.message;
      throw new Error(message);
    },
  );

  return client;
};

const client = createAxiosClient(API_TIMEOUT);
const testClient = createAxiosClient(TEST_MODEL_TIMEOUT); // test operations with longer timeout

export async function listModels(params: ListModelsQueryParams): Promise<ListModelsResponse> {
  const { data } = await client.get<ListModelsResponse>("/models", { params });
  return data;
}

export async function getModel(modelId: string): Promise<GetModelResponse> {
  const { data } = await client.get<GetModelResponse>(`/models/${encodeURIComponent(modelId)}`);
  return data;
}

export async function searchModels(
  query: string,
  limit?: number,
  threshold?: number,
): Promise<SearchModelsResponse> {
  const { data } = await client.post<SearchModelsResponse>("/search", {
    query,
    limit,
    threshold,
  });
  return data;
}

export async function compareModels(modelIds: string[]): Promise<CompareModelsResponse> {
  const { data } = await client.post<CompareModelsResponse>("/models/compare", {
    model_ids: modelIds,
  });
  return data;
}

export async function recommendModel(
  useCase: string,
  maxPrice?: number,
  minContext?: number,
  requiredCapabilities?: string[],
  limit?: number,
): Promise<RecommendModelResponse> {
  const { data } = await client.post<RecommendModelResponse>("/models/recommend", {
    use_case: useCase,
    max_price_per_m: maxPrice,
    min_context: minContext,
    required_capabilities: requiredCapabilities,
    limit,
  });
  return data;
}

export async function testModel(
  modelIds: string[],
  testType?: "quick" | "code" | "reasoning" | "instruction" | "tool_calling",
  openRouterApiKey?: string | null,
): Promise<TestModelResponse> {
  const { data } = await testClient.post<TestModelResponse>("/test", {
    model_ids: modelIds,
    test_type: testType,
    open_router_api_key: openRouterApiKey || undefined,
  });
  return data;
}
