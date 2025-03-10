/**
 * Project List Screen Component
 *
 * Displays a list of projects using the FocusList component
 * Fetches data from the API and manages project selection
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import FocusList, { type RenderItemProps } from "../../components/FocusList";
import { useProjects } from "../../ticktick";
import { useAppStore } from "../../store";
import { type Project } from "../../core/types";

export const ProjectList = () => {
  // Always call all hooks first, before any conditional logic
  const inFocus = useAppStore((s) => s.activeView === "projects");

  // Fetch projects data
  const { data: projects, isLoading, error } = useProjects();

  // Manage selected project
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useAppStore((s) => s.setSelectedProjectId);

  // Update projects in store
  const updateProjects = useAppStore((s) => s.updateProjects);
  const setActiveView = useAppStore((s) => s.setActiveView);

  useEffect(() => {
    if (projects) {
      updateProjects(projects);
    }
  }, [projects, updateProjects]);

  // Sorts project by sortOrder property
  const sortedProjects = useMemo(() => {
    return sortBySortOrder(projects ?? []);
  }, [projects]);

  // Handle project selection
  const handleSelectProject = useCallback(
    (project: Project | null) => {
      if (!project) return;

      setSelectedProjectId(project.id);
      setActiveView("project");
    },
    [setSelectedProjectId, setActiveView]
  );

  // Define renderItem function outside of FocusList props
  const renderProjectItem = useCallback(
    ({ item, isFocused, isSelected }: RenderItemProps<Project>) => {
      let color = undefined;
      if (isFocused && inFocus) color = "blue";
      if (isSelected) color = "green";

      return (
        <Box>
          <Text color={color}>
            {isFocused ? "› " : "  "} {item.name}
          </Text>
        </Box>
      );
    },
    [inFocus]
  );

  // Use a single return with conditional rendering instead of early returns
  return (
    <Box>
      {isLoading ? (
        // Render loading state
        <Text>Loading projects...</Text>
      ) : error ? (
        // Render error state
        <Text color="red">Error: {error.message}</Text>
      ) : (
        // Render the projects list
        <FocusList<Project>
          mode="projects"
          title="Projects"
          items={sortedProjects}
          selectedId={selectedProjectId}
          onSelect={handleSelectProject}
          emptyMessage="No projects found"
          getItemId={(project) => project.id}
          renderItem={renderProjectItem}
        />
      )}
    </Box>
  );
};

export default ProjectList;

/**
 * Helper function to sort projects by their sortOrder property
 */
function sortBySortOrder(projects: Project[]) {
  return projects.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
