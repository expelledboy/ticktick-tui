import { useFocusManager } from "ink";
import { useEffect } from "react";
import { useAppStore } from "../store";
import { debug } from "../core/logger";

/**
 * Hook for syncing the application store focus state with Ink's focus manager
 * Disables the default focus behavior and manages focus based on store state
 */
export const useStoreFocusManager = () => {
  const { disableFocus, focus } = useFocusManager();

  // Disable default focus behavior
  useEffect(disableFocus, [disableFocus]);

  // Sync task focus from store to Ink
  const focusedId = useAppStore((s) => s.focusedId);

  useEffect(() => {
    if (focusedId) focus(focusedId);
  }, [focusedId]);
};
