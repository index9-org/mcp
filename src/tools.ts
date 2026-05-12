import {
  API_PATHS,
  BatchModelLookupRequestSchema,
  BatchModelLookupResponseSchema,
  CompareRequestSchema,
  CompareResponseSchema,
  FacetsResponseSchema,
  SearchQuerySchema,
  SearchResponseSchema,
  TestRequestSchema,
  TestResponseSchema,
} from "@index9/core";
import type { ZodType } from "zod";
import { buildUrl, fetchWithRetry } from "./client.js";

type ToolContext = {
  baseUrl: string;
  apiToken: string | undefined;
  openRouterApiKey: string | undefined;
};

type ToolResponse = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

type RateLimitMeta = {
  limit?: string;
  remaining?: string;
  reset?: string;
};

type Index9Meta = {
  apiBaseUrl: string;
  retryAfterSeconds?: number;
  rateLimit?: RateLimitMeta;
};

function baseHeaders(ctx: ToolContext): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (ctx.apiToken) h["Authorization"] = `Bearer ${ctx.apiToken}`;
  return h;
}

function toResponse(payload: unknown, isError = false): ToolResponse {
  const response: ToolResponse = {
    content: [{ type: "text", text: JSON.stringify(payload) }],
    isError: isError || undefined,
  };
  if (!isError && typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
    response.structuredContent = payload as Record<string, unknown>;
  }
  return response;
}

function parseRetryAfterSeconds(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);

  const retryAt = Date.parse(trimmed);
  if (!Number.isFinite(retryAt)) return undefined;
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
}

function buildMeta(ctx: ToolContext, headers?: Headers): Index9Meta {
  const meta: Index9Meta = { apiBaseUrl: ctx.baseUrl };
  if (!headers) return meta;

  const retryAfterSeconds = parseRetryAfterSeconds(headers.get("retry-after"));
  if (retryAfterSeconds !== undefined) meta.retryAfterSeconds = retryAfterSeconds;

  const rateLimit: RateLimitMeta = {
    limit: headers.get("x-ratelimit-limit")?.trim() || undefined,
    remaining: headers.get("x-ratelimit-remaining")?.trim() || undefined,
    reset: headers.get("x-ratelimit-reset")?.trim() || undefined,
  };
  if (rateLimit.limit || rateLimit.remaining || rateLimit.reset) {
    meta.rateLimit = rateLimit;
  }

  return meta;
}

function withMeta(ctx: ToolContext, payload: unknown, headers?: Headers): Record<string, unknown> {
  const base =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : { data: payload };
  return { ...base, _index9: buildMeta(ctx, headers) };
}

function extractError(body: unknown): string {
  if (typeof body === "object" && body !== null) {
    const err = (body as { error?: unknown }).error;
    if (typeof err === "string" && err.length > 0) return err;
  }
  return "Request failed";
}

// Diagnostic fields the API attaches to 4xx recovery responses (e.g. compare's
// "fewer than 2 resolvable" 400, test_model's "no resolvable ids" 400). Pass
// them through to the MCP client so an LLM can retry with `suggestions[id][0].id`
// instead of seeing a bare error string.
const RECOVERY_FIELDS = [
  "missingIds",
  "resolvedAliases",
  "ambiguousAliases",
  "suggestions",
  "missingDiagnostics",
] as const;

function extractRecoveryFields(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return {};
  const out: Record<string, unknown> = {};
  const b = body as Record<string, unknown>;
  for (const key of RECOVERY_FIELDS) {
    if (key in b) out[key] = b[key];
  }
  return out;
}

async function callApi(
  ctx: ToolContext,
  url: string,
  options: RequestInit,
  responseSchema: ZodType,
): Promise<ToolResponse> {
  const res = await fetchWithRetry(url, options);

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = { error: "Invalid API response body" };
  }

  if (!res.ok) {
    return toResponse(
      {
        error: extractError(body),
        status: res.status,
        ...extractRecoveryFields(body),
        _index9: buildMeta(ctx, res.headers),
      },
      true,
    );
  }

  const validated = responseSchema.safeParse(body);
  if (!validated.success) {
    return toResponse(withMeta(ctx, { error: "Invalid API response" }, res.headers), true);
  }
  return toResponse(withMeta(ctx, validated.data, res.headers));
}

