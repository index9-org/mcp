const DEFAULT_BASE_URL = "https://index9.dev";

export function loadConfig(): {
  baseUrl: string;
  apiToken: string | undefined;
  openRouterApiKey: string | undefined;
} {
  const env = process.env.INDEX9_API_BASE_URL?.trim();
  const baseUrl = env || DEFAULT_BASE_URL;
  const normalized = baseUrl.replace(/\/$/, "");
  return {
    baseUrl: normalized,
    apiToken: process.env.INDEX9_API_TOKEN?.trim() || undefined,
    openRouterApiKey:
      process.env.OPENROUTER_API_KEY?.trim() ||
      process.env.API_KEY_OPENROUTERAPIKEY?.trim() ||
      undefined,
  };
}
