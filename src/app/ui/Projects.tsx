import { useEffect } from "react";
import { useAppStore, useProject, useProjects } from "../../store";
import { useRemoteProjects } from "../query";
import { Box, Text, useFocus, useInput } from "ink";
import { type Project } from "../../core/types";
import { debug, info } from "../../core/logger";

/**
 * Component to display the list of projects
 */
export const Projects = () => {
  const { data, isLoading, error } = useRemoteProjects();
  const { projects, updateProjects } = useProjects();
  const setActiveView = useAppStore((s) => s.setActiveView);

  useEffect(() => {
    if (data) {
      // Update store for sorting
      updateProjects(data);
      // Log when projects are loaded
      info("PROJECT_LOAD", { count: data.length });
      // Set the active view to projects, as this is the first load
      setActiveView("projects");
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
      {projects.map((project) => (
        <Project key={project.project.id} projectId={project.project.id} />
      ))}
    </Box>
  );
};

const Project = ({ projectId }: { projectId: string }) => {
  const { project, isActive } = useProject(projectId);
  const { isFocused } = useFocus({ id: projectId });

  return (
    <Box>
      <Text color={isActive ? config.theme.accent : "white"}>
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
