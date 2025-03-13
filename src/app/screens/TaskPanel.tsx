import { Box, Newline, Text } from "ink";
import { useDebugLogs } from "../../hooks/useDebugLogs";
import { useTask } from "../../store/useTask";
import { formatTaskPriority } from "../../ticktick/format";
import type { TaskPriority } from "../../ticktick/types";

/**
 * TaskPanel component displays detailed information about the selected task
 * Shows task properties in a structured format with appropriate styling
 */
export default function TaskPanel() {
  const task = useTask();

  useDebugLogs("TaskPanel");

  if (!task) {
    // Empty state styling matches the task view (left-aligned)
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="gray">
            No task selected
          </Text>
        </Box>
        <Text dimColor>Select a task from the list to view details</Text>
      </Box>
    );
  }

  // Format the due date nicely if it exists
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not set";

  // Check if task is overdue
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  // Determine priority color - using correct mapping from format.ts
  const getPriorityColor = () => {
    switch (task.priority) {
      case 5:
        return "red"; // High priority
      case 3:
        return "yellow"; // Medium priority
      case 1:
        return "blue"; // Low priority
      default:
        return undefined;
    }
  };

  // Get formatted priority text
  const getPriorityText = () => {
    // Ensure we have a valid priority value
    const priority = (task.priority ?? 0) as TaskPriority;
    return formatTaskPriority(priority);
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Task title */}
      <Box marginBottom={1}>
        <Text bold>{task.title}</Text>
      </Box>

      {/* Task metadata in a structured layout */}
      <Box flexDirection="column" marginBottom={1}>
        {/* Status and Priority */}
        <Box>
          <Box width={12}>
            <Text bold>Status:</Text>
          </Box>
          <Text>{task.status === 0 ? "Open" : "Completed"}</Text>
        </Box>

        {/* Priority */}
        <Box>
          <Box width={12}>
            <Text bold>Priority:</Text>
          </Box>
          <Text color={getPriorityColor()}>
            {getPriorityText().charAt(0).toUpperCase() +
              getPriorityText().slice(1)}
          </Text>
        </Box>

        {/* Due Date */}
        <Box>
          <Box width={12}>
            <Text bold>Due:</Text>
          </Box>
          <Text color={isOverdue ? "red" : undefined}>
            {formattedDueDate} {isOverdue ? "(Overdue)" : ""}
          </Text>
        </Box>
      </Box>

      {/* Task description/content */}
      {task.content && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>Description:</Text>
          <Box marginLeft={1} marginTop={1}>
            <Text wrap="wrap">{task.content}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
