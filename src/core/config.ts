// src/config.ts
import fs from "node:fs";
import { parseArgs } from "node:util";
import { AppSettingsSchema, type AppSettings } from "./types";
import { logError } from "./logger";
import { TEST } from "../constants";

const defaultConfigPath = "~/.config/ticktick-tui/config.json";
const testConfigPath = "/tmp/ticktick-tui.config.json";

// Remove the config file if it exists
if (fs.existsSync(testConfigPath)) {
  fs.unlinkSync(testConfigPath);
}

const CONFIG_PATH = TEST
  ? testConfigPath
  : process.env["TICKTICK_CONFIG_PATH"] || defaultConfigPath;

/**
 * Loads config from disk, env vars, and CLI args
 * Priority: defaults < disk < env vars < cli args
 */
export const loadConfig = (
  args: string[] = process.argv.slice(2),
  configPath: string = CONFIG_PATH
): AppSettings => {
  // Check if config file exists (skip if testing)
  const configExists = fs.existsSync(configPath);

  // Load from disk
  const config = configExists
    ? AppSettingsSchema.parse(JSON.parse(fs.readFileSync(configPath, "utf-8")))
    : AppSettingsSchema.parse({});

  // Override with environment variables (uppercase)
  Object.entries(process.env).forEach(([key, value]) => {
    if (!key.startsWith("TICKTICK_") || !value) return;

    // Convert TICKTICK_SYNC_INTERVAL to sync.interval
    const configPath = key
      .replace("TICKTICK_", "")
      .toLowerCase()
      .split("_")
      .reduce((result, part, i, arr) => {
        if (i === 0) return part;
        if (i === arr.length - 1) return `${result}.${part}`;
        return `${result}_${part}`;
      }, "");

    // Apply to config
    setValueByPath(config, configPath, parseValue(value));
  });

  try {
    const { values } = parseArgs({
      options: {
        "sync.interval": {
          type: "string",
          short: "i",
        },
      },
      args,
    });

    // Apply CLI args
    Object.entries(values).forEach(([key, value]) => {
      if (value) setValueByPath(config, key, parseValue(value as string));
    });
  } catch (error) {
    logError("CONFIG", {
      action: "parse_cli_args",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Validate final config
  return AppSettingsSchema.parse(config);
};

/**
 * Saves configuration to disk
 */
export function saveConfig(config: AppSettings): void {
  try {
    const configPath = expandPath(config.storage.config);
    const configDir = configPath.substring(0, configPath.lastIndexOf("/"));

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    logError("CONFIG", {
      action: "save",
      error: error instanceof Error ? error.message : String(error),
      path: config.storage.config,
    });
  }
}

// Helper functions

const parseValue = (value: string): any => {
  if (/^\d+$/.test(value)) return Number(value);
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};

const expandPath = (path: string): string => {
  return path.startsWith("~")
    ? path.replace("~", process.env.HOME || "")
    : path;
};

const setValueByPath = (obj: any, path: string, value: any): void => {
  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
};

export const config = loadConfig();

// Create relavent directories

const configDir = config.storage.config.substring(
  0,
  config.storage.config.lastIndexOf("/")
);
const cacheDir = config.storage.cache.substring(
  0,
  config.storage.cache.lastIndexOf("/")
);

if (!fs.existsSync(configDir)) {
  console.log("Creating config directory", configDir);
  fs.mkdirSync(configDir, { recursive: true });
}

if (!fs.existsSync(cacheDir)) {
  console.log("Creating cache directory", cacheDir);
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Declare the global type
declare global {
  // Make settings available as a global variable
  const config: import("./types").AppSettings;
}

(global as any).config = config;
