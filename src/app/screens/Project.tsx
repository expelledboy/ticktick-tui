import { Box, Text } from "ink";
import { useProjectData } from "../../ticktick";
import FocusList, { type RenderItemProps } from "../../components/FocusList";
import type { Task } from "../../core/types";
import { useCallback, useState } from "react";
import { useAppStore } from "../../store";

export default function Project({ projectId }: { projectId: string }) {
  const inFocus = useAppStore((s) => s.activeView === "project");
  const { data: projectData, isLoading, error } = useProjectData(projectId);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleSelectTask = useCallback(
    (task: Task | null) => {
      if (task?.id === selectedTaskId) {
        setSelectedTaskId(null);
      } else {
        setSelectedTaskId(task?.id ?? null);
      }
    },
    [selectedTaskId]
  );

  const renderTaskItem = useCallback(
    ({ item: task, isFocused, isSelected }: RenderItemProps<Task>) => {
      let color = undefined;
      if (isFocused && inFocus) color = "blue";
      if (isSelected) color = "green";

      return (
        <Text color={color}>
          {isFocused ? "› " : "  "}
          {task.title}
        </Text>
      );
    },
    [inFocus]
  );

  return (
    <Box>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error.message}</Text>
      ) : !projectData ? (
        <Text>No project data available</Text>
      ) : (
        <FocusList<Task>
          mode="project"
          title={projectData.project.name}
          items={projectData.tasks}
          selectedId={selectedTaskId}
          onSelect={handleSelectTask}
          getItemId={(task) => task.id}
          emptyMessage="No tasks found"
          renderItem={renderTaskItem}
        />
      )}
    </Box>
  );
}
