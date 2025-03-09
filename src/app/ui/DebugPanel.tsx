import { Box, Text } from "ink";
import { useAppStore } from "../../store";

/**
 * Component to display debug information
 * Shows current application state and keyboard shortcuts
 */
export const DebugPanel = () => {
  const { activeView, viewState } = useAppStore();

  return (
    <Box flexDirection="column">
      <Text bold>Debug Information</Text>
      <Text>Active View: {activeView}</Text>
      <Text>Projects Focus: {viewState.projects.focusedId || "none"}</Text>
      <Text>Projects Selected: {viewState.projects.selectedId || "none"}</Text>
      <Text>Tasks Focus: {viewState.tasks.focusedId || "none"}</Text>
      <Text>Tasks Selected: {viewState.tasks.selectedId || "none"}</Text>
      <Text bold>Keyboard Shortcuts:</Text>
      <Text>Ctrl+D: Toggle Debug Panel Ctrl+L: Toggle Logs Panel</Text>
    </Box>
  );
};
