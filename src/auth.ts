/**
 * Authentication utilities
 *
 * This module handles storage and retrieval of authentication credentials
 * and provides utilities for managing authentication state.
 */
import fs from "node:fs";
import path from "node:path";
import { debug, info, logError } from "./logger";
import { config } from "./config";
import type { OAuth2Tokens, OAuth2Config } from "./utils/oauth2";

import {
  isTokenExpired,
  refreshAccessToken as refreshOAuthToken,
  launchBrowserAuthorization,
  handleCallback as handleOAuthCallback,
} from "./utils/oauth2";

/**
 * Get the path to the tokens storage file
 */
export const getTokenStoragePath = (): string => {
  // Store tokens in the same directory as credentials, but in a separate file
  return path.join(
    path.dirname(config.storage.credentials),
    "oauth_tokens.json"
  );
};

/**
 * Get the path to the OAuth credentials storage file
 */
export const getCredentialsPath = (): string => {
  return config.storage.credentials;
};

/**
 * Ensure auth storage directory exists
 */
export const ensureAuthStorageDir = (): void => {
  const dir = path.dirname(config.storage.credentials);

  if (!fs.existsSync(dir)) {
    debug("STORAGE", { action: "create_dir", path: dir });
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); // Secure permissions - user only
  }
};

/**
 * Check if OAuth credentials are available
 */
export const haveCredentials = (): boolean => {
  const credentialsPath = getCredentialsPath();

  try {
    const credentialsJson = fs.readFileSync(credentialsPath, "utf8");
    const credentials = JSON.parse(credentialsJson) as OAuth2Config;

    return !!credentials.clientId && !!credentials.clientSecret;
  } catch (err) {
    debug("AUTH_CREDS_LOAD", {
      error: err instanceof Error ? err.message : String(err),
      path: credentialsPath,
    });
    return false;
  }
};

/**
 * Save OAuth credentials to disk
 */
export const saveOAuthCredentials = async (
  credentials: OAuth2Config
): Promise<void> => {
  ensureAuthStorageDir();
  const credentialsPath = getCredentialsPath();

  try {
    debug("AUTH_CREDS_SAVE", { path: credentialsPath });
    fs.writeFileSync(
      credentialsPath,
      JSON.stringify(credentials, null, 2),
      { encoding: "utf8", mode: 0o600 } // Secure permissions - user read/write only
    );
    info("AUTH_CREDS_SAVE", { success: true });
  } catch (err) {
    const errorMsg = `Failed to save OAuth credentials: ${err instanceof Error ? err.message : String(err)}`;
    logError("AUTH_CREDS_SAVE", {
      error: err instanceof Error ? err.message : String(err),
      path: credentialsPath,
    });
    throw new Error(errorMsg);
  }
};

/**
 * Load OAuth credentials from disk
 */
