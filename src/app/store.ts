import { create } from "zustand";
import type { ProjectData, Task } from "../types";
import type { Project } from "../types";

type AppView = "projects" | "tasks";

type AppState = {
  debugMode: boolean;
  viewProjects: boolean;
  viewLogs: boolean;
  activeView: AppView;
  viewState: {
    [key in AppView]: {
      focusedId: string | null;
      selectedId: string | null;
    };
  };
  projects: Project[];
  tasks: Task[];
};

type AppActions = {
  toggleDebugMode: () => void;
  toggleViewProjects: () => void;
  toggleViewLogs: () => void;
  setActiveView: (view: AppView) => void;
  selectProject: (projectId: string) => void;
  selectTask: (taskId: string) => void;
};

type AppNavigators = {
  focus: (view: AppView, direction: "next" | "previous") => void;
};

type AppSetters = {
  updateProjects: (projects: Project[]) => void;
  updateProjectData: (projectData: ProjectData) => void;
};

const initialState: AppState = {
  debugMode: false,
  viewProjects: true,
  viewLogs: false,
  activeView: "projects",
  viewState: {
    projects: {
      focusedId: null,
      selectedId: null,
    },
    tasks: {
      focusedId: null,
      selectedId: null,
    },
  },
  projects: [],
  tasks: [],
};

const getNear = (
  direction: "next" | "previous",
  array: any[],
  currentId: string | null
): string | null => {
  if (!currentId) return null;
  const index = array.findIndex((item) => item.id === currentId);
  if (index === -1) return null;
  const nextIndex = Math.max(
    0,
    Math.min(array.length - 1, index + (direction === "next" ? 1 : -1))
  );
  const nextItem = array[nextIndex];
  return nextItem ? nextItem.id : null;
};

/* prettier-ignore */
export const useAppStore = create<AppState & AppActions & AppNavigators & AppSetters>(
  (set, get) => ({
    ...initialState,

    // Actions
    toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
    toggleViewProjects: () => set((s) => ({ viewProjects: !s.viewProjects })),
    toggleViewLogs: () => set((s) => ({ viewLogs: !s.viewLogs })),
    setActiveView: (view: AppView) => set({ activeView: view }),

    selectProject: (projectId: string) => set(() => ({
      activeView: "tasks",
      viewState: {
        projects: { selectedId: projectId, focusedId: projectId, },
        // TODO: We could "remember" focusedId per project, meh
        tasks: { selectedId: null, focusedId: null },
      },
    })),
    selectTask: (taskId: string) => set((s) => ({
      viewState: {
        ...s.viewState,
        tasks: { selectedId: taskId, focusedId: taskId },
      },
    })),

    // Navigators
    focus: (view: AppView, direction: "next" | "previous") => set((s) => {
      const { focusedId, selectedId } = s.viewState[view];
      const list = view === "projects" ? get().projects : get().tasks.filter(t => t.projectId === s.viewState.projects.selectedId);
      const nextId = getNear(direction, list, focusedId);
      return { viewState: { ...s.viewState, [view]: { focusedId: nextId, selectedId } } };
    }),

    // Setters
    updateProjects: (projects: Project[]) => {
      set({ projects });
    },
    updateProjectData: (projectData: ProjectData) => {
      const { projects, tasks } = syncProjectData(get().projects, get().tasks, projectData);
      set({ projects, tasks });
    },
  })
);

const syncProjectData = (
  currentProjects: Project[],
  currentTasks: Task[],
  projectData: ProjectData
) => {
  const id = projectData.project.id;

  // Update the project with new data
  const updatedProjects = currentProjects.map((project) => {
    if (project.id === id) {
      return projectData.project;
    }
    return project;
  });

  // If the project doesn't exist yet, add it
  if (!updatedProjects.some((project) => project.id === id)) {
    updatedProjects.push(projectData.project);
  }

  // Remove existing tasks for this project and add the new ones
  const tasksFromOtherProjects = currentTasks.filter(
    (task) => task.projectId !== id
  );

  // Combine tasks from other projects with the updated tasks for this project
  const updatedTasks = [...tasksFromOtherProjects, ...projectData.tasks];

  return { projects: updatedProjects, tasks: updatedTasks };
};
