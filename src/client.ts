const DEFAULT_RETRY_DELAYS_MS = [1000, 2000, 4000];
const DEFAULT_ATTEMPT_TIMEOUT_MS = 30_000;

export interface FetchWithRetryOptions {
  // Per-attempt deadline. test_model overrides this to ~240s because live
  // inference can legitimately take that long; read-only tools keep the 30s
  // default so a stuck API never blocks the agent.
  attemptTimeoutMs?: number;
  // Number of retries AFTER the first attempt. test_model passes 0 because
  // inference is non-idempotent — retrying burns OpenRouter credits and
  // amplifies upstream capacity errors. Server-side per-model retries handle
  // anything genuinely transient.
  maxRetries?: number;
}

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError" || error.name === "TimeoutError") return true;
  return error instanceof TypeError;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Unknown error";
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions?: FetchWithRetryOptions,
): Promise<Response> {
  const attemptTimeoutMs = retryOptions?.attemptTimeoutMs ?? DEFAULT_ATTEMPT_TIMEOUT_MS;
  const maxRetries = Math.max(0, retryOptions?.maxRetries ?? DEFAULT_RETRY_DELAYS_MS.length);
  const retryDelaysMs = DEFAULT_RETRY_DELAYS_MS.slice(0, maxRetries);

  let lastResponse: Response | null = null;
  let lastError: unknown;

  for (let i = 0; i <= maxRetries; i++) {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort(new DOMException("Request timed out", "AbortError"));
    }, attemptTimeoutMs);

    const externalSignal = options.signal;
    const onAbort = () => {
      timeoutController.abort(
        externalSignal?.reason ?? new DOMException("Request aborted", "AbortError"),
      );
    };

    if (externalSignal?.aborted) {
      onAbort();
    } else {
      externalSignal?.addEventListener("abort", onAbort, { once: true });
    }

    try {
      const res = await fetch(url, { ...options, signal: timeoutController.signal });
      lastResponse = res;
      if (res.ok || !isRetryable(res.status)) return res;
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) {
        throw new Error(`Request failed: ${toErrorMessage(error)}`);
      }
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", onAbort);
    }

    if (i < retryDelaysMs.length) {
      await sleep(retryDelaysMs[i]);
    }
  }

  if (lastResponse) return lastResponse;
  throw new Error(`Request failed after ${maxRetries + 1} attempts: ${toErrorMessage(lastError)}`);
}

export function buildUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, baseUrl);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }
  return url.toString();
}
