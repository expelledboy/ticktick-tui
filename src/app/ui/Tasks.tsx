import { Box, Text, useFocus } from "ink";
import { useProjectData } from "../query";
import { useAppStore } from "../store";
import { type Task } from "../../types";
import { useEffect } from "react";

export const Tasks = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, error } = useProjectData(projectId);
  const selectTask = useAppStore((s) => s.selectTask);
  const updateProjectData = useAppStore((s) => s.updateProjectData);

  useEffect(() => {
    if (data) {
      updateProjectData(data);
    }

    if (data?.tasks.length) {
      selectTask(data.tasks[0].id);
    }
  }, [data]);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Box flexDirection="column">
      <Text color={config.theme.primary}>Tasks</Text>
      {data?.tasks.map((task) => <Task key={task.id} task={task} />)}
    </Box>
  );
};

const Task = ({ task }: { task: Task }) => {
  const activeView = useAppStore((s) => s.activeView);
  const focusedTaskId = useAppStore((s) => s.viewState.tasks.focusedId);
  const isActive = activeView === "tasks";

  const { isFocused } = useFocus({
    isActive,
    autoFocus: isActive && focusedTaskId === task.id,
    id: task.id,
  });

  return (
    <Box>
      <Text color={isFocused ? config.theme.accent : "white"}>
        {task.title.trim()}
      </Text>
      {isFocused && <Text> ←</Text>}
    </Box>
  );
};
