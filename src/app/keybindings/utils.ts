import { type Key } from "ink";
import { config } from "../../config";

// Default empty key state
export const emptyKey: Key = {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  pageDown: false,
  pageUp: false,
  return: false,
  escape: false,
  ctrl: false,
  shift: false,
  tab: false,
  backspace: false,
  delete: false,
  meta: false,
};

// Common arrow key combinations
export const arrow = {
  up: { input: "", key: { ...emptyKey, upArrow: true } },
  down: { input: "", key: { ...emptyKey, downArrow: true } },
  left: { input: "", key: { ...emptyKey, leftArrow: true } },
  right: { input: "", key: { ...emptyKey, rightArrow: true } },
};

// Parse a keybinding string (e.g., "ctrl+s") into input and key components
export const parseKeybinding = (
  keybinding: string
): {
  input: string;
  key: Key;
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
  };
};

// Parse all configured keybindings
export const binds = Object.fromEntries(
  Object.entries(config.keybindings).map(([key, value]) => [
    key,
    parseKeybinding(value),
  ])
);

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
