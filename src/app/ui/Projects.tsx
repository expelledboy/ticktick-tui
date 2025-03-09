import { useEffect } from "react";
import { useAppStore } from "../store";
import { useProjects } from "../query";
import { Box, Text, useFocus, useInput } from "ink";
import { type Project } from "../../core/types";
import { debug, info } from "../../core/logger";

/**
 * Component to display the list of projects
 * Provides navigation and selection of projects
 */
export const Projects = () => {
  const { data, isLoading, error } = useProjects();
  const updateProjects = useAppStore((s) => s.updateProjects);
  const selectProject = useAppStore((s) => s.selectProject);

  useEffect(() => {
    if (data) {
      updateProjects(data);
      // Log when projects are loaded
      info("PROJECT_LOAD", { count: data.length });
    }

    if (data?.length) {
      selectProject(data[0].id);
    }
  }, [data]);

  if (isLoading)
    return (
      <Box>
        <Text>Loading projects...</Text>
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
        Projects
      </Text>
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

  // Log when project is selected
  useEffect(() => {
    if (isSelected) {
      debug("PROJECT_SELECT", {
        id: project.id,
        name: project.name,
      });
    }
  }, [isSelected, project.id, project.name]);

  useInput(
    (input, key) => {
      if (key.return) {
        selectProject(project.id);
      }
    },
    { isActive: isFocused }
  );

  return (
    <Box>
      <Text color={isSelected ? config.theme.accent : "white"}>
        {isFocused ? "› " : "  "}
        {fixProblematicEmojis(project.name).trim()}
      </Text>
    </Box>
  );
};

// TODO: Fix emojis that break the layout
const fixProblematicEmojis = (text: string) => {
  return text;
};
