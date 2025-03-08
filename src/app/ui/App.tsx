import { Box } from "ink";
import { useAppStore } from "../store";
import { Projects } from "./Projects";
import { Tasks } from "./Tasks";

export const App = () => {
  const { viewProjects, selectedProjectId } = useAppStore();

  return (
    <Box flexDirection="row">
      {viewProjects && <Projects />}
      {selectedProjectId && <Tasks projectId={selectedProjectId} />}
    </Box>
  );
};
