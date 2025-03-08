/**
 * OAuth2 Authentication Handler
 *
 * This module implements the OAuth2 authorization code flow for TickTick API authentication.
 * It provides utilities for authorization, token exchange, and refresh without handling storage.
 */
import open from "open";
import http from "http";
import { URL } from "url";
import { debug, info, error } from "../logs";

// Constants
const TICKTICK_AUTH_URL = "https://ticktick.com/oauth/authorize";
const TICKTICK_TOKEN_URL = "https://ticktick.com/oauth/token";
const TICKTICK_TOKEN_SCOPES = "tasks:read tasks:write";
const DEFAULT_REDIRECT_URI = "http://localhost:8000/callback";

/**
 * OAuth2 Tokens interface
 */
export interface OAuth2Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expiry_time?: number; // Calculated expiry timestamp
}

/**
 * OAuth2 Configuration interface
 */
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  scopes?: string;
}

/**
 * Check if access token is expired
 */
export const isTokenExpired = (tokens: OAuth2Tokens | null): boolean => {
  if (!tokens?.expiry_time) {
    return true;
  }

  // Consider token expired 5 minutes before actual expiry
  const expiryBuffer = 5 * 60 * 1000;
  return Date.now() > tokens.expiry_time - expiryBuffer;
};

/**
 * Generate a random state parameter for CSRF protection
 */
export const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Get the authorization URL for starting the OAuth flow
 */
export const getAuthorizationUrl = (config: OAuth2Config): string => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    scope: config.scopes || TICKTICK_TOKEN_SCOPES,
    redirect_uri: config.redirectUri || DEFAULT_REDIRECT_URI,
    state: generateState(),
  });

  return `${TICKTICK_AUTH_URL}?${params.toString()}`;
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeCodeForTokens = async (
  code: string,
  config: OAuth2Config
): Promise<OAuth2Tokens> => {
  debug(`Exchanging authorization code for tokens`);
  const redirectUri = config.redirectUri || DEFAULT_REDIRECT_URI;

  const response = await fetch(TICKTICK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMsg = `Token exchange failed: ${response.status} - ${errorText}`;
    error(errorMsg);
    throw new Error(errorMsg);
  }

  const tokens = (await response.json()) as OAuth2Tokens;

  // Add expiry time for easier checks later
  if (tokens.expires_in) {
    tokens.expiry_time = Date.now() + tokens.expires_in * 1000;
  }

  debug("Successfully received tokens");
  return tokens;
};

/**
 * Refresh access token using the refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string,
  config: OAuth2Config
): Promise<OAuth2Tokens> => {
  debug("Refreshing access token");

  const response = await fetch(TICKTICK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMsg = `Token refresh failed: ${response.status} - ${errorText}`;
    error(errorMsg);
    throw new Error(errorMsg);
  }

  const tokens = (await response.json()) as OAuth2Tokens;

  // Add expiry time for easier checks later
  if (tokens.expires_in) {
    tokens.expiry_time = Date.now() + tokens.expires_in * 1000;
  }

  debug("Successfully refreshed tokens");
  return tokens;
};

/**
 * Process callback URL with authorization code
 */
export const handleCallback = async (
  callbackUrl: string,
  config: OAuth2Config
): Promise<OAuth2Tokens> => {
  debug(`Processing callback URL: ${callbackUrl}`);
  const url = new URL(callbackUrl);
  const code = url.searchParams.get("code");

  if (!code) {
    const errorMsg = "No authorization code found in callback URL";
    error(errorMsg);
    throw new Error(errorMsg);
  }

  // Exchange code for tokens
  return exchangeCodeForTokens(code, config);
};

/**
 * Generate HTML response for OAuth results
 */
const generateHtmlResponse = (
  title: string,
  message: string,
  statusCode: number = 200
): { statusCode: number; html: string } => {
  return {
    statusCode,
    html: `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 500px;
              margin: 0 auto;
              padding: 2rem;
            }
            h1 {
              color: ${statusCode >= 400 ? "#e53e3e" : "#38a169"};
            }
            p {
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${message}</p>
          <p>You can close this window now.</p>
        </body>
      </html>
    `,
  };
};

/**
 * Send HTML response to client
 */
const sendHtmlResponse = (
  res: http.ServerResponse,
  response: { statusCode: number; html: string }
): void => {
  res.writeHead(response.statusCode, { "Content-Type": "text/html" });
  res.end(response.html);
};

