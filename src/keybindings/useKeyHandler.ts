import { useInput, type Key } from "ink";
import { useCallback, useRef } from "react";
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
 * Simple debounce function to prevent multiple rapid keypresses
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) {
      return;
    }

    func(...args);

    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
  };
}

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

      // Only process input if the mode matches the activeView, or it's a global binding
      // This ensures that key bindings are only processed by the currently focused view
      const modeMatchesActiveView = mode === activeView || mode === "global";

      // Handle direct navigation keys first (for backward compatibility)
      const navigationAction = isNavigationAction(key);
      if (navigationAction && modeMatchesActiveView) {
        // Prevent duplicate rapid keypresses (especially important for navigation)
        const now = Date.now();
        if (
          lastActionRef.current &&
          lastActionRef.current.category === "navigation" &&
          lastActionRef.current.action === navigationAction &&
          now - lastActionRef.current.time < 100 // 100ms debounce
        ) {
          return;
        }

        // Update last action reference
        lastActionRef.current = {
          category: "navigation",
          action: navigationAction,
          time: now,
        };

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

      if (matchedBinding && modeMatchesActiveView) {
        onAction(matchedBinding.action.category, matchedBinding.action.action);
      }
    },
    [mode, activeView, onAction]
  );

  useInput(handleInput);
};
