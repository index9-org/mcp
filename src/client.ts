const RETRY_DELAYS_MS = [1000, 2000, 4000];
const ATTEMPT_TIMEOUT_MS = 30_000;

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

export async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  let lastError: unknown;

  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort(new DOMException("Request timed out", "AbortError"));
    }, ATTEMPT_TIMEOUT_MS);

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

    if (i < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }

  if (lastResponse) return lastResponse;
  throw new Error(
    `Request failed after ${RETRY_DELAYS_MS.length + 1} attempts: ${toErrorMessage(lastError)}`,
  );
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
