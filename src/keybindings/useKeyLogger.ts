import { useInput } from "ink";
import { useCallback, useMemo } from "react";
import * as logger from "../core/logger";
import { keylogger } from "./keylogger";
import { useAppStore } from "../store";
import { isNavigationAction } from "./useKeyHandler";
import {
  findMatchingBinding,
  configToBindings,
  type KeyContext,
  type RawInput,
} from "./KeyBindingSystem";
import { getAllKeybindings } from "./config";
import { emptyKey } from "./utils";

/**
 * Hook to log keyboard input and keybinding matches
 * This is separate from useKeyHandler to avoid duplicate logging
 */
export const useKeyLogger = () => {
  const activeView = useAppStore((s) => s.activeView);

  // Convert config to bindings once
  const bindings = useMemo(() => {
    const bindings = configToBindings(getAllKeybindings() as any);

    // Log available keybindings for debugging
    keylogger.logDebug(
      "global",
      "available keybindings",
      bindings.map(
        (binding) =>
          `${binding.action.category}.${binding.action.action} (${binding.pattern})`
      )
    );

    return bindings;
  }, []);

  // Create the key logger function
  const handleInput = useCallback(
    (input: string, key: any) => {
      // Log the raw key event for debugging
      keylogger.logKey(activeView, key, input);

      // Handle navigation keys directly
      const navAction = isNavigationAction(key);
      if (navAction) {
        logger.debug("KEYBINDING_TRIGGERED", {
          category: "navigation",
          action: navAction,
          key: JSON.stringify(input),
          mode: activeView,
        });
        return;
      }

      // Create context and raw input
      const context: KeyContext = {
        mode: "global", // Logger always uses global mode to catch all bindings
        activeView,
      };

      const rawInput: RawInput = {
        input,
        key: {
          ...key,
          space: input === " " || false,
        },
      };

      // Find matching binding using our new system
      const matchedBinding = findMatchingBinding(bindings, rawInput, context);

      if (matchedBinding) {
        const { category, action } = matchedBinding.action;

        // Log the triggered action
        keylogger.logAction(
          activeView,
          category,
          action,
          matchedBinding.pattern || ""
        );

        // Log via the application logger
        logger.debug("KEYBINDING_TRIGGERED", {
          category,
          action,
          key: JSON.stringify(matchedBinding.pattern),
          mode: activeView,
        });
      }
    },
    [bindings, activeView]
  );

  // Register input handler
  useInput(handleInput);
};
