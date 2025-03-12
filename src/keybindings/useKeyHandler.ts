import { useInput, type Key } from "ink";
import { useCallback } from "react";
import { useAppStore } from "../store";
import { type ViewMode } from "../core/types";
import {
  findMatchingBinding,
  configToBindings,
  type KeyContext,
  type RawInput,
  type Action,
} from "./KeyBindingSystem";
import { getAllKeybindings } from "./config";

export type AppMode = "global" | ViewMode;
export type ActionHandler = (category: string, action: string) => void;

/**
 * Handle navigation keys directly - for backward compatibility
 */
export function isNavigationAction(key: Key) {
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

  const handleInput = useCallback(
    (input: string, key: Key) => {
      // Set up the current context
      const context: KeyContext = {
        mode,
        activeView,
      };

      // Handle direct navigation keys first (for backward compatibility)
      const navigationAction = isNavigationAction(key);
      if (navigationAction) {
        onAction("navigation", navigationAction);
        return;
      }

      // Create a raw input object for the KeyBindingSystem
      const rawInput: RawInput = {
        input,
        key: {
          ...key,
          // Detect space key from the input string since key.raw may not exist
          space: input === " " || false,
        },
      };

      // Use our new KeyBindingSystem to find the best matching binding
      const matchedBinding = findMatchingBinding(
        cachedBindings,
        rawInput,
        context
      );

      if (matchedBinding) {
        onAction(matchedBinding.action.category, matchedBinding.action.action);
      }
    },
    [mode, activeView, onAction]
  );

  useInput(handleInput);
};
