import type { StateCreator } from "zustand";
import type { Project, ProjectData } from "../core/types";

export type DataState = {
  projects: ProjectData[];
  selectedProjectId: string | null;
  selectedTaskId: string | null;
};

type DataActions = {
  updateProjects: (projects: Project[]) => void;
  updateProjectData: (projectData: ProjectData) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
};

type DataSlice = DataState & DataActions;

export const createDataSlice: StateCreator<DataSlice> = (set, get) => ({
  projects: [],
  selectedProjectId: null,
  selectedTaskId: null,

  updateProjects: (projects: Project[]) =>
    set({
      projects: projects.map((p) => ({
        project: p,
        tasks: [],
        columns: [],
      })),
    }),

  updateProjectData: (projectData: ProjectData) =>
    set({
      projects: get().projects.map((p) =>
        p.project.id === projectData.project.id
          ? {
              ...p,
              tasks: projectData.tasks,
              columns: projectData.columns,
            }
          : p
      ),
    }),

  setSelectedProjectId: (id: string | null) => set({ selectedProjectId: id }),
  setSelectedTaskId: (id: string | null) => set({ selectedTaskId: id }),
});
