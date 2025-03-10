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
    logKey: (mode: string, key: Key, input: string) => {
      const logLine = `${mode} [⌨️] input "${formatInput(input)}" modifiers "${formatKeyObject(key)}"\n`;
      fs.appendFile(keyloggerFile, logLine, () => {});
    },

    logAction: (
      mode: string,
      category: string,
      action: string,
      key: string
    ) => {
      const logLine = `${mode} [⚡] category:"${category}", action: "${action}", key: "${key}"\n`;
      fs.appendFile(keyloggerFile, logLine, () => {});
    },

    logKeybindingAttempt: (
      mode: string,
      from: { input: string; key: Key },
      against: { input: string; key: Key },
      matched: boolean
    ) => {
      const logLine = [
        `${mode}`,
        `[${matched ? "✅" : "❌"}]`,
        `matching "${formatInput(from.input)}" (${formatKeyObject(from.key)})`,
        `against '${formatInput(against.input)}' (${formatKeyObject(against.key)})`,
        `\n`,
      ].join(" ");
      fs.appendFile(keyloggerFile, logLine, () => {});
    },

    logDebug: (mode: string, message: string, data?: any) => {
      const logLine = `${mode} [🔍] ${message} data: ${JSON.stringify(data)}\n`;
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

// Visualize special characters
export const formatInput = (input: string) => {
  if (input === "\r") return "\\r";
  if (input === "\n") return "\\n";
  if (input === "\t") return "\\t";
  if (input === "\b") return "\\b";
  if (input === "\f") return "\\f";
  if (input === "\v") return "\\v";
  if (input === "\0") return "\\0";

  return input;
};
