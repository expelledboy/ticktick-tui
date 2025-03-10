import React from "react";
import { Box, Text } from "ink";
import { getAllKeybindings } from "./config";
import { formatKeyBinding, parseKeybinding } from "./utils";

interface CompactKeyBindingsHelpProps {
  context?: string; // Display only a specific context, or all if not specified
}

// Formats action names from camelCase to a more readable format
function formatActionName(action: string): string {
  // For common actions, use shorter versions
  const shortNames: Record<string, string> = {
    // Global
    quit: "quit",
    help: "help",
    refresh: "refresh",
    // Tasks
    newTask: "new",
    completeTask: "done",
    deleteTask: "del",
    editTaskTitle: "edit",
    editTaskProperties: "props",
    // Sidebar
    toggleSidebar: "sidebar",
    toggleDebug: "debug",
    toggleLogs: "logs",
    // Search
    search: "search",
    toggleGlobalSearch: "global",
    // Navigation
    up: "up",
    down: "down",
    left: "left",
    right: "right",
    select: "select",
    back: "back",
    // Projects
    newProject: "new",
    deleteProject: "del",
    editProject: "edit",
  };

  // Return the short name if available
  return shortNames[action] || action;
}

// Format a keybinding and action pair with smart highlighting
function formatKeybindingPair(key: string, action: string): React.ReactNode {
  const actionName = formatActionName(action);
  const actionLower = actionName.toLowerCase();

  // Parse the key to handle modifiers properly
  const parsed = parseKeybinding(key);
  const hasModifiers = parsed.key.ctrl || parsed.key.shift || parsed.key.meta;

  // Extract the main key without modifiers
  // For example, from "ctrl+i" we get "i"
  const parts = key.toLowerCase().split("+");
  const mainKey = parts[parts.length - 1];

  // Build modifier prefix
  let prefix = "";
  if (parsed.key.ctrl) prefix += "ctrl+";
  if (parsed.key.shift) prefix += "shift+";
  if (parsed.key.meta) prefix += "meta+";

  // Check if the main key appears anywhere in the action name
  if (mainKey.length === 1) {
    // We need to find ANY match in the string, not just at position 0
    const matchIndex = actionLower.indexOf(mainKey);

    if (matchIndex >= 0) {
      // Key matches some character in the action
      const before = actionName.substring(0, matchIndex);
      const match = actionName.charAt(matchIndex);
      const after = actionName.substring(matchIndex + 1);

      // If we have modifiers, prefix them to the highlighted action
      if (hasModifiers) {
        return (
          <Text>
            <Text bold color="green">
              {prefix}
            </Text>
            {before}
            <Text bold color="green">
              {match}
            </Text>
            {after}
          </Text>
        );
      } else {
        // No modifiers, just show highlighted action
        return (
          <Text>
            {before}
            <Text bold color="green">
              {match}
            </Text>
            {after}
          </Text>
        );
      }
    }
  }

  // No match - show full key:action
  // Ensure all keys are lowercase
  const formattedKey = formatKeyBinding(key).toLowerCase();

  return (
    <Box>
      <Text bold color="green">
        {formattedKey}
      </Text>
      <Text>:</Text>
      <Text>{actionName}</Text>
    </Box>
  );
}

export const CompactKeyBindingsHelp: React.FC<CompactKeyBindingsHelpProps> = ({
  context,
}) => {
  const allKeybindings = getAllKeybindings();

  // Get the contexts to display
  const contextsToShow = context ? [context] : Object.keys(allKeybindings);

  // Items to display
  const items: React.ReactNode[] = [];

  // Process each context
  contextsToShow.forEach((category, categoryIndex) => {
    const bindings = allKeybindings[category as keyof typeof allKeybindings];
    if (!bindings || Object.keys(bindings).length === 0) return;

    // Process each keybinding
    Object.entries(bindings).forEach(([action, key], keyIndex) => {
      // Add spacing between keys
      if (items.length > 0) {
        items.push(<Text key={`${category}-${action}-space`}> </Text>);
      }

      // Format this keybinding pair
      items.push(
        <Box key={`${category}-${action}`}>
          {formatKeybindingPair(key, action)}
        </Box>
      );
    });
  });

  return (
    <Box flexDirection="row" flexWrap="wrap">
      {items}
    </Box>
  );
};
