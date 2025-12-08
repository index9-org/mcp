const API_URL = process.env.INDEX9_API_URL || "https://index9.dev/api";
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY || null;

// Configurable timeouts (in milliseconds)
const API_TIMEOUT = parseInt(process.env.INDEX9_API_TIMEOUT || "30000"); // 30 seconds default
const TEST_MODEL_TIMEOUT = parseInt(process.env.TEST_MODEL_TIMEOUT || "120000"); // 2 minutes for testing

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"); // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"); // requests per window

export {
  API_URL,
  OPEN_ROUTER_API_KEY,
  API_TIMEOUT,
  TEST_MODEL_TIMEOUT,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
};
