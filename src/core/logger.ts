import * as fs from "node:fs";
import { config } from "./config";
import { dirname } from "node:path";
import { useAppStore } from "../store"; // Import the store

// Cache for the log file path and directory
let logFileCache: string | null = null;
let logDirCache: string | null = null;

// Function to lazily initialize and get the log file path
// Prevents circular dependency with config
const getLogFile = (): string => {
  if (!logFileCache) {
    // Only access config when this function is called
    logFileCache = config.storage.logs;
    logDirCache = dirname(logFileCache);

    // Setup log file
    if (!fs.existsSync(logDirCache)) {
      console.log("Creating log directory", logDirCache);
      fs.mkdirSync(logDirCache, { recursive: true });
    }
  }
  return logFileCache;
};

// Type for log levels, must match the type in store.ts
export type LogLevel = "INFO" | "DEBUG" | "ERROR";

// Type for log operations
export type LogOperation =
  // Application operations
  | "APP_START"
  | "APP_EXIT"
  // Authentication operations
  | "AUTH_TOKEN_LOAD"
  | "AUTH_TOKEN_SAVE"
  | "AUTH_CREDS_LOAD"
  | "AUTH_CREDS_SAVE"
  | "AUTH_FLOW"
  | "AUTH_TOKEN_REFRESH"
  | "AUTH_TOKEN_EXPIRED"
  | "AUTH_CLEAR"
  | "AUTH_ERROR"
  // API operations
  | "API_REQUEST"
  | "API_RESPONSE"
  | "API_ERROR"
  | "API_RATE_LIMIT"
  // UI operations
  | "PANEL_TOGGLE"
  | "PROJECT_LOAD"
  | "PROJECT_SELECT"
  | "TASK_LOAD"
  | "TASK_SELECT"
  // Other operations
  | "STORAGE"
  | "CONFIG"
  | "KEYBINDING"
  | "KEYBINDING_TRIGGERED"
  | "CHANGE_FOCUS"
  | "DEBUG";

/**
 * Format a log entry with key-value pairs
 * @param operation The operation being logged
 * @param data Object containing key-value pairs to log
 * @returns Formatted log string
 */
const formatLogData = (
  operation: LogOperation,
  data: Record<string, any> = {}
): string => {
  // Convert data object to key=value pairs
  const pairs = Object.entries(data)
    .map(([key, value]) => {
      // Format strings with quotes if they contain spaces
      if (typeof value === "string" && value.includes(" ")) {
        return `${key}="${value}"`;
      }
      return `${key}=${value}`;
    })
    .join(" ");

  return `[${operation}] ${pairs}`;
};

// Dev only logs
export const __DEBUG = (msg: string, data?: Record<string, any>): void => {
  const message = formatLogData("DEBUG", { msg, data: JSON.stringify(data) });
  updateStoreLog("DEBUG", message);
};

/**
 * Updates the store with a log entry
 */
const updateStoreLog = (level: LogLevel, message: string): void => {
  const store = useAppStore.getState();
  store.addLog(level, message);
};

/**
 * Writes a log to file
 */
const logToFile = (level: LogLevel, message: string): void => {
  try {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} ${level.padEnd(5)} ${message}\n`;

    fs.appendFileSync(getLogFile(), logLine);
  } catch (error) {
    console.error("Failed to write to log file", error);
  }
};
/**
 * Log a debug message - only to in app logs
 * @param operation The operation being performed
 * @param data Key-value pairs to include in the log
 */
export const debug = (
  operation: LogOperation,
  data: Record<string, any> = {}
): void => {
  const message = formatLogData(operation, data);

  // DEBUG logs are not written to file
  updateStoreLog("DEBUG", message);
};

/**
 * Log an info message
 * @param operation The operation being performed
 * @param data Key-value pairs to include in the log
 */
export const info = (
  operation: LogOperation,
  data: Record<string, any> = {}
): void => {
  const message = formatLogData(operation, data);

  logToFile("INFO", message);
  updateStoreLog("INFO", message);
};

/**
 * Log an error message
 * @param operation The operation being performed
 * @param data Key-value pairs to include in the log
 */
export const logError = (
  operation: LogOperation,
  data: Record<string, any> = {}
): void => {
  const message = formatLogData(operation, data);

  console.error("ERROR", message);
  logToFile("ERROR", message);
  updateStoreLog("ERROR", message);
};
