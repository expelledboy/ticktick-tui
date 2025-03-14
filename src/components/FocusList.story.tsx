import React, { useState } from "react";
import { Box, Text } from "ink";
import FocusList from "./FocusList";
import type { StoryExport } from "@expelledboy/ink-storybook";

/**
 * FocusList Stories
 *
 * This file showcases the FocusList component in different scenarios
 * using ink-storybook to demonstrate its flexibility and usage patterns.
 */

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
      onSelect={(todo: TodoItem | null) => setSelectedId(todo?.id ?? null)}
      title="Todo Items"
      renderItem={({
        item,
        isFocused,
        isSelected,
      }: {
        item: TodoItem;
        isFocused: boolean;
        isSelected: boolean;
      }) => (
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
    renderItem={({ item }: { item: TodoItem }) => <Text>{item.title}</Text>}
  />
);

// List with custom header
const TodoListCustomHeader = () => (
  <FocusList<TodoItem>
    items={moreTodos}
    mode="global"
    title="More Tasks"
    renderItem={({
      item,
      isFocused,
    }: {
      item: TodoItem;
      isFocused: boolean;
    }) => (
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

const storyExport: StoryExport = {
  stories: [
    {
      id: "todo-list",
      title: "Basic",
      component: <TodoList />,
      description:
        "A todo list with focus and selection capabilities. Use arrow keys or j/k to navigate, and Enter to select items.",
    },
    {
      id: "empty-list",
      title: "Empty List Example",
      component: <EmptyList />,
      description:
        "An empty list with a customized message when no items are available.",
    },
    {
      id: "custom-header",
      title: "Custom Styling",
      component: <TodoListCustomHeader />,
      description:
        "Demonstrates using a custom header and custom styling for list items.",
    },
  ],
};

export default storyExport;
