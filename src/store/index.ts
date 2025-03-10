import { create } from "zustand";
import { createUISlice } from "./uiSlice";
import { createDataSlice } from "./dataSlice";
import { createLogsSlice } from "./logsSlice";

type Store = ReturnType<typeof createUISlice> &
  ReturnType<typeof createDataSlice> &
  ReturnType<typeof createLogsSlice>;

// Create the combined store
export const useAppStore = create<Store>((...a) => ({
  ...createUISlice(...a),
  ...createDataSlice(...a),
  ...createLogsSlice(...a),
}));

export const useProject = () => {
  const projects = useAppStore((s) => s.projects);
  const selectedProjectId = useAppStore((s) => s.selectedProjectId);
  return projects.find((p) => p.project.id === selectedProjectId);
};

export const useTask = () => {
  const project = useProject();
  const selectedTaskId = useAppStore((s) => s.selectedTaskId);
  return project?.tasks.find((t) => t.id === selectedTaskId);
};
