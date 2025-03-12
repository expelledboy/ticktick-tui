import React, { memo, useMemo } from "react";
import { Box, Text } from "ink";
import { getAllKeybindings } from "./config";
import { formatKeyBinding, getBindingPriorities } from "./utils";
import { getKeyMeta } from "./schema";
import { BindingPriority, type KeyContext } from "./KeyBindingSystem";
import { useAppStore } from "../store";

// Map priority to a visual indicator and color
const priorityIndicators: Record<
  BindingPriority,
  { symbol: string; color: string }
> = {
  [BindingPriority.ModifierKey]: { symbol: "★", color: "magenta" },
  [BindingPriority.ExactModeMatch]: { symbol: "●", color: "green" },
  [BindingPriority.GlobalAction]: { symbol: "◉", color: "blue" },
  [BindingPriority.Fallback]: { symbol: "○", color: "yellow" },
};

interface KeyBindingsHelpProps {
  contextual?: boolean;
  context?: string;
}

const KeyBindingsHelp: React.FC<KeyBindingsHelpProps> = ({
  contextual = false,
  context = "global",
}) => {
  const allKeybindings = getAllKeybindings();
  const activeView = useAppStore((s) => s.activeView);

  // Create context for determining binding priorities
  const keyContext = useMemo<KeyContext>(
    () => ({
      mode: context as any,
      activeView,
    }),
    [context, activeView]
  );

  // Get binding priorities for the current context
  const bindingPriorities = useMemo(
    () => getBindingPriorities(keyContext),
    [keyContext]
  );

  const renderSection = (
    category: string,
    bindings: Record<string, string>
  ) => (
    <Box key={category} flexDirection="column">
      <Text bold>{category.toUpperCase()}</Text>
      {Object.entries(bindings).map(([action, key]) => {
        const { description } = getKeyMeta(action as any);
        const bindingKey = `${category}.${action}`;
        const priorityInfo = bindingPriorities[bindingKey];
        const isActive = priorityInfo?.active || false;
        const priority = priorityInfo?.priority;

        let priorityIndicator = null;
        if (priority !== null && isActive) {
          const indicator = priorityIndicators[priority];
          priorityIndicator = (
            <Text color={indicator.color}>{indicator.symbol}</Text>
          );
        }

        return (
          <Box key={action} marginLeft={1} flexDirection="row">
            {/* Priority indicator */}
            <Box width={2}>{priorityIndicator || <Text> </Text>}</Box>

            {/* Key binding */}
            <Box width={10}>
              <Text dimColor={!isActive} bold>
                {formatKeyBinding(key)}
              </Text>
            </Box>

            {/* Description */}
            <Text dimColor={!isActive}>{description}</Text>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Box flexDirection="row">
          <Box width={2} />
          <Text>Priority: </Text>
        </Box>
        <Box flexDirection="row">
          <Box marginRight={1}>
            <Text color="green">●</Text>
          </Box>
          <Text>Exact Mode</Text>
        </Box>
        <Box flexDirection="row">
          <Box width={2} />
          <Box marginRight={1}>
            <Text color="blue">◉</Text>
          </Box>
          <Text>Global Action</Text>
        </Box>
        <Box flexDirection="row">
          <Box width={2} />
          <Box marginRight={1}>
            <Text color="yellow">○</Text>
          </Box>
          <Text>Fallback</Text>
        </Box>
      </Box>

      {contextual
        ? renderSection(
            context,
            allKeybindings[context as keyof typeof allKeybindings] || {}
          )
        : Object.entries(allKeybindings).map(([category, bindings]) =>
            renderSection(category, bindings)
          )}
    </Box>
  );
};

export default memo(KeyBindingsHelp);
