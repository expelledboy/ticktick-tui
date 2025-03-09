import type { StateCreator } from "zustand";
import type { Column, Project, ProjectData, Task } from "../core/types";

export type DataState = {
  projects: ProjectData[];
};

type DataActions = {
  updateProjects: (projects: Project[]) => void;
  updateProjectData: (projectData: ProjectData) => void;
};

type DataSlice = DataState & DataActions;

export const createDataSlice: StateCreator<DataSlice> = (set, get) => ({
  projects: [],

  updateProjects: (projects: Project[]) =>
    set({
      projects: sortProjects(
        projects.map((p) => ({
          project: p,
          tasks: [],
          columns: [],
        }))
      ),
    }),

  updateProjectData: (projectData: ProjectData) =>
    set({
      projects: sortProjects(
        get().projects.map((p) =>
          p.project.id === projectData.project.id
            ? {
                ...p,
                tasks: sortTasks(projectData.tasks),
                columns: sortColumns(projectData.columns),
              }
            : p
        )
      ),
    }),
});

const sortProjects = (projects: ProjectData[]) =>
  projects.sort((a, b) => {
    return (a.project.sortOrder ?? 0) - (b.project.sortOrder ?? 0);
  });

const sortTasks = (tasks: Task[]) =>
  tasks.sort((a, b) => {
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

const sortColumns = (columns: Column[]) =>
  columns.sort((a, b) => {
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
