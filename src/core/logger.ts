import * as fs from "node:fs";
import { config } from "./config";
import { dirname } from "node:path";
import { useAppStore } from "../store"; // Import the store

const DEBUG = process.env.TICKTICK_DEBUG === "true";

// Expand the path to replace ~ with the user's home directory
const logFile = config.storage.logs;
const logDir = dirname(logFile);

// Setup log file
if (!fs.existsSync(logDir)) {
  console.log("Creating log directory", logDir);
  fs.mkdirSync(logDir, { recursive: true });
}

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
  | "CONFIG";

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

/**
 * Updates the store with a log entry
 */
const updateStoreLog = (level: LogLevel, message: string): void => {
  try {
    // Get the store instance and update it
    const store = useAppStore.getState();
    store.addLog(level, message);
  } catch (error) {
    console.error("Failed to update log in store", error);
  }
};

/**
 * Writes a log to file
 */
const logToFile = (level: LogLevel, message: string): void => {
  try {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} ${level.padEnd(5)} ${message}\n`;

    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error("Failed to write to log file", error);
  }
};

/**
 * Log a debug message - only to console and store, not to file
 * @param operation The operation being performed
 * @param data Key-value pairs to include in the log
 */
export const debug = (
  operation: LogOperation,
  data: Record<string, any> = {}
): void => {
  const message = formatLogData(operation, data);

  if (DEBUG) console.debug("DEBUG", message);

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
