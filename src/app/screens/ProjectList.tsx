/**
 * Project List Screen Component
 *
 * Displays a list of projects using the FocusList component
 * Fetches data from the API and manages project selection
 */
import { useCallback, useEffect, useMemo } from "react";
import { Box, Text } from "ink";
import FocusList from "../../components/FocusList";
import { useRemoteProjects } from "../query";
import { useAppStore } from "../../store";
import { type Project } from "../../core/types";

export const ProjectList = () => {
  // Fetch projects data
  const { data, isLoading, error } = useRemoteProjects();

  // Access store with minimal selectors
  const updateProjects = useAppStore((s) => s.updateProjects);
  const activate = useAppStore((s) => s.activate);
  const setActiveView = useAppStore((s) => s.setActiveView);

  // Use primitive selectors to avoid unnecessary re-renders
  const activeProjectId = useAppStore((s) => s.active.projects);
  const projectsData = useAppStore((s) => s.projects);

  // Memoize the projects array to prevent re-renders
  const projects = useMemo(() => {
    return projectsData.map((p) => p.project);
  }, [projectsData]);

  // Update the store when data is fetched (only once per data change)
  useEffect(() => {
    if (data) {
      // Update store with project data
      updateProjects(data);

      // Set active view to projects on initial load if we have data and no active project
      if (data.length > 0 && !activeProjectId) {
        setActiveView("projects");
      }
    }
  }, [data, updateProjects, setActiveView, activeProjectId]);

  // Handle project selection
  const handleSelectProject = useCallback(
    (project: Project | null) => {
      if (!project) return;

      // Set the active project and move to tasks view
      activate();
    },
    [activate]
  );

  // Render loading state
  if (isLoading) {
    return (
      <Box>
        <Text>Loading projects...</Text>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error.message}</Text>
      </Box>
    );
  }

  // Render the projects list
  return (
    <FocusList
      items={projects}
      selectedId={activeProjectId}
      onSelect={handleSelectProject}
      title="Projects"
      getItemId={(project) => project.id}
      renderItem={({ item: project, isFocused, isSelected }) => (
        <Box>
          <Text color={isSelected ? "green" : isFocused ? "blue" : undefined}>
            {isFocused ? "› " : "  "}
            {project.name}
          </Text>
        </Box>
      )}
      emptyMessage="No projects found"
    />
  );
};

export default ProjectList;
