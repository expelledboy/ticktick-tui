import { Box, Text, useApp, type Key } from "ink";
import { Layout } from "./screens/Layout";
import { useKeyHandler } from "../keybindings/useKeyHandler";
import { useCallback } from "react";
import { useAppStore } from "../store";
import { CompactKeyBindingsHelp, KeyBindingsHelp } from "../keybindings";
import { __DEV } from "../core/logger";

// Screens
import ProjectList from "./screens/ProjectList";
import Project from "./screens/Project";
import DebugPanel from "./screens/DebugPanel";
import LogsPanel from "./screens/LogsPanel";
import { useKeyLogger } from "../keybindings/useKeyLogger";

/**
 * Main application component
 * Handles initialization, keyboard navigation, and renders the layout
 */
export const App = () => {
  const { exit } = useApp();
  const viewApp = useAppStore((s) => s.viewApp);
  const toggleViewHelp = useAppStore((s) => s.toggleViewHelp);
  const stopViewingApp = useAppStore((s) => s.stopViewingApp);
  const toggleDebugMode = useAppStore((s) => s.toggleDebugMode);
  const toggleViewLogs = useAppStore((s) => s.toggleViewLogs);
  const toggleViewProjects = useAppStore((s) => s.toggleViewProjects);
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const handleGlobalKeyBinding = useCallback(
    (actionCategory: string, action: string) => {
      if (actionCategory === "global") {
        switch (action) {
          case "quit":
            // XXX: Hack because app.clear() is not working
            stopViewingApp();
            setTimeout(() => exit(), 200);
            break;
        }
      }

      if (actionCategory === "ui") {
        switch (action) {
          case "toggleSidebar":
            toggleViewProjects();
            break;
          case "toggleDebug":
            toggleDebugMode();
            break;
          case "toggleLogs":
            toggleViewLogs();
            break;
        }
      }

      if (actionCategory === "navigation") {
        switch (action) {
          case "right":
            if (activeView === "projects") setActiveView("project");
            if (activeView === "project") setActiveView("task");
            break;
          case "left":
            if (activeView === "task") setActiveView("project");
            if (activeView === "project") setActiveView("projects");
            break;
        }
      }
    },
    [activeView, setActiveView]
  );

  const handleNativeKeys = useCallback(
    (input: string, key: Key) => {
      if (input === "?") toggleViewHelp();
      if (key.rightArrow && activeView === "projects") setActiveView("project");
      if (key.rightArrow && activeView === "project") setActiveView("task");
      if (key.leftArrow && activeView === "task") setActiveView("project");
      if (key.leftArrow && activeView === "project") setActiveView("projects");
    },
    [activeView, toggleViewHelp, setActiveView]
  );

  // Register keyboard handler
  useKeyHandler(handleGlobalKeyBinding, handleNativeKeys, "global");
  useKeyLogger(activeView);

  return viewApp ? (
    <Layout
      Projects={<ProjectList />}
      Project={<ProjectView />}
      Debug={<DebugPanel />}
      Logs={<LogsPanel />}
      StatusBar={<StatusBar />}
      Help={<KeyBindingsHelp />}
    />
  ) : (
    <Text>Ticking...</Text>
  );
};

const ProjectView = () => {
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);

  return (
    <Box>
      {selectedProjectId ? (
        <Project projectId={selectedProjectId} />
      ) : (
        <Text>No project selected</Text>
      )}
    </Box>
  );
};

const StatusBar = () => {
  return (
    <Box justifyContent="space-between">
      <CompactKeyBindingsHelp />
    </Box>
  );
};
