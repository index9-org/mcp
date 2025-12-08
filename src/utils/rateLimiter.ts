import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "../config.js";

const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if a tool request should be rate limited
 * @param toolName - The tool name (e.g., "list_models", "search_models")
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(toolName: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(toolName);

  if (!current || now > current.resetTime) {
    requestCounts.set(toolName, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count++;
  return true;
}
