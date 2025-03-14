import { useEffect, useRef } from "react";
import { logToInMemory } from "../core/logger";

/**
 * Hook to log component lifecycle events for debugging and testing
 *
 * Logs VIEW_MOUNTED when component mounts
 * Logs VIEW_RENDERED on each render
 * Logs VIEW_UNMOUNTED when component unmounts
 */
export function useDebugLogs(component: string) {
  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Log component mounting
  useEffect(() => {
    // Log mount event
    logToInMemory("VIEW_MOUNTED", { component });

    // Log unmount event on cleanup
    return () => {
      logToInMemory("VIEW_UNMOUNTED", { component });
    };
  }, [component]);

  // Log render events
  useEffect(() => {
    // Skip first render since it's covered by VIEW_MOUNTED
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Log each subsequent render
    logToInMemory("VIEW_RENDERED", { component });
  });

  // Also log first render directly - this ensures tests can immediately find a render event
  if (isFirstRender.current) {
    logToInMemory("VIEW_RENDERED", { component });
  }
}
