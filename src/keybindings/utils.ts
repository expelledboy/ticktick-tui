import type { Key, ActionCategory } from "./types";
import { emptyKey } from "./types";
import { getAllKeybindings } from "./config";

// Parse a keybinding string (e.g., "ctrl+s") into input and key components
export const parseKeybinding = (
  keybinding: string
): {
  input: string;
  key: Key;
  configured?: string;
} => {
  const binding = keybinding.toLowerCase().split("+");

  return {
    input: binding[binding.length - 1],
    key: {
      ...emptyKey,
      ctrl: binding.includes("ctrl"),
      shift: binding.includes("shift"),
      meta: binding.includes("meta"),
    },
    configured: keybinding,
  };
};

// Check if input and key match a keybinding
export const matchKeybinding = (
  input: string,
  key: Key,
  keybinding: ReturnType<typeof parseKeybinding>
) => {
  // Compare input string directly
  if (input !== keybinding.input) return false;

  // Compare each property of the key object with keybinding.key
  const keyEntries = Object.entries(key);
  for (const [prop, value] of keyEntries) {
    if (keybinding.key[prop as keyof Key] !== value) return false;
  }

  return true;
};

// Format key for display
export function formatKeyBinding(key: string): string {
  return key
    .replace(/ctrl\+/i, "Ctrl+")
    .replace(/shift\+/i, "Shift+")
    .replace(/meta\+/i, "Meta+")
    .replace(/escape/i, "Esc")
    .replace(/enter/i, "Enter")
    .replace(/space/i, "Space");
}

// Create a map of parsed keybindings by category and action
export function createKeyMap(): Map<
  string,
  [ActionCategory, string, ReturnType<typeof parseKeybinding>]
> {
  const keyMap = new Map<
    string,
    [ActionCategory, string, ReturnType<typeof parseKeybinding>]
  >();
  const bindings = getAllKeybindings();

  Object.entries(bindings).forEach(([category, actions]) => {
    Object.entries(actions).forEach(([action, key]) => {
      const parsed = parseKeybinding(key);
      keyMap.set(key, [category as ActionCategory, action, parsed]);
    });
  });

  return keyMap;
}
