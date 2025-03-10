import { useInput } from "ink";
import { useCallback, useMemo } from "react";
import * as logger from "../core/logger";
import { createKeyMap } from "./utils";
import { matchKeybinding } from "./keyMatchingLogic";
import { keylogger } from "./keylogger";

/**
 * Hook to log keyboard input and keybinding matches
 * This is separate from useKeyHandler to avoid duplicate logging
 *
 * @param mode The mode this logger is being used in (global, projects, project, task)
 */
export const useKeyLogger = (
  mode: "global" | "projects" | "project" | "task" = "global"
) => {
  // Create a map of key to [category, action, parsed] triplets from config
  const keyMap = useMemo(() => {
    const keyMap = createKeyMap();

    // Log available keybindings for debugging
    keylogger.logDebug(
      mode,
      "available keybindings",
      Array.from(keyMap.entries()).map(
        ([key, [category, action]]) => `${category}.${action} (${key})`
      )
    );

    return keyMap;
  }, []); // Run only once (not when the mode changes)

  // Create the key logger function
  const handleInput = useCallback(
    (input: string, key: any) => {
      // Log the raw key event for debugging
      keylogger.logKey(mode, key, input);

      // Find matching keybinding
      for (const [configKey, [category, action, parsed]] of keyMap.entries()) {
        const matches = matchKeybinding(input, key, parsed);

        // Log attempt details
        keylogger.logKeybindingAttempt(
          mode,
          { input, key },
          { input: configKey, key: parsed.key },
          matches
        );

        if (matches) {
          // Log the triggered action
          keylogger.logAction(mode, category, action, parsed.configured || "");

          // Log via the application logger
          logger.debug("KEYBINDING_TRIGGERED", {
            category,
            action,
            key: parsed.configured,
            mode,
          });
        }
      }
    },
    [keyMap, mode]
  );

  // Register input handler
  useInput(handleInput);
};
