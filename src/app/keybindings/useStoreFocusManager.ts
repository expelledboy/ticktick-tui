import { useFocusManager } from "ink";
import { useEffect } from "react";
import { useAppStore } from "../store";

/**
 * Hook for syncing the application store focus state with Ink's focus manager
 * Disables the default focus behavior and manages focus based on store state
 */
export const useStoreFocusManager = () => {
  const { disableFocus, focus } = useFocusManager();

  // Disable default focus behavior
  useEffect(disableFocus, []);

  // Sync task focus from store to Ink
  const focusedTaskId = useAppStore((s) => s.viewState.tasks.focusedId);
  useEffect(() => {
    if (focusedTaskId) focus(focusedTaskId);
  }, [focusedTaskId]);

  // Sync project focus from store to Ink
  const focusedProjectId = useAppStore((s) => s.viewState.projects.focusedId);
  useEffect(() => {
    if (focusedProjectId) focus(focusedProjectId);
  }, [focusedProjectId]);
};
