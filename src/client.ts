import axios, { type AxiosError } from "axios";
import { API_URL, API_TIMEOUT, TEST_MODEL_TIMEOUT } from "./config.js";
import type {
  GetModelResponse,
  FindModelsResponse,
  FindModelsRequest,
  TestModelResponse,
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

export async function findModels(params: FindModelsRequest): Promise<FindModelsResponse> {
  const { data } = await client.post<FindModelsResponse>("/models/find", params);
  return data;
}

export async function getModel(modelId: string): Promise<GetModelResponse> {
  const { data } = await client.get<GetModelResponse>(`/models/${encodeURIComponent(modelId)}`);
  return data;
}

export async function testModel(
  modelIds: string[],
  testType?: "quick" | "code" | "reasoning" | "instruction" | "tool_calling",
  openRouterApiKey?: string | null,
  prompt?: string,
  maxTokens?: number,
): Promise<TestModelResponse> {
  const { data } = await testClient.post<TestModelResponse>("/test", {
    model_ids: modelIds,
    test_type: testType,
    custom_prompt: prompt,
    open_router_api_key: openRouterApiKey || undefined,
    max_tokens: maxTokens,
  });
  return data;
}
