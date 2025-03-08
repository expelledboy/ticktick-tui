import { debug, error } from "../logs";

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 10, // Maximum number of requests per minute (reduced from 15)
  delayBetweenRequests: 3000, // Minimum delay between requests (increased from 1000ms to 3000ms)
  backoffMultiplier: 2, // How much to multiply backoff on rate limit errors
  lastRequestTime: 0, // Timestamp of the last request
  retryCount: 0, // Counter for rate limit errors to adjust backoff
  maxRetries: 5, // Maximum number of retries before giving up
};

/**
 * Enforce rate limits to prevent exceed_query_limit errors
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - RATE_LIMIT.lastRequestTime;

  // Calculate delay based on current backoff level
  let currentDelay = RATE_LIMIT.delayBetweenRequests;

  if (RATE_LIMIT.retryCount > 0) {
    // Apply exponential backoff when we've hit rate limits
    currentDelay =
      currentDelay *
      Math.pow(RATE_LIMIT.backoffMultiplier, RATE_LIMIT.retryCount);

    debug(
      `Rate limit backoff level ${RATE_LIMIT.retryCount}: Using ${currentDelay}ms delay`
    );
  }

  // If we haven't waited long enough, delay the request
  if (timeSinceLastRequest < currentDelay) {
    const waitTime = currentDelay - timeSinceLastRequest;
    debug(`Rate limiting: waiting ${waitTime}ms before next request`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Update last request time
  RATE_LIMIT.lastRequestTime = Date.now();
}

let authToken: string | null = null;

// Create a custom error handler that provides cleaner errors
export class ApiError extends Error {
  statusCode?: number;
  endpoint?: string;

  constructor(message: string, statusCode?: number, endpoint?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

/**
 * Make an API request with proper error handling
 */
export const makeRequest = async <T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> => {
  if (!authToken) {
    throw new ApiError("No authentication token found", 500, path);
  }

  await enforceRateLimit();

  const requestOptions: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  };

  if (body) requestOptions.body = JSON.stringify(body);

  const url = `${config.services.ticktickUri}${path}`;
  const response = await fetchRetry(url, requestOptions);

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
      url
    );
  }

  return response.json() as Promise<T>;
};

/**
 * Retry a request with exponential backoff
 */
async function fetchRetry(
  url: string,
  options: RequestInit,
  retries = RATE_LIMIT.maxRetries,
  delay = RATE_LIMIT.delayBetweenRequests
) {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (isRateLimitError(error)) {
        if (i === retries - 1) {
          debug(`⚠️ Reached maximum retries (${retries}) for ${url}`);
          throw error;
        } else {
          debug(`Rate limit error on attempt ${i + 1}/${retries}`);
          debug(`Retrying ${url} after ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw (
    lastError || new ApiError(`Failed to fetch ${url} after ${retries} retries`)
  );
}

const isRateLimitError = (error: unknown): boolean =>
  error instanceof ApiError && error.statusCode === 429;

export const setAuthToken = (token: string) => {
  authToken = token;
};
