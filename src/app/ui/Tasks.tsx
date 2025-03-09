import { Box, Text, useFocus } from "ink";
import { useRemoteProjectData } from "../query";
import { useTask, useTasks } from "../../store";
import { type Task } from "../../core/types";
import { useEffect } from "react";
import { info } from "../../core/logger";
import { useAppStore } from "../../store";

/**
 * Component to display tasks for a selected project
 * Provides task navigation and selection
 */
export const Tasks = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, error } = useRemoteProjectData(projectId);
  const { project, tasks, updateProjectData } = useTasks(projectId);
  const { focusedId, setActiveView } = useAppStore();

  useEffect(() => {
    if (data) {
      updateProjectData(data);

      info("TASK_LOAD", {
        project_id: projectId,
        project_name: data.project.name,
        task_count: data.tasks.length,
      });

      // After data loads, ensure focus is set
      if (tasks.length > 0 && !focusedId) {
        setActiveView("tasks");
      }
    }
  }, [data, projectId, tasks, focusedId, setActiveView]);

  if (isLoading)
    return (
      <Box>
        <Text>Loading tasks...</Text>
      </Box>
    );

  if (error)
    return (
      <Box>
        <Text color="red">Error: {error.message}</Text>
      </Box>
    );

  return (
    <Box flexDirection="column">
      <Text bold color={config.theme.primary}>
        {project.name}
      </Text>
      {tasks.map((task) => (
        <Task key={task.id} projectId={projectId} taskId={task.id} />
      ))}
      {tasks.length === 0 && (
        <Text>No tasks in this project. Press 'a' to add a task.</Text>
      )}
    </Box>
  );
};

/**
 * Component to display a single task
 * Manages focus and selection states
 */
const Task = ({ projectId, taskId }: { projectId: string; taskId: string }) => {
  const { task, isActive, isSelected } = useTask(projectId, taskId);
  const { isFocused } = useFocus({ id: taskId });

  // Completed tasks have a different appearance
  const isCompleted = task.status === 2;

  return (
    <Box>
      <Text
        color={isActive ? config.theme.accent : "white"}
        dimColor={isCompleted}
      >
        {isFocused ? "› " : "  "}
        {isCompleted ? "[x]" : "[ ]"}
        {task.title.trim()}
        {isSelected ? " 🟡" : ""}
      </Text>
    </Box>
  );
};
