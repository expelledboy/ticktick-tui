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
  { id: "t5", title: "Fix bug in code", completed: false },
  { id: "t6", title: "Prepare presentation", completed: false },
  { id: "t7", title: "Attend meeting", completed: false },
  { id: "t8", title: "Reply to emails", completed: true },
  { id: "t9", title: "Research new tools", completed: false },
  { id: "t10", title: "Update documentation", completed: false },
];

// Secondary todo list for other examples
const moreTodos: TodoItem[] = [
  { id: "m1", title: "Review code", completed: false },
  { id: "m2", title: "Write documentation", completed: true },
  { id: "m3", title: "Plan team meeting", completed: false },
];

// Generate a large dataset for scrolling demo
const generateLargeTodoList = (count: number): TodoItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `large-${i}`,
    title: `Task ${i + 1}: ${Math.random().toString(36).substring(2, 8)}`,
    completed: Math.random() > 0.7,
  }));
};

const largeTodoList = generateLargeTodoList(100);

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

// Scrollable TodoList example - showing scrollability feature
const ScrollableTodoList = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Box flexDirection="column">
      <Text bold>Scrollable TodoList (10 items, 4 visible)</Text>
      <Text dimColor>Use arrow keys to navigate. The list will scroll.</Text>

      <FocusList<TodoItem>
        items={todos}
        maxVisibleItems={4}
        showScrollbar={true}
        selectedId={selectedId}
        onSelect={(todo) => setSelectedId(todo?.id ?? null)}
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
    </Box>
  );
};

// Large list with custom scroll indicators
const LargeTodoList = () => {
  return (
    <Box flexDirection="column">
      <Text bold>Large TodoList (100 items, 5 visible)</Text>
      <Text dimColor>Demonstrates scrollability with a large dataset</Text>

      <FocusList<TodoItem>
        items={largeTodoList}
        maxVisibleItems={5}
        scrollTrackChar="┃"
        scrollThumbChar="■"
        scrollTrackColor="cyan"
        scrollThumbColor="green"
        renderItem={({ item, isFocused }) => (
          <Text
            backgroundColor={isFocused ? "green" : undefined}
            color={isFocused ? "black" : undefined}
          >
            {isFocused ? "→ " : "  "}
            {item.completed ? "✓" : "☐"} {item.title}
          </Text>
        )}
      />
    </Box>
  );
};

// List with pre-selected item in the middle
const PreselectedList = () => {
  const [selectedId, setSelectedId] = useState<string | null>("t5");

  return (
    <Box flexDirection="column">
      <Text bold>Pre-selected Item (10 items, 3 visible)</Text>
      <Text dimColor>List is automatically scrolled to show selected item</Text>

      <FocusList<TodoItem>
        items={todos}
        maxVisibleItems={3}
        selectedId={selectedId}
        onSelect={(todo) => setSelectedId(todo?.id ?? null)}
        renderItem={({ item, isFocused, isSelected }) => (
          <Box>
            <Text
              backgroundColor={isFocused ? "blue" : undefined}
              color={isFocused ? "white" : undefined}
              bold={isSelected}
              strikethrough={item.completed}
            >
              {item.title}
              {isSelected ? " (Selected)" : ""}
            </Text>
          </Box>
        )}
      />
    </Box>
  );
};

// Example with custom scrollbar characters
const CustomScrollbarList = () => {
  return (
    <Box flexDirection="column">
      <Text bold>Custom Scrollbar (10 items, 4 visible)</Text>
      <Text dimColor>Using custom characters and colors for scrollbar</Text>

      <FocusList<TodoItem>
        items={todos}
        maxVisibleItems={4}
        scrollTrackChar="·"
        scrollThumbChar="◆"
        scrollTrackColor="yellow"
        scrollThumbColor="magenta"
        renderItem={({ item, isFocused }) => (
          <Text
            backgroundColor={isFocused ? "magenta" : undefined}
            color={isFocused ? "white" : undefined}
          >
            {item.completed ? "✓" : "☐"} {item.title}
          </Text>
        )}
      />
    </Box>
  );
};

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
      id: "scrollable-list",
      title: "Scrollable List",
      component: <ScrollableTodoList />,
      description:
        "Demonstrates the scrollable list feature with 4 visible items at a time.",
    },
    {
      id: "large-list",
      title: "Large Dataset",
      component: <LargeTodoList />,
      description:
        "Shows how FocusList handles large datasets with custom scrollbar characters.",
    },
    {
      id: "preselected-item",
      title: "Pre-selected Item",
      component: <PreselectedList />,
      description: "Shows auto-scrolling to make a pre-selected item visible.",
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
    {
      id: "custom-scrollbar",
      title: "Custom Scrollbar",
      component: <CustomScrollbarList />,
      description:
        "Demonstrates customizing the scrollbar appearance with different characters.",
    },
  ],
};

export default storyExport;
