import { Box, Text, useInput, useApp, type Key } from "ink";
import { Layout } from "./screens/Layout";
import { DebugPanel } from "./screens/DebugPanel";
import { LogsPanel } from "./screens/LogsPanel";
import { useKeyHandler } from "../keybindings/useKeyHandler";
import { useCallback } from "react";
import { useAppStore } from "../store";
import { CompactKeyBindingsHelp, KeyBindingsHelp } from "../keybindings";
import ProjectList from "./screens/ProjectList";
import { useStoreFocusManager } from "../hooks/useStoreFocusManager";

const DummyScreen = ({ title }: { title: string }) => {
  useInput((input, key) => {
    if (key.return) {
      console.log("enter");
    }
  });

  return (
    <Box>
      <Text>{title}</Text>
    </Box>
  );
};

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
    },
    []
  );

  const handleNativeKeys = useCallback(
    (input: string, key: Key) => {
      if (input === "?") toggleViewHelp();
    },
    [toggleViewHelp]
  );

  // Register keyboard handler
  useKeyHandler(handleGlobalKeyBinding, handleNativeKeys);

  return viewApp ? (
    <Layout
      Projects={<ProjectList />}
      Tasks={<DummyScreen title="Tasks" />}
      Debug={<DebugPanel />}
      Logs={<LogsPanel />}
      StatusBar={
        <Box justifyContent="space-between">
          <CompactKeyBindingsHelp />
        </Box>
      }
      Help={<KeyBindingsHelp />}
    />
  ) : (
    <Text>Ticking...</Text>
  );
};