/**
 * Create an HTTP server for handling OAuth callbacks
 */
const createCallbackServer = (
  callbackPath: string,
  handleRequest: (
    code: string,
    errorParam: string | null,
    req: http.IncomingMessage,
    res: http.ServerResponse
  ) => Promise<void>
): http.Server => {
  return http.createServer(async (req, res) => {
    try {
      // Only process requests to the callback path
      if (req.url?.startsWith(callbackPath)) {
        debug(`Received callback: ${req.url}`);

        // Extract code and error from URL
        const parsedUrl = new URL(`http://localhost${req.url}`);
        const code = parsedUrl.searchParams.get("code");
        const errorParam = parsedUrl.searchParams.get("error");

        await handleRequest(code ?? "", errorParam, req, res);
      } else {
        // For any other path, return 404
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      error("Error handling callback:", errorMsg);

      const response = generateHtmlResponse(
        "Server Error",
        "An internal server error occurred.",
        500
      );

      sendHtmlResponse(res, response);
    }
  });
};

/**
 * Launch browser for authorization and start a local server to listen for the callback
 */
export const launchBrowserAuthorization = async (
  config: OAuth2Config,
  onTokensReceived: (tokens: OAuth2Tokens) => Promise<void>
): Promise<OAuth2Tokens> => {
  const authUrl = getAuthorizationUrl(config);

  debug(`Authorization URL: ${authUrl}`);

  setTimeout(() => {
    info("Opening browser for TickTick authorization...");
    open(authUrl);
  }, 200); // Wait for server to start

  // Start local server to listen for the callback
  const tokens = await startLocalServer(config, onTokensReceived);

  info("Waiting for authorization to complete in your browser...");

  return tokens;
};

/**
 * Start local HTTP server to listen for the OAuth callback
 */
const startLocalServer = (
  config: OAuth2Config,
  onTokensReceived: (tokens: OAuth2Tokens) => Promise<void>
): Promise<OAuth2Tokens> => {
  return new Promise((resolve, reject) => {
    // Extract port and path from redirectUri
    const redirectUri = config.redirectUri || DEFAULT_REDIRECT_URI;
    const redirectUrl = new URL(redirectUri);
    const port = parseInt(redirectUrl.port) || 80;
    const callbackPath = redirectUrl.pathname;

    let server: http.Server | null = null;

    debug(
      `Starting local server on port ${port} to listen for callback at ${callbackPath}`
    );

    // Create server for handling OAuth callback
    server = createCallbackServer(
      callbackPath,
      async (code, errorParam, req, res) => {
        if (errorParam) {
          const errorMsg = `Authorization error: ${errorParam}`;
          const response = generateHtmlResponse(
            "Authentication Error",
            errorMsg,
            400
          );

          sendHtmlResponse(res, response);

          reject(new Error(errorMsg));
          closeServer(server);
          return;
        }

        if (!code) {
          const errorMsg = "No authorization code found in callback URL";
          const response = generateHtmlResponse(
            "Authentication Error",
            errorMsg,
            400
          );

          sendHtmlResponse(res, response);

          reject(new Error(errorMsg));
          closeServer(server);
          return;
        }

        try {
          // Exchange code for tokens
          const tokens = await exchangeCodeForTokens(code, config);

          // Call the callback with the tokens
          await onTokensReceived(tokens);

          // Send success response
          const response = generateHtmlResponse(
            "Authentication Successful",
            "You have successfully authenticated with TickTick."
          );

          sendHtmlResponse(res, response);

          // Resolve the promise with tokens
          resolve(tokens);

          // Close the server as we don't need it anymore
          closeServer(server);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          const response = generateHtmlResponse(
            "Authentication Error",
            `Failed to exchange authorization code for tokens: ${errorMsg}`,
            500
          );

          sendHtmlResponse(res, response);

          reject(err);
          closeServer(server);
        }
      }
    );

    // Handle server errors
    server.on("error", (err) => {
      const errorMsg = `Server error: ${err.message}`;
      error(errorMsg);
      reject(new Error(errorMsg));
    });

    // Start listening
    server.listen(port, () => {
      debug(`Server listening on port ${port}`);
    });
  });
};

/**
 * Close the HTTP server
 */
const closeServer = (server: http.Server | null): void => {
  if (server) {
    debug("Closing callback server");
    server.close();
  }
};
