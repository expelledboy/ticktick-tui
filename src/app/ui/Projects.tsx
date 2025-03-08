import { useEffect, useRef } from "react";
import { useAppStore } from "../store";
import { useProjects } from "../query";
import { Box, Text, useFocus, useInput } from "ink";
import { type Project } from "../../types";

export const Projects = () => {
  const { data, isLoading, error } = useProjects();
  const updateProjects = useAppStore((s) => s.updateProjects);
  const selectProject = useAppStore((s) => s.selectProject);

  useEffect(() => {
    if (data) {
      updateProjects(data);
    }

    if (data?.length) {
      selectProject(data[0].id);
    }
  }, [data]);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <Box flexDirection="column">
      <Text color={config.theme.primary}>Projects</Text>
      {data?.map((project) => <Project key={project.id} project={project} />)}
    </Box>
  );
};

const Project = ({ project }: { project: Project }) => {
  const activeView = useAppStore((s) => s.activeView);
  const focusedProjectId = useAppStore((s) => s.viewState.projects.focusedId);
  const selectProject = useAppStore((s) => s.selectProject);
  const isSelected =
    useAppStore((s) => s.viewState.projects.selectedId) === project.id;

  const isActive = activeView === "projects";

  const { isFocused } = useFocus({
    isActive,
    autoFocus: isActive && focusedProjectId === project.id,
    id: project.id,
  });

  useInput(
    (input, key) => {
      if (key.return) selectProject(project.id);
    },
    { isActive: isFocused }
  );

  const name = fixProblematicEmojis(project.name);

  return (
    <Box>
      <Text color={isSelected ? config.theme.accent : "white"}>
        {name.trim()}
      </Text>
      {isFocused && <Text> ←</Text>}
    </Box>
  );
};

// TODO: Fix emojis that break the layout
const fixProblematicEmojis = (text: string) => {
  return text;
};
