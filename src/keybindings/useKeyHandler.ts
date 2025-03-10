import { useInput } from "ink";
import { useCallback, useMemo } from "react";
import * as logger from "../core/logger";
import type { KeyHandler, ActionHandler } from "./types";
import { createKeyMap, matchKeybinding } from "./utils";
import { keylogger } from "./keylogger";

/**
 * Hook to handle keyboard input using the global keybinding configuration
 *
 * @param onAction Function to handle triggered actions
 * @param additionalHandler Optional additional key handler
 */
export const useKeyHandler = (
  onAction: ActionHandler,
  additionalHandler?: KeyHandler
) => {
  // Create a map of key to [category, action, parsed] triplets from config
  const keyMap = useMemo(() => createKeyMap(), []);

  // Create the key handler function
  const handleInput = useCallback(
    (input: string, key: any) => {
      // Log the raw key event for debugging
      keylogger.logKey(key, input);

      // Find matching keybinding
      for (const [_, [category, action, parsed]] of keyMap.entries()) {
        if (matchKeybinding(input, key, parsed)) {
          // Log the triggered action
          keylogger.logAction(category, action, parsed.configured || "");

          // Log via the application logger
          logger.debug("KEYBINDING_TRIGGERED", {
            category,
            action,
            key: parsed.configured,
          });

          onAction(category, action);
          return;
        }
      }

      // Call additional handler if provided
      if (additionalHandler) {
        additionalHandler(input, key);
      }
    },
    [keyMap, onAction, additionalHandler]
  );

  // Register input handler
  useInput(handleInput);
};