export async function handleSearchModels(ctx: ToolContext, args: unknown): Promise<ToolResponse> {
  const parsed = SearchQuerySchema.safeParse(args);
  if (!parsed.success) {
    return toResponse({ error: parsed.error.message }, true);
  }

  const q = parsed.data;
  const params: Record<string, string> = {};
  if (q.q) params.q = q.q;
  params.limit = String(q.limit);
  if (q.cursor) params.cursor = q.cursor;
  params.sortBy = q.sortBy;
  if (q.sortOrder) params.sortOrder = q.sortOrder;
  if (q.createdAfter) params.createdAfter = q.createdAfter;
  if (q.createdBefore) params.createdBefore = q.createdBefore;
  if (q.minPrice !== undefined) params.minPrice = String(q.minPrice);
  if (q.maxPrice !== undefined) params.maxPrice = String(q.maxPrice);
  if (q.minContext !== undefined) params.minContext = String(q.minContext);
  if (q.capabilitiesAll?.length) params.capabilitiesAll = q.capabilitiesAll.join(",");
  if (q.capabilitiesAny?.length) params.capabilitiesAny = q.capabilitiesAny.join(",");
  if (q.modality) params.modality = q.modality;
  if (q.provider?.length) params.provider = q.provider.join(",");
  if (q.excludeFree === true) params.excludeFree = "true";
  if (q.requireKeywordMatch === true) params.requireKeywordMatch = "true";

  return callApi(
    ctx,
    buildUrl(ctx.baseUrl, API_PATHS.search, params),
    { method: "GET", headers: baseHeaders(ctx) },
    SearchResponseSchema,
  );
}

export async function handleGetModels(ctx: ToolContext, args: unknown): Promise<ToolResponse> {
  const parsed = BatchModelLookupRequestSchema.safeParse(args);
  if (!parsed.success) {
    return toResponse({ error: parsed.error.message }, true);
  }

  return callApi(
    ctx,
    `${ctx.baseUrl}${API_PATHS.model}`,
    {
      method: "POST",
      headers: baseHeaders(ctx),
      body: JSON.stringify(parsed.data),
    },
    BatchModelLookupResponseSchema,
  );
}

export async function handleCompareModels(ctx: ToolContext, args: unknown): Promise<ToolResponse> {
  const parsed = CompareRequestSchema.safeParse(args);
  if (!parsed.success) {
    return toResponse({ error: parsed.error.message }, true);
  }

  return callApi(
    ctx,
    `${ctx.baseUrl}${API_PATHS.compare}`,
    {
      method: "POST",
      headers: baseHeaders(ctx),
      body: JSON.stringify(parsed.data),
    },
    CompareResponseSchema,
  );
}

export async function handleListFacets(ctx: ToolContext, _args: unknown): Promise<ToolResponse> {
  return callApi(
    ctx,
    `${ctx.baseUrl}${API_PATHS.facets}`,
    { method: "GET", headers: baseHeaders(ctx) },
    FacetsResponseSchema,
  );
}

export async function handleTestModels(ctx: ToolContext, args: unknown): Promise<ToolResponse> {
  const parsed = TestRequestSchema.safeParse(args);
  if (!parsed.success) {
    return toResponse({ error: parsed.error.message }, true);
  }

  if (parsed.data.dryRun !== true && !ctx.openRouterApiKey) {
    return toResponse(
      {
        error:
          "OPENROUTER_API_KEY is required for live test_model calls. Set dryRun=true to estimate without a key.",
      },
      true,
    );
  }

  const reqHeaders = baseHeaders(ctx);
  if (parsed.data.dryRun !== true && ctx.openRouterApiKey) {
    reqHeaders["x-openrouter-api-key"] = ctx.openRouterApiKey;
  }

  return callApi(
    ctx,
    `${ctx.baseUrl}${API_PATHS.test}`,
    { method: "POST", headers: reqHeaders, body: JSON.stringify(parsed.data) },
    TestResponseSchema,
  );
}
