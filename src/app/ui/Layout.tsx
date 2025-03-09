import React from "react";
import { Box } from "ink";
import { useTerminalDimensions } from "./useTerminalDimensions";
import { useAppStore } from "../store";
import { Projects } from "./Projects";
import { Tasks } from "./Tasks";
import { DebugPanel } from "./DebugPanel";
import { LogsPanel } from "./LogsPanel";

/**
 * Main layout component that manages the positioning of all UI elements
 * Adapts to terminal dimensions and handles panel visibility
 */
export const Layout: React.FC = () => {
  // Get terminal dimensions
  const { width, height } = useTerminalDimensions();

  // Get app state
  const viewProjects = useAppStore((s) => s.viewProjects);
  const selectedProjectId = useAppStore((s) => s.viewState.projects.selectedId);
  const debugMode = useAppStore((s) => s.debugMode);
  const viewLogs = useAppStore((s) => s.viewLogs);

  // Calculate logs panel height - enough for 10 entries + header + borders
  const logsHeight = viewLogs ? 13 : 0;

  // Calculate main content height as remaining space
  const mainContentHeight = height - logsHeight;

  // Calculate widths for the left side
  const leftSideWidth = Math.floor(width * 0.3);
  const projectsHeight = debugMode
    ? Math.floor(mainContentHeight * 0.6)
    : mainContentHeight;
  const debugHeight = debugMode ? mainContentHeight - projectsHeight : 0;

  // Tasks width (remaining space)
  const tasksWidth = width - leftSideWidth;

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Main Content Area */}
      <Box flexDirection="row" height={mainContentHeight}>
        {/* Left Side - Projects and Debug */}
        <Box flexDirection="column" width={leftSideWidth}>
          {/* Projects Panel */}
          {viewProjects && (
            <Box
              borderStyle="round"
              borderColor="green"
              height={projectsHeight}
            >
              <Projects />
            </Box>
          )}

          {/* Debug Panel */}
          {debugMode && (
            <Box borderStyle="round" borderColor="yellow" height={debugHeight}>
              <DebugPanel />
            </Box>
          )}
        </Box>

        {/* Tasks Panel */}
        {selectedProjectId && (
          <Box borderStyle="round" borderColor="green" width={tasksWidth}>
            <Tasks projectId={selectedProjectId} />
          </Box>
        )}
      </Box>

      {/* Logs Panel - Full Width at Bottom */}
      {viewLogs && (
        <Box
          borderStyle="round"
          borderColor="blue"
          width={width}
          height={logsHeight}
        >
          <LogsPanel />
        </Box>
      )}
    </Box>
  );
};
