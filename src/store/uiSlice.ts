import type { StateCreator } from "zustand";

type UIState = {
  debugMode: boolean;
  viewProjects: boolean;
  viewLogs: boolean;
};

type UIActions = {
  toggleDebugMode: () => void;
  toggleViewProjects: () => void;
  toggleViewLogs: () => void;
};

type UISlice = UIState & UIActions;

// prettier-ignore
export const createUISlice: StateCreator<UISlice> = (set) => ({
  debugMode: false,
  viewProjects: true,
  viewLogs: true,

  toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
  toggleViewProjects: () => set((s) => ({ viewProjects: !s.viewProjects })),
  toggleViewLogs: () => set((s) => ({ viewLogs: !s.viewLogs })),
});
