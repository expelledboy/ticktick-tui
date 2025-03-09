import * as fs from "node:fs";
import { config } from "../../core/config";
import { dirname } from "node:path";
import { type Key } from "ink";
import type { KeyBind } from "./useKeyboardNavigation";

const DEBUG = process.env.TICKTICK_DEBUG === "true";

// Expand the path to replace ~ with the user's home directory
const logFile = config.storage.logs;

/**
 * Keylogger
 * ONLY used for debugging useKeyboardNavigation
 */
export const keylogger = () => {
  const keyloggerFile = dirname(logFile) + "/keylogger.log";
  const log = (msg: string) => fs.appendFileSync(keyloggerFile, msg);

  const logKey = (key: Key, input: string) => {
    if (!DEBUG) return;

    const activeKeys = Object.entries(key)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    const modifiers = activeKeys.length > 0 ? `modifiers:${activeKeys}` : "";

    log(`[CAPTURE] input:${JSON.stringify(input)} ${modifiers}\n`);
  };

  const logKeybinding = (keybind: KeyBind) => {
    if (!DEBUG) return;

    log(
      `[KEYBIND] bind:${keybind.keybinding.configured} action:${keybind.action.name} \n`
    );
  };

  return { logKey, logKeybinding };
};
