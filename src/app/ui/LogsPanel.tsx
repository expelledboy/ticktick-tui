import { Box, Text } from "ink";
import { useAppStore } from "../store";
import { config } from "../../core/config";

/**
 * Component to display application logs
 * Shows the most recent log entries with formatted levels and operations
 */
export const LogsPanel = () => {
  const logs = useAppStore((s) => s.logs);

  // Get the colors from theme config
  const { theme } = config;

  // Map log levels to colors
  const levelColors = {
    INFO: theme.primary || "blue",
    DEBUG: theme.secondary || "gray",
    ERROR: theme.error || "red",
  };

  return (
    <Box flexDirection="column">
      <Text bold>Application Logs (Last 10)</Text>
      {logs.length === 0 ? (
        <Text>No logs yet...</Text>
      ) : (
        logs.map((log, index) => {
          // Extract the operation (format: [OPERATION] key=value...)
          const operationMatch = log.message.match(/\[([A-Z_]+)\]/);
          const operation = operationMatch ? operationMatch[0] : "";
          const messageParts = operationMatch
            ? log.message.split(operationMatch[0]).map((p) => p.trim())
            : [log.message];

          const keyValues = messageParts[1] || "";

          return (
            <Text key={index}>
              {log.timestamp.toLocaleTimeString()}{" "}
              <Text color={levelColors[log.level]} bold>
                {log.level.padEnd(5)}
              </Text>{" "}
              <Text color={theme.accent}>{operation}</Text> {keyValues}
            </Text>
          );
        })
      )}
    </Box>
  );
};
