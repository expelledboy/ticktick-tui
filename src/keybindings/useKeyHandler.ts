import { useInput, type Key } from "ink";
import { useCallback, useRef } from "react";
import { useAppStore } from "../store";
import { type ViewMode } from "../core/types";
import {
  formatRawInput,
  findMatchingBinding,
  configToBindings,
  type KeyContext,
  type RawInput,
  type Action,
  parseInput,
} from "./KeyBindingSystem";
import { getAllKeybindings } from "./config";
import { debug, logToInMemory } from "../core/logger";
import { TEST } from "../constants";

export type AppMode = "global" | ViewMode;
export type ActionHandler = (category: string, action: string) => void;

/**
 * Handle native keys directly
 */
export function isNativeKey(key: Key) {
  const navigationActions: Partial<Record<keyof Key, Action>> = {
    upArrow: "up",
    downArrow: "down",
    leftArrow: "left",
    rightArrow: "right",
    return: "select",
    backspace: "back",
  };

  for (const [k, action] of Object.entries(navigationActions)) {
    if (key[k as keyof Key]) {
      return action;
    }
  }

  return null;
}

// Convert all keybindings from the config to our internal format once
// This is cached and reused across all useKeyHandler instances
const cachedBindings = configToBindings(getAllKeybindings() as any);

/**
 * Unified key handler with explicit mode handling and priority-based binding resolution
 *
 * @param mode The current app mode (global, projects, project, task)
 * @param onAction Callback function to execute when a keybinding is triggered
 */
export const useKeyHandler = (mode: AppMode, onAction: ActionHandler) => {
  const activeView = useAppStore((s) => s.activeView);

  // Create a ref to track the last input time
  const lastActionRef = useRef<{
    category: string;
    action: string;
    time: number;
  } | null>(null);

  const handleInput = useCallback(
    (input: string, key: Key) => {
      // Set up the current context
      const context: KeyContext = {
        mode,
        activeView,
      };

      // Keylogging
      logToInMemory("KEY_PRESSED", {
        mode,
        key: formatRawInput(parseInput(input, key)),
      });

      // Create a raw input object for the KeyBindingSystem
      // TODO: Refactor KeyBindingSystem to use Key directly
      const rawInput: RawInput = parseInput(input, key);

      // Handle direct navigation keys first (for backward compatibility)
      const nativeKey = isNativeKey(key);
      if (nativeKey) {
        onAction("navigation", nativeKey);
        return;
      }

      // Use our new KeyBindingSystem to find the best matching binding
      const matchedBinding = findMatchingBinding(
        cachedBindings,
        rawInput,
        context
      );

      debug("DEV", {
        matchedBinding: matchedBinding?.action.action || "none",
        mode,
        activeView,
      });

      if (matchedBinding) {
        // Log the triggered action
        logToInMemory("KEYBINDING_TRIGGERED", {
          category: matchedBinding.action.category,
          action: matchedBinding.action.action,
          key: formatRawInput(rawInput),
          mode,
        });

        onAction(matchedBinding.action.category, matchedBinding.action.action);
      }
    },
    [mode, activeView, onAction]
  );

  useInput(handleInput);
};
