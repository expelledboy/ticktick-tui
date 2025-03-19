import { Box, Text } from "ink";
import {
  useProjectData,
  type TaskPriority,
  type TaskStatus,
} from "../../ticktick";
import FocusList, { type RenderItemProps } from "../../components/FocusList";
import { sortOrder, type Task } from "../../core/types";
import { useCallback } from "react";
import { STORE_WRITE, useAppStore } from "../../store";
import { logError } from "../../core/logger";
import { formatTaskPriority, formatTaskStatus } from "../../ticktick/format";
import { useKeyHandler } from "../../keybindings";
import { useSortedTasks } from "../../hooks/useSortedTasks";
import { useDebugLogs } from "../../hooks/useDebugLogs";

export default function Project() {
  const inFocus = useAppStore((s) => s.activeView === "project");
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const selectedTaskId = useAppStore((s) => s.selectedTaskId);
  const availableHeight = useAppStore((s) => s.availableListHeight.project);

  // Calculate max visible items by subtracting header height from available height
  const maxVisibleItems = Math.max(1, availableHeight - 1); // for project name, task count, and sort order

  useDebugLogs("Project");

  const { sortedTasks, orderBy, setOrderBy } = useSortedTasks({
    projectId: selectedProjectId,
  });

  const {
    data: projectData,
    isLoading,
    error,
  } = useProjectData(selectedProjectId);

  // Toggle orderBy
  useKeyHandler("project", (_category, action) => {
    if (action === "toggleOrderBy") {
      setOrderBy(
        sortOrder[(sortOrder.indexOf(orderBy) + 1) % sortOrder.length]
      );
    }
  });

  // Toggle selected task
  const handleSelectTask = useCallback(
    (task: Task | null) => {
      if (task?.id === selectedTaskId) {
        STORE_WRITE.setSelectedTaskId(null);
      } else {
        STORE_WRITE.setSelectedTaskId(task?.id ?? null);
      }
    },
    [selectedTaskId]
  );

  const renderTaskItem = useCallback(
    ({ item: task, isFocused, isSelected }: RenderItemProps<Task>) => {
      const isOverdue = task.dueDate ? task.dueDate < new Date() : false;

      const dueDateContent = task.dueDate ? (
        <Text color={"red"} dimColor={!isOverdue} bold={isOverdue}>
          {" "}
          {isOverdue ? "overdue " : "due "}
          {formatDate(task.dueDate)}
        </Text>
      ) : null;

      const colorPriority = (() => {
        switch (formatTaskPriority(task.priority as TaskPriority)) {
          case "high":
            return "red";
          case "medium":
            return "yellow";
          case "low":
            return "blue";
          default:
            return undefined;
        }
      })();

      const status = (
        <Text color={colorPriority}>
          {formatTaskStatus((task.status ?? 0) as TaskStatus)}
        </Text>
      );

      return (
        <Text
          color={isSelected ? "green" : undefined}
          bold={isFocused && inFocus}
          wrap="truncate"
        >
          {isFocused ? "› " : "  "}
          {status}
          {task.title.trim()}
          {dueDateContent}
        </Text>
      );
    },
    [inFocus]
  );

  const Header = () => (
    <Box marginLeft={1}>
      <Text bold underline>
        {projectData?.project.name}
      </Text>
      <Text dimColor> {sortedTasks.length} tasks</Text>
      <Text dimColor> ordered by {orderBy}</Text>
    </Box>
  );

  // Loading state
  if (isLoading) {
    return (
      <Box padding={1}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="red">
            Error
          </Text>
        </Box>
        <Text>{error.message}</Text>
      </Box>
    );
  }

  // No project selected state
  if (!projectData) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="gray">
            No project selected
          </Text>
        </Box>
        <Text dimColor>Select a project from the list to view tasks</Text>
      </Box>
    );
  }

  // Custom empty renderer for when project has no tasks
  const renderEmpty = () => (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="gray">
          No tasks found
        </Text>
      </Box>
      <Text dimColor>
        This project has no tasks. Create a new task to get started.
      </Text>
    </Box>
  );

  // Project with tasks
  return (
    <FocusList<Task>
      mode="project"
      renderHeader={Header}
      items={sortedTasks}
      selectedId={selectedTaskId}
      onSelect={handleSelectTask}
      getItemId={(task) => task.id}
      renderEmpty={renderEmpty}
      renderItem={renderTaskItem}
      maxVisibleItems={maxVisibleItems}
      showScrollbar={true}
      scrollTrackChar="│"
      scrollThumbChar="│"
      scrollTrackColor="gray"
      scrollThumbColor="green"
    />
  );
}

/**
 * Format a date string to a readable format relative to the current time
 * Returns strings like "Today", "Tomorrow", "Yesterday", "In 3 days", "3 days ago", etc.
 */
function formatDate(date: Date | undefined): string {
  if (date === undefined) return "";

  try {
    const now = new Date();

    // Reset time components to compare just the dates
    const dateWithoutTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const nowWithoutTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Calculate difference in days
    const diffTime = dateWithoutTime.getTime() - nowWithoutTime.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Return relative date string
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  } catch (e) {
    // Return original string if parsing fails
    return date.toLocaleDateString();
  }
}

const sortTasks = (
  tasks: Task[],
  orderBy: "priority" | "dueDate" | "default"
) => {
  switch (orderBy) {
    case "priority":
      return sortTasksByPriority(sortTasksByOrder(tasks)).reverse();
    case "dueDate":
      return sortTasksByDueDate(sortTasksByOrder(tasks)).reverse();
    default:
      return sortTasksByOrder(tasks);
  }
};

const sortTasksByPriority = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    return priorityA - priorityB;
  });
};

const sortTasksByDueDate = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    // TODO: Figure out way zod doesn't parse dates
    const dueDateA = new Date(a.dueDate ?? new Date());
    const dueDateB = new Date(b.dueDate ?? new Date());
    try {
      return dueDateA.getTime() - dueDateB.getTime();
    } catch (e) {
      logError("INVALID_DATA", {
        dueDateA: dueDateA.toISOString(),
        dueDateB: dueDateB.toISOString(),
        dueDateAIsDate: dueDateA instanceof Date,
        dueDateBIsDate: dueDateB instanceof Date,
        message: "dueDate is not a date",
      });
      return 0;
    }
  });
};

const sortTasksByOrder = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    if (a.sortOrder === b.sortOrder) return a.id.localeCompare(b.id);
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    return orderA - orderB;
  });
};
