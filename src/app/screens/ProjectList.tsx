/**
 * Project List Screen Component
 *
 * Displays a list of projects using the FocusList component
 * Fetches data from the API and manages project selection
 */
import { Box, Text } from "ink";
import FocusList, { type RenderItemProps } from "../../components/FocusList";
import { type Project } from "../../core/types";
import { useDebugLogs } from "../../hooks/useDebugLogs";
import { useProjects } from "../../ticktick";
import { STORE_WRITE, useAppStore } from "../../store";
import { useCallback } from "react";

const sortProjects = (projects: Project[]) => {
  return projects.sort((a, b) => {
    if (a.closed && !b.closed) return 1;
    if (!a.closed && b.closed) return -1;
    if (a.sortOrder && b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });
};

export const ProjectList = () => {
  const { data: projects, isLoading, error } = useProjects();
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);

  useDebugLogs("ProjectList");

  const handleSelectProject = useCallback(
    (project: Project | null) => {
      if (project?.id === selectedProjectId) {
        STORE_WRITE.setSelectedProjectId(null);
      } else {
        if (!project) return;
        STORE_WRITE.setSelectedProjectId(project.id);
        STORE_WRITE.setActiveView("project");
      }
    },
    [selectedProjectId]
  );

  // Use a single return with conditional rendering instead of early returns
  return (
    <Box>
      {isLoading ? (
        // Render loading state
        <Text>Loading projects...</Text>
      ) : error ? (
        // Render error state
        // TODO: Globally handle errors into status bar
        <Text color="red">Error: {error.message}</Text>
      ) : (
        // Render the projects list
        <FocusList<Project>
          mode="projects"
          title="Projects"
          items={sortProjects(projects ?? [])}
          selectedId={selectedProjectId}
          onSelect={handleSelectProject}
          emptyMessage="No projects found"
          getItemId={(project) => project.id}
          renderItem={ProjectItem}
        />
      )}
    </Box>
  );
};

const ProjectItem = ({
  item: project,
  isFocused,
  isSelected,
}: RenderItemProps<Project>) => (
  <Box>
    <Text color={isSelected ? "green" : undefined} bold={isFocused}>
      {isFocused ? "› " : "  "} {project.name}
    </Text>
  </Box>
);

export default ProjectList;
