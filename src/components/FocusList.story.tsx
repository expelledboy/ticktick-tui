import React, { useState } from "react";
import { Box, Text, render } from "ink";
import FocusList from "./FocusList";

/**
 * FocusList Stories
 *
 * This file showcases the FocusList component in different scenarios
 * to demonstrate its flexibility and usage patterns.
 */

// Story wrapper with border
const Story = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box flexDirection="column" marginBottom={2}>
    <Text bold underline color="yellow">
      {title}
    </Text>
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="yellow"
      width={50}
      marginBottom={1}
      padding={1}
    >
      {children}
    </Box>
  </Box>
);

// Define the data type for our examples
interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

// Sample data
const todos: TodoItem[] = [
  { id: "t1", title: "Buy groceries", completed: false },
  { id: "t2", title: "Finish report", completed: true },
  { id: "t3", title: "Call dentist", completed: false },
  { id: "t4", title: "Plan vacation", completed: false },
];

// Secondary todo list for other examples
const moreTodos: TodoItem[] = [
  { id: "m1", title: "Review code", completed: false },
  { id: "m2", title: "Write documentation", completed: true },
  { id: "m3", title: "Plan team meeting", completed: false },
];

// Interactive TodoList example with selection
const TodoList = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <FocusList<TodoItem>
      items={todos}
      mode="global"
      selectedId={selectedId}
      onSelect={(todo) => setSelectedId(todo?.id ?? null)}
      title="Todo Items"
      renderItem={({ item, isFocused, isSelected }) => (
        <Text
          backgroundColor={isFocused ? "blue" : undefined}
          color={isFocused ? "white" : undefined}
          bold={isSelected}
          strikethrough={item.completed}
        >
          {isSelected ? "▶ " : "  "}
          {item.completed ? "✓" : "☐"} {item.title}
        </Text>
      )}
    />
  );
};

// Empty list example
const EmptyList = () => (
  <FocusList<TodoItem>
    items={[]}
    mode="global"
    title="Empty List"
    emptyMessage="Nothing to see here!"
    renderItem={({ item }) => <Text>{item.title}</Text>}
  />
);

// List with custom header
const TodoListCustomHeader = () => (
  <FocusList<TodoItem>
    items={moreTodos}
    mode="global"
    title="More Tasks"
    renderItem={({ item, isFocused }) => (
      <Box>
        <Text
          backgroundColor={isFocused ? "green" : undefined}
          color={isFocused ? "black" : undefined}
        >
          {item.completed ? "✓" : "☐"} {item.title}
        </Text>
      </Box>
    )}
    renderHeader={() => (
      <Box>
        <Text bold color="green">
          Additional Todo Items
        </Text>
      </Box>
    )}
  />
);

// Main Stories component
const Stories = () => {
  return (
    <Box flexDirection="column">
      <Story title="Basic Todo List with Selection">
        <TodoList />
      </Story>

      <Story title="Empty List Example">
        <EmptyList />
      </Story>

      <Story title="Custom Header & Styling">
        <TodoListCustomHeader />
      </Story>

      <Text>
        Note: Use arrow keys or j/k to navigate, and Enter to select items.
      </Text>
      <Text>
        These stories will respond to your key presses via the keybinding
        system.
      </Text>
    </Box>
  );
};

/**
 * Run this file directly to view the stories:
 * bun run src/components/FocusList.story.tsx
 */
if (require.main === module) {
  render(<Stories />);
}

export default Stories;
