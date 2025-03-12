import fs from "fs";
import path from "path";
import { config } from "../core/config";
import * as logger from "../core/logger";
import { keybindingsSchema, defaultKeybindings } from "./schema";
import { z } from "zod";

// Define KeyBindings type from the schema
type KeyBindings = z.infer<typeof keybindingsSchema>;

// File path for storing keybindings
const CONFIG_FILE = config.storage.keybindings;

// Load keybindings from file or create if it doesn't exist
function loadKeybindings(): KeyBindings {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      // Try to load and parse existing file
      const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      const result = keybindingsSchema.safeParse(parsed);

      if (result.success) {
        logger.debug("KEYBINDING", { action: "loaded", file: CONFIG_FILE });
        return result.data;
      }

      logger.logError("KEYBINDING", {
        action: "validation_failed",
        error: result.error.message,
      });
    } else {
      // Create new keybindings file with defaults
      const dir = path.dirname(CONFIG_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify(defaultKeybindings, null, 2)
      );
      logger.info("KEYBINDING", {
        action: "created_default",
        file: CONFIG_FILE,
      });
    }
  } catch (error) {
    logger.logError("KEYBINDING", {
      action: "load_failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return defaultKeybindings;
}

// Save keybindings to file
export function saveKeybindings(keybindings: KeyBindings): boolean {
  try {
    keybindingsSchema.parse(keybindings);

    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(keybindings, null, 2));
    logger.info("KEYBINDING", { action: "saved", file: CONFIG_FILE });
    return true;
  } catch (error) {
    logger.logError("KEYBINDING", {
      action: "save_failed",
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

let keyBindings: KeyBindings | null = null;

// Get all keybindings
export function getAllKeybindings(): KeyBindings {
  if (keyBindings) return keyBindings;
  keyBindings = loadKeybindings();
  return keyBindings;
}
