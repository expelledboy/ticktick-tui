import { create } from "zustand";
import { createUISlice } from "./uiSlice";
import { createDataSlice } from "./dataSlice";
import { createLogsSlice } from "./logsSlice";

type StoreActions = {
  reset: () => void;
};

type Store = ReturnType<typeof createUISlice> &
  ReturnType<typeof createDataSlice> &
  ReturnType<typeof createLogsSlice> &
  StoreActions;

// Create the combined store
export const useAppStore = create<Store>((...a) => ({
  ...createUISlice(...a),
  ...createDataSlice(...a),
  ...createLogsSlice(...a),

  // Reset the store to the default state
  reset: () => {
    useAppStore.setState(defaultState, true);
  },
}));

const defaultState: Store = useAppStore.getState();

// XXX: Forcing stable store mutation functions (no react reactivity)
export const STORE_WRITE = {
  updateProjects: defaultState.updateProjects,
  updateProjectData: defaultState.updateProjectData,
  setSelectedProjectId: defaultState.setSelectedProjectId,
  setSelectedTaskId: defaultState.setSelectedTaskId,
  addLog: defaultState.addLog,
  stopViewingApp: defaultState.stopViewingApp,
  toggleDebugMode: defaultState.toggleDebugMode,
  toggleViewProjects: defaultState.toggleViewProjects,
  toggleViewLogs: defaultState.toggleViewLogs,
  toggleViewHelp: defaultState.toggleViewHelp,
  setActiveView: defaultState.setActiveView,
  setFocusedId: defaultState.setFocusedId,
  setError: defaultState.setError,
};
