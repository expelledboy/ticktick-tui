import { Box, Text } from "ink";
import { useAppStore } from "../store";
import { Projects } from "./Projects";
import { Tasks } from "./Tasks";
import { useKeyboardNavigation, useStoreFocusManager } from "../keybindings";

export const App = () => {
  const activeView = useAppStore((s) => s.activeView);
  const viewProjects = useAppStore((s) => s.viewProjects);
  const selectedProjectId = useAppStore((s) => s.viewState.projects.selectedId);

  // Handle keyboard navigation
  useKeyboardNavigation();
  useStoreFocusManager();

  return (
    <Box flexDirection="column">
      <Box flexDirection="row">
        <Text>Active View: {activeView}</Text>
      </Box>
      <Box flexDirection="row">
        {viewProjects && (
          <Box width={30} borderStyle="round" borderColor="green">
            <Projects />
          </Box>
        )}
        {selectedProjectId && (
          <Box width={100} borderStyle="round" borderColor="green">
            <Tasks projectId={selectedProjectId} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
