import { Box, Text } from "ink";
import { useAppStore } from "../../store";

/**
 * Component to display debug information
 * Shows current application state and keyboard shortcuts
 */
export const DebugPanel = () => {
  const { activeView, focusedId, active, selectedTaskIds, lastFocused } =
    useAppStore();

  return (
    <Box flexDirection="column">
      <Text bold>Debug Information</Text>
      <Text>Active View: {activeView}</Text>
      <Text>Focused: {focusedId || "none"}</Text>
      <Text>Active Project: {active.projects}</Text>
      <Text>Active Task: {active.tasks}</Text>
      <Text>Last Focused Project: {lastFocused.projects}</Text>
      <Text>Last Focused Task: {lastFocused.tasks}</Text>
      <Box flexDirection="column">
        {Array.from(selectedTaskIds).map((taskId) => (
          <Text key={taskId}>{taskId}</Text>
        ))}
      </Box>
      <Text bold>Keyboard Shortcuts:</Text>
      <Text>Ctrl+D: Toggle Debug Panel Ctrl+L: Toggle Logs Panel</Text>
    </Box>
  );
};