export const loadOAuthCredentials = async (): Promise<OAuth2Config | null> => {
  const credentialsPath = getCredentialsPath();

  try {
    debug("AUTH_CREDS_LOAD", { path: credentialsPath });
    if (fs.existsSync(credentialsPath)) {
      const credentialsJson = fs.readFileSync(credentialsPath, "utf8");
      const credentials = JSON.parse(credentialsJson) as OAuth2Config;
      return credentials;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError("AUTH_CREDS_LOAD", {
      error: errorMsg,
      path: credentialsPath,
    });
  }

  return null;
};

/**
 * Clear OAuth credentials from disk
 */
export const clearOAuthCredentials = async (): Promise<void> => {
  const credentialsPath = getCredentialsPath();

  debug("AUTH_CLEAR", { type: "credentials", path: credentialsPath });
  if (fs.existsSync(credentialsPath)) {
    fs.unlinkSync(credentialsPath);
    info("AUTH_CLEAR", { type: "credentials", success: true });
  }
};

/**
 * Save OAuth tokens to disk
 */
export const saveOAuthTokens = async (tokens: OAuth2Tokens): Promise<void> => {
  ensureAuthStorageDir();
  const tokenPath = getTokenStoragePath();

  try {
    debug("AUTH_TOKEN_SAVE", { path: tokenPath });
    fs.writeFileSync(
      tokenPath,
      JSON.stringify(tokens, null, 2),
      { encoding: "utf8", mode: 0o600 } // Secure permissions - user read/write only
    );
  } catch (err) {
    const errorMsg = `Failed to save authentication tokens: ${err instanceof Error ? err.message : String(err)}`;
    logError("AUTH_TOKEN_SAVE", {
      error: err instanceof Error ? err.message : String(err),
      path: tokenPath,
    });
    throw new Error(errorMsg);
  }
};

/**
 * Load OAuth tokens from disk
 */
export const loadOAuthTokens = async (): Promise<OAuth2Tokens | null> => {
  const tokenPath = getTokenStoragePath();

  try {
    debug("AUTH_TOKEN_LOAD", { path: tokenPath });
    if (fs.existsSync(tokenPath)) {
      const tokensJson = fs.readFileSync(tokenPath, "utf8");
      return JSON.parse(tokensJson) as OAuth2Tokens;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError("AUTH_TOKEN_LOAD", {
      error: errorMsg,
      path: tokenPath,
    });
  }

  return null;
};

/**
 * Check if we have valid (non-expired) OAuth tokens
 */
export const haveValidTokens = async (): Promise<boolean> => {
  const tokens = await loadOAuthTokens();

  try {
    return !isTokenExpired(tokens);
  } catch (err) {
    debug("AUTH_TOKEN_LOAD", {
      error: err instanceof Error ? err.message : String(err),
      action: "check_expiry",
    });
    return false;
  }
};

/**
 * Clear OAuth tokens from disk
 */
export const clearOAuthTokens = async (): Promise<void> => {
  const tokenPath = getTokenStoragePath();

  debug("AUTH_CLEAR", { type: "tokens", path: tokenPath });
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
    info("AUTH_CLEAR", { type: "tokens", success: true });
  }
};

/**
 * Clear all OAuth data from disk
 */
export const clearAllOAuthData = async (): Promise<void> => {
  await clearOAuthCredentials();
  await clearOAuthTokens();
  info("AUTH_CLEAR", { type: "all", success: true });
};

/**
 * Start OAuth 2.0 flow to get tokens
 */
export const startOAuthFlow = async (
  oauthConfig: OAuth2Config
): Promise<OAuth2Tokens> => {
  ensureAuthStorageDir();
  return await launchBrowserAuthorization(oauthConfig, saveOAuthTokens);
};

/**
 * Process OAuth callback URL from the browser
 */
export const processOAuthCallback = async (
  callbackUrl: string,
  oauthConfig: OAuth2Config
): Promise<OAuth2Tokens> => {
  const tokens = await handleOAuthCallback(callbackUrl, oauthConfig);
  await saveOAuthTokens(tokens);
  return tokens;
};

/**
 * Get a valid access token, refreshing if necessary
 */
export const getAccessToken = async (
  oauthConfig: OAuth2Config
): Promise<string> => {
  const tokens = await loadOAuthTokens();

  if (!tokens) {
    const errorMsg = "Not authenticated. Please authenticate first.";
    logError("AUTH_TOKEN_LOAD", { error: "not_authenticated" });
    throw new Error(errorMsg);
  }

  // If token is expired, refresh it
  if (isTokenExpired(tokens)) {
    info("AUTH_TOKEN_REFRESH", { reason: "token_expired" });
    try {
      const newTokens = await refreshOAuthToken(
        tokens.refresh_token,
        oauthConfig
      );
      await saveOAuthTokens(newTokens);
      info("AUTH_TOKEN_REFRESH", { success: true });
      return newTokens.access_token;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logError("AUTH_TOKEN_REFRESH", { error: errorMsg });
      // If refresh fails, clear tokens to force re-authentication
      await clearOAuthTokens();
      throw err;
    }
  }

  return tokens.access_token;
};
