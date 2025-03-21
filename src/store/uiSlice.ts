import type { StateCreator } from "zustand";
import { type ViewMode } from "../core/types";
import { DEBUG } from "../constants";

type UIState = {
  // Viewing
  viewApp: boolean;
  debugMode: boolean;
  viewProjects: boolean;
  viewLogs: boolean;
  viewHelp: boolean;
  // Navigation
  activeView: ViewMode;
  focusedId: string | null;
  // Error
  error: string | null;
  // Selected
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  // UI Layout
  availableListHeight: {
    projects: number;
    project: number;
    task: number;
  };
};

type UIActions = {
  // Viewing
  stopViewingApp: () => void;
  toggleDebugMode: () => void;
  toggleViewProjects: () => void;
  toggleViewLogs: () => void;
  toggleViewHelp: () => void;
  // Navigation
  setActiveView: (view: ViewMode) => void;
  setFocusedId: (id: string | null) => void;
  // Error
  setError: (error: string | null) => void;
  // Selected
  setSelectedProjectId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  // UI Layout
  setAvailableListHeight: (
    heights: Partial<UIState["availableListHeight"]>
  ) => void;
};

type UISlice = UIState & UIActions;

// prettier-ignore
export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Viewing
  viewApp: true,
  debugMode: false,
  viewProjects: true,
  viewLogs: DEBUG ? true : false,
  viewHelp: false,
  stopViewingApp: () => set(() => ({ viewApp: false })),
  toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
  toggleViewProjects: () => set((s) => ({ viewProjects: !s.viewProjects })),
  toggleViewLogs: () => set((s) => ({ viewLogs: !s.viewLogs })),
  toggleViewHelp: () => set((s) => ({ viewHelp: !s.viewHelp })),

  // Navigation
  activeView: "projects",
  focusedId: null,
  setActiveView: (view: ViewMode) => set((s) => ({ activeView: view })),
  setFocusedId: (id: string | null) => set((s) => ({ focusedId: id })),

  // Error
  error: null,
  setError: (error: string | null) => set(() => ({ error })),

  // Selected
  selectedProjectId: null,
  selectedTaskId: null,
  setSelectedProjectId: (id: string | null) => set(() => ({ selectedProjectId: id })),
  setSelectedTaskId: (id: string | null) => set(() => ({ selectedTaskId: id })),
  
  // UI Layout
  availableListHeight: {
    projects: 20, // Default fallback values
    project: 20,
    task: 10,
  },
  setAvailableListHeight: (heights) => set((s) => ({
    availableListHeight: { ...s.availableListHeight, ...heights }
  })),
});
