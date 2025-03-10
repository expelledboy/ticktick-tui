import type { Key } from "ink";
import type { ActionCategory, KeyBind } from "./types";
import { getAllKeybindings } from "./config";
import { parseKeybinding } from "./keyMatchingLogic";

export const emptyKey: Key & { space: boolean } = {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  pageDown: false,
  pageUp: false,
  return: false,
  escape: false,
  ctrl: false,
  shift: false, // XXX: For some reason, shift is always true
  tab: false,
  backspace: false,
  delete: false,
  meta: false,
  space: false,
};

// Format key for display
export function formatKeyBinding(key: string): string {
  return key
    .replace(/ctrl\+/i, "Ctrl+")
    .replace(/shift\+/i, "Shift+")
    .replace(/meta\+/i, "Meta+")
    .replace(/escape/i, "Esc")
    .replace(/enter/i, "Enter")
    .replace(/space/i, "Space")
    .replace(/uparrow/i, "↑")
    .replace(/downarrow/i, "↓")
    .replace(/leftarrow/i, "←")
    .replace(/rightarrow/i, "→");
}

// Create a map of parsed keybindings by category and action
export function createKeyMap(): Map<string, [ActionCategory, string, KeyBind]> {
  const keyMap = new Map<string, [ActionCategory, string, KeyBind]>();
  const bindings = getAllKeybindings();

  Object.entries(bindings).forEach(([category, actions]) => {
    Object.entries(actions).forEach(([action, key]) => {
      const parsed = parseKeybinding(key);
      keyMap.set(key, [category as ActionCategory, action, parsed]);
    });
  });

  return keyMap;
}
