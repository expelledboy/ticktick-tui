import React, { memo } from "react";
import { Box } from "ink";
import { useTerminalDimensions } from "../../hooks/useTerminalDimensions";
import { useAppStore } from "../../store";

/**
 * Main layout component that manages the positioning of all UI elements
 * Adapts to terminal dimensions and handles panel visibility
 * Uses flex layout for better organization and responsiveness
 */
export const Layout: React.FC<{
  Projects: React.ReactNode;
  Tasks: React.ReactNode;
  Debug: React.ReactNode;
  Logs: React.ReactNode;
  StatusBar: React.ReactNode;
  Help: React.ReactNode;
}> = memo(({ Projects, Tasks, Debug, Logs, StatusBar, Help }) => {
  // Get terminal dimensions
  const { width, height: heightReal } = useTerminalDimensions();

  // Reduce height abit, for consistency across different terminals
  const height = heightReal - 0;

  // Get app state using individual selectors for better memoization
  const debugMode = useAppStore((s) => s.debugMode);
  const viewLogs = useAppStore((s) => s.viewLogs);
  const viewProjects = useAppStore((s) => s.viewProjects);
  const logLines = useAppStore((s) => s.logLines);
  const viewHelp = useAppStore((s) => s.viewHelp);

  // Calculate logs panel height - enough for entries + header + borders
  const logsHeight = viewLogs ? logLines + 3 : 0;

  // Fixed dimensions
  const statusBarHeight = 2;
  const projectsWidth = 30; // Fixed width for Projects panel
  const helpWidth = viewHelp ? 42 : 0; // Help panel width
  const debugWidth = debugMode ? 30 : 0; // Debug panel width

  // Calculate main content height as remaining space
  const mainContentHeight = height - logsHeight - statusBarHeight;

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Main Content Area - Flex row layout */}
      <Box flexDirection="row" height={mainContentHeight} flexGrow={1}>
        {/* Projects Panel - Fixed width */}
        {viewProjects && (
          <Box
            width={projectsWidth}
            borderStyle="round"
            borderColor="green"
            flexShrink={0}
          >
            {Projects}
          </Box>
        )}

        {/* Tasks Panel - Takes remaining width */}
        <Box
          borderStyle="round"
          borderColor="green"
          flexGrow={1}
          flexShrink={1}
        >
          {Tasks}
        </Box>

        {/* Help Panel - Alongside Tasks */}
        {viewHelp && (
          <Box
            borderStyle="round"
            borderColor="red"
            width={helpWidth}
            flexShrink={1}
          >
            {Help}
          </Box>
        )}

        {/* Debug Panel - Alongside Tasks */}
        {debugMode && (
          <Box
            borderStyle="round"
            borderColor="yellow"
            width={debugWidth}
            flexShrink={1}
          >
            {Debug}
          </Box>
        )}
      </Box>

      {/* Status Bar - Full Width at Bottom */}
      <Box width={width} flexShrink={0}>
        {StatusBar}
      </Box>

      {/* Logs Panel - Full Width at Bottom when visible */}
      {viewLogs && (
        <Box
          borderStyle="round"
          borderColor="blue"
          width={width}
          height={logsHeight}
          flexShrink={0}
        >
          {Logs}
        </Box>
      )}
    </Box>
  );
});
