import * as fs from "node:fs";
import { dirname } from "node:path";
import { config } from "../core/config";
import type { Key } from "ink";

const DEBUG = process.env.TICKTICK_DEBUG === "true";
const keyloggerFile = config.storage.keylogger;

// Create a keylogger factory that returns real or dummy functions based on DEBUG
export const keylogger = (() => {
  // If DEBUG is disabled, return dummy functions
  if (!DEBUG) {
    return {
      logKey: () => {},
      logAction: () => {},
      logDebug: () => {},
      logKeybindingAttempt: () => {},
      clear: () => {},
    };
  }

  // Ensure directory exists only once when keylogger is initialized
  try {
    const dir = dirname(keyloggerFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    // Silently fail
  }

  // Return real implementation
  return {
    logKey: (key: Key, input: string) => {
      const logLine = `KEY input: "${input}", key: {${formatKeyObject(key)}}\n`;
      fs.appendFile(keyloggerFile, logLine, () => {});
    },

    logAction: (category: string, action: string, key: string) => {
      const logLine = `ACTION category: "${category}", action: "${action}", key: "${key}"\n`;
      fs.appendFile(keyloggerFile, logLine, () => {});
    },

    logKeybindingAttempt: (
      from: { input: string; key: Key },
      against: { input: string; key: Key },
      matched: boolean
    ) => {
      const logLine = [
        "MATCH_ATTEMPT",
        `checking: '${from.input}' (${formatKeyObject(from.key)})`,
        `→ against: '${against.input}' (${formatKeyObject(against.key)})`,
        `matched: ${matched}\n`,
      ].join(" ");
      fs.appendFile(keyloggerFile, logLine, () => {});
    },

    logDebug: (message: string, data?: any) => {
      const logLine = `DEBUG message: ${message}, data: ${JSON.stringify(data)}\n`;
      fs.appendFile(keyloggerFile, logLine, () => {});
    },
  };
})();

export const formatKeyObject = (key: Key) => {
  return Object.entries(key)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};
