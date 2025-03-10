import * as fs from "node:fs";
import { dirname } from "node:path";
import { config } from "../core/config";
import type { Key } from "./types";

const DEBUG = process.env.TICKTICK_DEBUG === "true";
const keyloggerFile = config.storage.keylogger;

// Create a keylogger factory that returns real or dummy functions based on DEBUG
export const keylogger = (() => {
  // If DEBUG is disabled, return dummy functions
  if (!DEBUG) {
    return {
      logKey: () => {},
      logAction: () => {},
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
      try {
        fs.appendFileSync(
          keyloggerFile,
          JSON.stringify({
            type: "key",
            timestamp: new Date().toISOString(),
            input,
            key: { ...key },
          }) + "\n"
        );
      } catch {
        // Silently fail
      }
    },

    logAction: (category: string, action: string, key: string) => {
      try {
        fs.appendFileSync(
          keyloggerFile,
          JSON.stringify({
            type: "action",
            timestamp: new Date().toISOString(),
            category,
            action,
            key,
          }) + "\n"
        );
      } catch {
        // Silently fail
      }
    },

    clear: () => {
      try {
        fs.writeFileSync(keyloggerFile, "");
      } catch {
        // Silently fail
      }
    },
  };
})();
