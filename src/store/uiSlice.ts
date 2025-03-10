import type { StateCreator } from "zustand";

type UIState = {
  viewApp: boolean;
  debugMode: boolean;
  viewProjects: boolean;
  viewLogs: boolean;
  viewHelp: boolean;
};

type UIActions = {
  stopViewingApp: () => void;
  toggleDebugMode: () => void;
  toggleViewProjects: () => void;
  toggleViewLogs: () => void;
  toggleViewHelp: () => void;
};

type UISlice = UIState & UIActions;

// prettier-ignore
export const createUISlice: StateCreator<UISlice> = (set) => ({
  viewApp: true,
  debugMode: false,
  viewProjects: true,
  viewLogs: true,
  viewHelp: false,

  stopViewingApp: () => set((s) => ({ viewApp: false })),
  toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
  toggleViewProjects: () => set((s) => ({ viewProjects: !s.viewProjects })),
  toggleViewLogs: () => set((s) => ({ viewLogs: !s.viewLogs })),
  toggleViewHelp: () => set((s) => ({ viewHelp: !s.viewHelp })),
});
