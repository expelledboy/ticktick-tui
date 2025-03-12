import { Box, Newline, Text } from "ink";
import { useDebugLogs } from "../../hooks/useDebugLogs";
import { useTask } from "../../store/useTask";

export default function TaskPanel() {
  const task = useTask();

  useDebugLogs("TaskPanel");

  if (!task) {
    return <Text>No task selected</Text>;
  }

  const context = `
    Task ${task.id}
    Title: ${task.title}
    Description: ${task.content}
    Due Date: ${task.dueDate ? new Date(task.dueDate).toISOString() : "N/A"}
    Status: ${task.status}
    Priority: ${task.priority}
  `;

  return (
    <Box>
      <Text>{context}</Text>
    </Box>
  );
}
