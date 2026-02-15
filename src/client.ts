const RETRY_DELAYS_MS = [1000, 2000, 4000];

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    const res = await fetch(url, options);
    lastResponse = res;
    if (res.ok || !isRetryable(res.status)) return res;
    if (i < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[i]);
    }
  }
  return lastResponse!;
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
