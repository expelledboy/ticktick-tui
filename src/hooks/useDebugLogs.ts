import { useEffect } from "react";
import { debug } from "../core/logger";

export function useDebugLogs(component: string) {
  // Log component mounting
  useEffect(() => {
    debug("COMPONENT_MOUNTED", { component });

    return () => {
      debug("COMPONENT_UNMOUNTED", { component });
    };
  }, [component]);
}
