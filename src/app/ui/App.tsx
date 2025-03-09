import React, { useEffect } from "react";
import { useKeyboardNavigation, useStoreFocusManager } from "../keybindings";
import { debug, info } from "../../core/logger";
import { useAppStore } from "../../store";
import { Layout } from "./Layout";

/**
 * Main application component
 * Handles initialization, keyboard navigation, and renders the layout
 */
export const App = () => {
  const debugMode = useAppStore((s) => s.debugMode);
  const viewLogs = useAppStore((s) => s.viewLogs);

  // Add a log entry when the app starts
  useEffect(() => {
    info("APP_START", { timestamp: new Date().toISOString() });
  }, []);

  // Log when panels are toggled
  useEffect(() => {
    if (debugMode) {
      debug("PANEL_TOGGLE", { panel: "debug", state: "open" });
    }
  }, [debugMode]);

  useEffect(() => {
    if (viewLogs) {
      debug("PANEL_TOGGLE", { panel: "logs", state: "open" });
    }
  }, [viewLogs]);

  // Handle keyboard navigation
  useKeyboardNavigation();
  useStoreFocusManager();

  // Render the layout using our new Layout component
  return <Layout />;
};
