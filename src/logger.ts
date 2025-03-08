import * as fs from "node:fs";
import { config } from "./config";
import { dirname } from "node:path";

const DEBUG = process.env.TICKTICK_DEBUG === "true";

// Expand the path to replace ~ with the user's home directory
const logFile = config.storage.logs;
const logDir = dirname(logFile);

// Setup log file
if (!fs.existsSync(logDir)) {
  console.log("Creating log directory", logDir);
  fs.mkdirSync(logDir, { recursive: true });
}

const logToFile = (...args: any[]) => {
  try {
    const logLine = `${new Date().toISOString()} ${args.join(" ")}\n`;
    // TODO: Replace with bun primitives
    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error("Failed to write to log file", error);
  }
};

// We log only if DEBUG is true
export const debug = (...args: any[]) => {
  if (DEBUG) console.debug("DEBUG", ...args);
  logToFile("DEBUG", ...args);
};

// We only log to the file (view in logs mode)
export const info = (...args: any[]) => {
  logToFile("INFO", ...args);
};

// We log to console and file (critical errors)
export const logError = (...args: any[]) => {
  console.error("ERROR", ...args);
  logToFile("ERROR", ...args);
};
