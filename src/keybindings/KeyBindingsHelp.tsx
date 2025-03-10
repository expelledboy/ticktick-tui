import React, { memo } from "react";
import { Box, Text } from "ink";
import { getAllKeybindings } from "./config";
import { formatKeyBinding } from "./utils";
import { getKeyMeta } from "./schema";

interface KeyBindingsHelpProps {
  contextual?: boolean;
  context?: string;
}

const KeyBindingsHelp: React.FC<KeyBindingsHelpProps> = ({
  contextual = false,
  context = "global",
}) => {
  const allKeybindings = getAllKeybindings();

  const renderSection = (
    category: string,
    bindings: Record<string, string>
  ) => (
    <Box key={category} flexDirection="column">
      <Text bold>{category.toUpperCase()}</Text>
      {Object.entries(bindings).map(([action, key]) => {
        const { description } = getKeyMeta(action as any);

        return (
          <Box key={action} marginLeft={1} flexDirection="row">
            <Box width={10} marginRight={1}>
              <Text dimColor bold>
                {formatKeyBinding(key)}
              </Text>
            </Box>
            <Text>{description}</Text>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Box flexDirection="column">
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
