import React from "react";
import { Box, Text, render } from "ink";
import { KeyBindingsHelp } from "./KeyBindingsHelp";

/**
 * KeyBindingsHelp Stories
 *
 * This file showcases the KeyBindingsHelp component in different contexts
 * using border-wrapped stories.
 */

// Story wrapper with border
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
      width={50}
      marginBottom={1}
    >
      {children}
    </Box>
  </Box>
);

// Main Stories component
const Stories = () => {
  // List of contexts to display
  const contexts = [
    "global",
    "navigation",
    "projects",
    "tasks",
    "ui",
    "search",
  ];

  return (
    <Box flexDirection="column">
      <Story title="All Keybindings">
        <KeyBindingsHelp contextual={false} />
      </Story>

      {contexts.map((context) => (
        <Story
          key={context}
          title={`${context.charAt(0).toUpperCase() + context.slice(1)} Context`}
        >
          <KeyBindingsHelp contextual={true} context={context} />
        </Story>
      ))}
    </Box>
  );
};

/**
 * Run this file directly to view the stories:
 * bun run src/keybindings/KeyBindingsHelp.story.tsx
 */
if (require.main === module) {
  render(<Stories />);
}

export default Stories;
