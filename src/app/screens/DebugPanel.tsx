import { Box, Text } from "ink";
import { useAppStore } from "../../store";

/**
 * Component to display debug information
 * Shows current application state and keyboard shortcuts
 */
export const DebugPanel = () => {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <Box flexDirection="column">
      <Text bold underline>
        Dev Tools
      </Text>
      <Text>View: {activeView}</Text>
    </Box>
  );
};

export default DebugPanel;
