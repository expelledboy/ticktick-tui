import React, { memo, useEffect } from "react";
import { Box } from "ink";
import { useTerminalDimensions } from "../../hooks/useTerminalDimensions";
import { useAppStore } from "../../store";
import { SHOW_NUM_LOGS } from "../../constants";

/**
 * Main layout component that manages the positioning of all UI elements
 * Adapts to terminal dimensions and handles panel visibility
 * Uses flex layout for better organization and responsiveness
 */
export const Layout: React.FC<{
  Projects: React.ReactNode;
  Project: React.ReactNode;
  Task: React.ReactNode;
  Debug: React.ReactNode;
  Logs: React.ReactNode;
  StatusBar: React.ReactNode;
  Help: React.ReactNode;
}> = memo(({ Projects, Project, Task, Debug, Logs, StatusBar, Help }) => {
  // Get terminal dimensions
  const { width, height: heightReal } = useTerminalDimensions();

  // Reduce height abit, for consistency across different terminals
  const height = heightReal - 0;

  // Get app state using individual selectors for better memoization
  const debugMode = useAppStore((s) => s.debugMode);
  const viewLogs = useAppStore((s) => s.viewLogs);
  const viewProjects = useAppStore((s) => s.viewProjects);
  const viewHelp = useAppStore((s) => s.viewHelp);

  // Calculate logs panel height - enough for entries + header + borders
  const logsHeight = viewLogs ? SHOW_NUM_LOGS + 3 : 0;

  // Fixed dimensions
  const statusBarHeight = 2;
  const projectsWidth = 30; // Fixed width for Projects panel
  const helpWidth = viewHelp ? 42 : 0; // Help panel width
  const debugWidth = debugMode ? 30 : 0; // Debug panel width

  // Width threshold to determine layout type
  const isWideTerminal = width > 160; // Switch to horizontal layout when terminal is wider than 160 chars

  // Calculate remaining width after accounting for fixed-width panels
  const fixedWidthPanels =
    (viewProjects ? projectsWidth : 0) + helpWidth + debugWidth;
  const remainingWidth = width - fixedWidthPanels;

  // Adjust Task panel width based on available space and layout mode
  const taskPanelWidth = isWideTerminal
    ? Math.min(100, Math.floor(remainingWidth * 0.4)) // In wide mode: either 100 chars or 40% of remaining width
    : undefined; // In narrow mode: full width

  // Calculate main content height as remaining space
  const mainContentHeight = height - logsHeight - statusBarHeight;

  // Height proportions for vertical layout
  const projectPanelHeightRatio = 0.65; // Project panel takes 65% of height in vertical layout
  const taskPanelHeightRatio = 0.35; // Task panel takes 35% of height in vertical layout

  return (
    <Box flexDirection="column" width={width} height={height}>
      {/* Main Content Area - Flex row layout */}
      <Box flexDirection="row" height={mainContentHeight} flexGrow={1}>
        {/* Projects List - Fixed width */}
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

        {/* Project and Task Panel container - adaptable based on terminal width */}
        <Box
          flexDirection={isWideTerminal ? "row" : "column"}
          borderStyle="round"
          borderColor="green"
          flexGrow={1}
          flexShrink={1}
        >
          {/* Project Panel */}
          <Box
            flexShrink={0}
            flexGrow={isWideTerminal ? 1 : 0}
            height={
              isWideTerminal
                ? undefined
                : Math.floor(mainContentHeight * projectPanelHeightRatio)
            }
            paddingX={1}
          >
            {Project}
          </Box>

          {/* Task Panel - width/position changes based on terminal width */}
          <Box
            borderStyle={isWideTerminal ? "single" : "single"}
            borderLeft={isWideTerminal}
            borderRight={false}
            borderTop={!isWideTerminal}
            borderBottom={false}
            borderColor="green"
            width={isWideTerminal ? taskPanelWidth : undefined}
            flexShrink={isWideTerminal ? 0 : 1}
            height={
              isWideTerminal
                ? undefined
                : Math.floor(mainContentHeight * taskPanelHeightRatio)
            }
            paddingX={1}
          >
            {Task}
          </Box>
        </Box>

        {/* Help Panel - Positioned at the rightmost position */}
        {viewHelp && (
          <Box
            borderStyle="round"
            borderLeft={true}
            borderColor="red"
            width={helpWidth}
            flexShrink={0}
            paddingX={1}
          >
            {Help}
          </Box>
        )}

        {/* Debug Panel - Alongside Project */}
        {debugMode && (
          <Box
            borderStyle="single"
            borderLeft={true}
            borderRight={false}
            borderTop={false}
            borderBottom={false}
            borderColor="yellow"
            width={debugWidth}
            flexShrink={1}
            paddingX={1}
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
          borderStyle="single"
          borderTop={true}
          borderLeft={false}
          borderRight={false}
          borderBottom={false}
          borderColor="blue"
          width={width}
          height={logsHeight}
          flexShrink={0}
          paddingX={1}
        >
          {Logs}
        </Box>
      )}
    </Box>
  );
});
