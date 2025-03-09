import { create } from "zustand";
import { createUISlice } from "./uiSlice";
import { createDataSlice } from "./dataSlice";
import { createLogsSlice } from "./logsSlice";
import { createNavigationSlice } from "./navigationSlice";

type Store = ReturnType<typeof createUISlice> &
  ReturnType<typeof createDataSlice> &
  ReturnType<typeof createLogsSlice> &
  ReturnType<typeof createNavigationSlice>;

// Create the combined store
export const useAppStore = create<Store>((...a) => ({
  ...createUISlice(...a),
  ...createDataSlice(...a),
  ...createLogsSlice(...a),
  ...createNavigationSlice(...a),
}));

export const useProjects = () => {
  const activeView = useAppStore((s) => s.activeView);
  const projects = useAppStore((s) => s.projects);
  const focusedId = useAppStore((s) => s.focusedId);

  return {
    isFocused: activeView === "projects",
    focusedProjectId: activeView === "projects" ? focusedId : null,
    projects,
    moveFocus: useAppStore((s) => s.moveFocus),
    toggleSelection: useAppStore((s) => s.toggleSelection),
    updateProjects: useAppStore((s) => s.updateProjects),
  };
};

export const useProject = (projectId: string) => {
  const focusedId = useAppStore((s) => s.focusedId);
  const active = useAppStore((s) => s.active);
  const project = useAppStore(
    (s) => s.projects.find((p) => p.project.id === projectId)?.project
  );

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  return {
    project,
    isFocused: focusedId === projectId,
    isActive: active.projects === projectId,
    toggleSelection: useAppStore((s) => s.toggleSelection),
  };
};

export const useTasks = (projectId: string) => {
  const activeView = useAppStore((s) => s.activeView);
  const activeProjectId = useAppStore((s) => s.active.projects);
  const focusedId = useAppStore((s) => s.focusedId);
  const project = useAppStore((s) =>
    s.projects.find((p) => p.project.id === activeProjectId)
  );

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  return {
    isFocused: activeView === "tasks",
    focusedTaskId: activeView === "tasks" ? focusedId : null,
    project: project.project,
    tasks: project.tasks,
    moveFocus: useAppStore((s) => s.moveFocus),
    toggleSelection: useAppStore((s) => s.toggleSelection),
    updateProjectData: useAppStore((s) => s.updateProjectData),
  };
};

export const useTask = (projectId: string, taskId: string) => {
  const focusedId = useAppStore((s) => s.focusedId);
  const active = useAppStore((s) => s.active);
  const selectedTaskIds = useAppStore((s) => s.selectedTaskIds);
  const task = useAppStore((s) =>
    s.projects
      .find((p) => p.project.id === projectId)
      ?.tasks.find((t) => t.id === taskId)
  );

  if (!task) {
    throw new Error(`Task ${taskId} not found in project ${projectId}`);
  }

  return {
    task,
    isFocused: focusedId === taskId,
    isSelected: selectedTaskIds.has(taskId),
    isActive: active.tasks === taskId,
    toggleSelection: useAppStore((s) => s.toggleSelection),
  };
};
