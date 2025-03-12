import { useAppStore } from ".";
import { useProjectData } from "../ticktick";

export const useTask = () => {
  const projectId = useAppStore((s) => s.selectedProjectId);
  const { data: projectData } = useProjectData(projectId);
  const selectedTaskId = useAppStore((s) => s.selectedTaskId);
  return projectData?.tasks.find((t) => t.id === selectedTaskId);
};
