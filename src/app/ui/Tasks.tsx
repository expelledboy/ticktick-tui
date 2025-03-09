import { Box, Text, useFocus } from "ink";
import { useProjectData } from "../query";
import { useAppStore } from "../store";
import { type Task } from "../../types";
import { useEffect } from "react";
import { debug, info } from "../../logger";

/**
 * Component to display tasks for a selected project
 * Provides task navigation and selection
 */
export const Tasks = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, error } = useProjectData(projectId);
  const selectTask = useAppStore((s) => s.selectTask);
  const updateProjectData = useAppStore((s) => s.updateProjectData);

  useEffect(() => {
    if (data) {
      updateProjectData(data);
      // Log when tasks are loaded
      info("TASK_LOAD", {
        project_id: projectId,
        project_name: data.project.name,
        task_count: data.tasks.length,
      });
    }

    if (data?.tasks.length) {
      selectTask(data.tasks[0].id);
    }
  }, [data, projectId]);

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
        Tasks - {data?.project.name}
      </Text>
      {data?.tasks.map((task) => <Task key={task.id} task={task} />)}
      {data?.tasks.length === 0 && (
        <Text>No tasks in this project. Press 'a' to add a task.</Text>
      )}
    </Box>
  );
};

/**
 * Component to display a single task
 * Manages focus and selection states
 */
const Task = ({ task }: { task: Task }) => {
  const activeView = useAppStore((s) => s.activeView);
  const focusedTaskId = useAppStore((s) => s.viewState.tasks.focusedId);
  const isSelected =
    useAppStore((s) => s.viewState.tasks.selectedId) === task.id;
  const isActive = activeView === "tasks";

  const { isFocused } = useFocus({
    isActive,
    autoFocus: isActive && focusedTaskId === task.id,
    id: task.id,
  });

  // Log when task is selected
  useEffect(() => {
    if (isSelected) {
      debug("TASK_SELECT", {
        id: task.id,
        title: task.title,
        status: task.status === 2 ? "completed" : "pending",
      });
    }
  }, [isSelected, task.id, task.title, task.status]);

  // Completed tasks have a different appearance
  const isCompleted = task.status === 2;

  return (
    <Box>
      <Text
        color={isFocused ? config.theme.accent : isCompleted ? "gray" : "white"}
        dimColor={isCompleted}
      >
        {isFocused ? "› " : "  "}
        {task.title.trim()}
      </Text>
    </Box>
  );
};
