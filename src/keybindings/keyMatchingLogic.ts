import type { Key } from "ink";
import { emptyKey } from "./utils";
import type { KeyBind } from "./types";

// Parse a keybinding string (e.g., "ctrl+s") into input and key components
export const parseKeybinding = (
  keybinding: string
): {
  input: string;
  key: Key & { space: boolean };
  configured?: string;
} => {
  const binding = keybinding.toLowerCase().split("+");

  const bindings = {
    ctrl: binding.includes("ctrl"),
    shift: binding.includes("shift"),
    meta: binding.includes("meta"),
  };

  // Handle special cases
  const specialKeys = [
    "space",
    "return",
    "escape",
    "up",
    "down",
    "left",
    "right",
  ];

  const lastKey = binding[binding.length - 1];

  if (specialKeys.includes(lastKey)) {
    const specialKeyRemap: Record<string, string> = {
      up: "upArrow",
      down: "downArrow",
      left: "leftArrow",
      right: "rightArrow",
    };

    const finalKey = specialKeyRemap[lastKey] || lastKey;

    const specialCaseInputMap: Record<string, string> = {
      space: " ",
      return: "\r",
    };

    const input = specialCaseInputMap[lastKey] || "";

    return {
      input,
      key: { ...emptyKey, ...bindings, [finalKey]: true },
      configured: keybinding,
    };
  }

  return {
    input: lastKey,
    key: { ...emptyKey, ...bindings },
    configured: keybinding,
  };
};

// Check if input and key match a keybinding
export const matchKeybinding = (
  input: string,
  key: Key,
  keybinding: KeyBind
) => {
  // Special case for arrow keys
  if (keybinding.key.upArrow && key.upArrow) return true;
  if (keybinding.key.downArrow && key.downArrow) return true;
  if (keybinding.key.leftArrow && key.leftArrow) return true;
  if (keybinding.key.rightArrow && key.rightArrow) return true;

  // For special keys like enter, space, escape
  if (keybinding.key.space && input === " ") return true;
  if (keybinding.key.return && input === "\r") return true;

  // Compare input string directly
  if (keybinding.input !== input) return false;

  // Compare modifiers
  if (keybinding.key.ctrl !== key.ctrl) return false;
  if (keybinding.key.shift !== key.shift) return false;
  if (keybinding.key.meta !== key.meta) return false;

  // NEW: Verify the specific key property matches
  const keyProperties = [
    "upArrow",
    "downArrow",
    "leftArrow",
    "rightArrow",
    "space",
    "escape",
    "return",
  ] as (keyof Key)[];

  const requiredKey = keyProperties.find((k) => keybinding.key[k]);
  if (requiredKey && !key[requiredKey]) return false;

  return true;
};
