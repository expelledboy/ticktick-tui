import { useInput } from "ink";
import { useCallback, useMemo } from "react";
import type { KeyHandler, ActionHandler } from "./types";
import { createKeyMap } from "./utils";
import { matchKeybinding } from "./keyMatchingLogic";
import { useAppStore } from "../store";
import type { ViewMode } from "../core/types";

export type AppMode = "global" | ViewMode;

/**
 * Hook to handle keyboard input using the global keybinding configuration
 *
 * @param onAction - Main action handler for keybindings
 * @param additionalHandler - Fallback handler for unbound keys
 * @param mode - Determines which keybindings are active based on current view
 */
export const useKeyHandler = (
  mode: AppMode,
  onAction: ActionHandler,
  additionalHandler?: KeyHandler
) => {
  // Get the active view
  const activeView = useAppStore((s) => s.activeView);

  // Create a map of key to [category, action, parsed] triplets from config
  const keyMap = useMemo(() => createKeyMap(), []);

  // Create the key handler function
  const handleInput = useCallback(
    (input: string, key: any) => {
      // Only activate if in global mode or matching active view
      if (mode !== "global" && activeView !== mode) return;

      // Check all keybindings in the map
      for (const [configKey, [category, action, parsed]] of keyMap.entries()) {
        const matches = matchKeybinding(input, key, parsed);
        if (matches) onAction(category, action);
      }

      // If no keybinding matched, call additional handler
      // This allows global handlers to provide fallback behavior
      if (additionalHandler) {
        additionalHandler(input, key);
      }
    },
    [keyMap, onAction, additionalHandler, activeView, mode]
  );

  // Register input handler
  useInput(handleInput);
};
