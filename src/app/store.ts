import { create } from "zustand";

type AppState = {
  debugMode: boolean;
  viewProjects: boolean;
  viewLogs: boolean;
  selectedProjectId: string | null;
};

type AppActions = {
  toggleDebugMode: () => void;
  toggleViewProjects: () => void;
  toggleViewLogs: () => void;
  setSelectedProjectId: (id: string) => void;
};

const initialState: AppState = {
  debugMode: false,
  viewProjects: true,
  viewLogs: false,
  selectedProjectId: null,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  // Actions
  toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),
  toggleViewProjects: () => set((s) => ({ viewProjects: !s.viewProjects })),
  toggleViewLogs: () => set((s) => ({ viewLogs: !s.viewLogs })),
  setSelectedProjectId: (id: string) => set({ selectedProjectId: id }),
}));
