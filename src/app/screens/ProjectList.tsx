/**
 * Project List Screen Component
 *
 * Displays a list of projects using the FocusList component
 * Fetches data from the API and manages project selection
 */
import { Box, Text } from "ink";
import { useCallback, useMemo } from "react";
import FocusList, { type RenderItemProps } from "../../components/FocusList";
import { type Project } from "../../core/types";
import { useDebugLogs } from "../../hooks/useDebugLogs";
import { useProjects } from "../../ticktick";
import { STORE_WRITE, useAppStore } from "../../store";

const sortProjects = (projects: Project[]) => {
  return [...projects].sort((a, b) => {
    if (a.closed && !b.closed) return 1;
    if (!a.closed && b.closed) return -1;
    if (a.sortOrder && b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });
};

export const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects();
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const inFocus = useAppStore((s) => s.activeView === "projects");
  const availableHeight = useAppStore((s) => s.availableListHeight.projects);

  // Calculate max visible items by subtracting header height from available height
  const maxVisibleItems = Math.max(1, availableHeight - 2); // -2 for the "Projects" title and spacing

  useDebugLogs("ProjectList");

  // Memoize sorted projects to prevent unnecessary re-renders
  const sortedProjects = useMemo(
    () => sortProjects(projects ?? []),
    [projects]
  );

  const handleSelectProject = useCallback(
    (project: Project | null) => {
      if (project?.id === selectedProjectId) {
        // Deselect project
        STORE_WRITE.setSelectedProjectId(null);
      } else if (project) {
        // Select project and change view
        STORE_WRITE.setSelectedProjectId(project.id);
        STORE_WRITE.setActiveView("project");
      }
    },
    [selectedProjectId]
  );

  const renderProjectItem = useCallback(
    ({ item: project, isFocused, isSelected }: RenderItemProps<Project>) => {
      return (
        <Box>
          <Text
            color={isSelected ? "green" : undefined}
            bold={isFocused && inFocus}
          >
            {isFocused ? "› " : "  "} {project.name}
          </Text>
        </Box>
      );
    },
    [inFocus]
  );

  // Custom empty renderer for consistent styling with other components
  const renderEmpty = useCallback(() => {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="gray">
            No projects found
          </Text>
        </Box>
        <Text dimColor>
          No projects available. Create a new project to get started.
        </Text>
      </Box>
    );
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Box padding={1}>
        <Text>Loading projects...</Text>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="red">
            Error
          </Text>
        </Box>
        <Text>{error.message}</Text>
      </Box>
    );
  }

  // Render the projects list with memoized sorted projects
  return (
    <FocusList<Project>
      mode="projects"
      title="Projects"
      items={sortedProjects}
      selectedId={selectedProjectId}
      onSelect={handleSelectProject}
      renderEmpty={renderEmpty}
      getItemId={(project) => project.id}
      renderItem={renderProjectItem}
      maxVisibleItems={maxVisibleItems}
      showScrollbar={true}
      scrollTrackChar="│"
      scrollThumbChar="│"
      scrollTrackColor="gray"
      scrollThumbColor="green"
    />
  );
};

export default ProjectList;
