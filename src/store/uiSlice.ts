import type { StateCreator } from "zustand";

type AppView = "projects" | "project" | "task";

type UIState = {
  // Viewing
  viewApp: boolean;
  debugMode: boolean;
  viewProjects: boolean;
  viewLogs: boolean;
  viewHelp: boolean;
  // Navigation
  activeView: AppView;
  focusedId: string | null;
  // Error
  error: string | null;
};

type UIActions = {
  // Viewing
  stopViewingApp: () => void;
  toggleDebugMode: () => void;
  toggleViewProjects: () => void;
  toggleViewLogs: () => void;
  toggleViewHelp: () => void;
  // Navigation
  setActiveView: (view: AppView) => void;
  setFocusedId: (id: string | null) => void;
  // Error
  setError: (error: string | null) => void;
};

type UISlice = UIState & UIActions;

// prettier-ignore
export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Viewing
  viewApp: true,
  debugMode: false,
  viewProjects: true,
  viewLogs: true,
  viewHelp: false,
  stopViewingApp: () => set(() => ({ viewApp: false })),
  toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
  toggleViewProjects: () => set((s) => ({ viewProjects: !s.viewProjects })),
  toggleViewLogs: () => set((s) => ({ viewLogs: !s.viewLogs })),
  toggleViewHelp: () => set((s) => ({ viewHelp: !s.viewHelp })),

  // Navigation
  activeView: "projects",
  focusedId: null,
  setActiveView: (view: AppView) => set((s) => ({ activeView: view })),
  setFocusedId: (id: string | null) => set((s) => ({ focusedId: id })),

  // Error
  error: null,
  setError: (error: string | null) => set(() => ({ error })),
});
