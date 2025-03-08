/**
 * Authentication utilities
 *
 * This module handles storage and retrieval of authentication credentials
 * and provides utilities for managing authentication state.
 */
import fs from "fs";
import path from "path";
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
    debug(`Creating auth storage directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 }); // Secure permissions - user only
  }
};

/**
 * Check if OAuth credentials exist
 */
export const haveCredentials = (): boolean => {
  try {
    const credentialsPath = getCredentialsPath();
    if (!fs.existsSync(credentialsPath)) {
      return false;
    }

    const credentialsJson = fs.readFileSync(credentialsPath, "utf8");
    const credentials = JSON.parse(credentialsJson) as OAuth2Config;

    return !!credentials.clientId && !!credentials.clientSecret;
  } catch (err) {
    debug(
      `Error checking credentials: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
};

/**
 * Save OAuth client credentials
 */
export const saveOAuthCredentials = async (
  credentials: OAuth2Config
): Promise<void> => {
  ensureAuthStorageDir();
  const credentialsPath = getCredentialsPath();

  try {
    debug(`Saving OAuth credentials to ${credentialsPath}`);
    fs.writeFileSync(
      credentialsPath,
      JSON.stringify(credentials, null, 2),
      { encoding: "utf8", mode: 0o600 } // Secure permissions - user read/write only
    );
    info("OAuth credentials saved successfully");
  } catch (err) {
    const errorMsg = `Failed to save OAuth credentials: ${err instanceof Error ? err.message : String(err)}`;
    logError(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Load OAuth client credentials
 */
export const loadOAuthCredentials = async (): Promise<OAuth2Config | null> => {
  const credentialsPath = getCredentialsPath();

  try {
    debug(`Loading OAuth credentials from ${credentialsPath}`);
    if (fs.existsSync(credentialsPath)) {
      const credentialsJson = fs.readFileSync(credentialsPath, "utf8");
      return JSON.parse(credentialsJson) as OAuth2Config;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError("Failed to load OAuth credentials:", errorMsg);
  }

  return null;
};

/**
 * Clear OAuth client credentials
 */
export const clearOAuthCredentials = async (): Promise<void> => {
  const credentialsPath = getCredentialsPath();

  debug("Clearing OAuth credentials");
  if (fs.existsSync(credentialsPath)) {
    fs.unlinkSync(credentialsPath);
    info("OAuth credentials cleared");
  }
};

/**
 * Save OAuth tokens to storage
 */
export const saveOAuthTokens = async (tokens: OAuth2Tokens): Promise<void> => {
  const tokenPath = getTokenStoragePath();
  ensureAuthStorageDir();

  try {
    debug(`Saving tokens to ${tokenPath}`);
    fs.writeFileSync(
      tokenPath,
      JSON.stringify(tokens, null, 2),
      { encoding: "utf8", mode: 0o600 } // Secure permissions - user read/write only
    );
  } catch (err) {
    const errorMsg = `Failed to save authentication tokens: ${err instanceof Error ? err.message : String(err)}`;
    logError(errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Load OAuth tokens from storage
 */
export const loadOAuthTokens = async (): Promise<OAuth2Tokens | null> => {
  const tokenPath = getTokenStoragePath();

  try {
    debug(`Loading tokens from ${tokenPath}`);
    if (fs.existsSync(tokenPath)) {
      const tokensJson = fs.readFileSync(tokenPath, "utf8");
      return JSON.parse(tokensJson) as OAuth2Tokens;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError("Failed to load tokens:", errorMsg);
  }

  return null;
};

/**
 * Check if OAuth tokens exist and are valid
 */
export const haveValidTokens = async (): Promise<boolean> => {
  try {
    const tokens = await loadOAuthTokens();
    if (!tokens) {
      return false;
    }

    return !isTokenExpired(tokens);
  } catch (err) {
    debug(
      `Error checking tokens: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
};

/**
 * Clear stored OAuth tokens
 */
export const clearOAuthTokens = async (): Promise<void> => {
  const tokenPath = getTokenStoragePath();

  debug("Clearing authentication tokens");
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
    info("OAuth tokens cleared");
  }
};

/**
 * Clear all OAuth data (both credentials and tokens)
 */
export const clearAllOAuthData = async (): Promise<void> => {
  await clearOAuthCredentials();
  await clearOAuthTokens();
  info("All OAuth data cleared");
};

/**
 * Start the OAuth2 authorization flow
 */
export const startOAuthFlow = async (
  oauthConfig: OAuth2Config
): Promise<OAuth2Tokens> => {
  return launchBrowserAuthorization(oauthConfig, saveOAuthTokens);
};

/**
 * Process OAuth callback URL
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
  // Try to load tokens from storage
  const tokens = await loadOAuthTokens();

  if (!tokens) {
    const errorMsg = "Not authenticated. Please authenticate first.";
    logError(errorMsg);
    throw new Error(errorMsg);
  }

  // If token is expired, refresh it
  if (isTokenExpired(tokens)) {
    info("Access token has expired, attempting to refresh...");
    try {
      const newTokens = await refreshOAuthToken(
        tokens.refresh_token,
        oauthConfig
      );
      await saveOAuthTokens(newTokens);
      info("Successfully refreshed access token");
      return newTokens.access_token;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logError("Failed to refresh token:", errorMsg);
      // If refresh fails, clear tokens to force re-authentication
      await clearOAuthTokens();
      throw new Error("Authentication expired. Please re-authenticate.");
    }
  }

  return tokens.access_token;
};
