import { useAppStore } from ".";
import { useProjectData } from "../ticktick";

export const useProject = () => {
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  const { data: projectData } = useProjectData(selectedProjectId);
  return projectData;
};
