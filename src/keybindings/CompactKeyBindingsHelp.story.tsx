import React from "react";
import { Box, Text, render } from "ink";
import { CompactKeyBindingsHelp } from "./CompactKeyBindingsHelp";

/**
 * CompactKeyBindingsHelp Stories
 *
 * This file showcases the CompactKeyBindingsHelp component in different contexts
 * using border-wrapped stories.
 */

// Story wrapper with border - matching KeyBindingsHelp.story.tsx
const Story = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box flexDirection="column">
    <Text bold underline color="yellow">
      {title}
    </Text>
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="yellow"
      width={120}
      marginBottom={1}
      paddingX={1}
    >
      {children}
    </Box>
  </Box>
);

// Main Stories component
const Stories = () => {
  return (
    <Box flexDirection="column">
      <Story title="All Keybindings ">
        <CompactKeyBindingsHelp />
      </Story>

      <Story title="Single Context - Global">
        <CompactKeyBindingsHelp context="global" />
      </Story>

      <Story title="Tasks">
        <CompactKeyBindingsHelp context="tasks" />
      </Story>

      <Story title="Projects">
        <CompactKeyBindingsHelp context="projects" />
      </Story>
    </Box>
  );
};

/**
 * Run this file directly to view the stories:
 * bun run src/keybindings/CompactKeyBindingsHelp.story.tsx
 */
if (require.main === module) {
  render(<Stories />);
}

export default Stories;
