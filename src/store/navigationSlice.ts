import type { StateCreator } from "zustand";
import type { DataState } from "./dataSlice";
import type { Task } from "../core/types";
import { __DEBUG, debug } from "../core/logger";

type AppView = "projects" | "tasks";

type FocusDirection = "next" | "previous";

type NavigationState = {
  activeView: AppView;
  focusedId: string | null; // Single focus at any time
  active: { [key in AppView]: string | null }; // Active item in each view
  selectedTaskIds: Set<string>;
  lastFocused: Record<AppView, string | null>; // View-specific focus memory
};

type NavigationActions = {
  setActiveView: (view: AppView) => void;
  moveFocus: (direction: FocusDirection) => void;
  toggleSelection: () => void;
  activate: () => void;
};

type NavigationSlice = NavigationState & NavigationActions;

// export const createYourNewSlice: StateCreator<
//   StoreState,   // The complete store type
//   [],           // Optional middleware types
//   [],           // Optional dev types
//   YourNewSlice  // The returned slice shape
// > = (set, get) => ({

export const createNavigationSlice: StateCreator<
  NavigationSlice & DataState,
  [],
  [],
  NavigationSlice
> = (set, get) => ({
  activeView: "projects",
  focusedId: null,
  active: { projects: null, tasks: null },
  selectedTaskIds: new Set(),
  lastFocused: { projects: null, tasks: null },

  moveFocus: (direction: "next" | "previous") => {
    const { focusedId, activeView } = get();
    const currentList = getList(get, activeView);
    const newId = getNext(direction, currentList, focusedId);
    if (newId) set({ focusedId: newId });
  },

  setActiveView: (view: AppView) => {
    const { activeView, lastFocused, focusedId, active } = get();
    const currentList = getList(get, view);

    // Preserve focus memory between view switches
    const newFocus = currentList.some((item) => item.id === lastFocused[view])
      ? lastFocused[view] // Use remembered position if valid
      : currentList[0]?.id || null; // Fallback to first item

    set({
      activeView: view,
      focusedId: newFocus,
      lastFocused: {
        ...lastFocused,
        [activeView]: focusedId, // Save current position
      },
      active: view === "projects" ? { ...active, tasks: null } : active,
    });
  },

  toggleSelection: () => {
    const { focusedId, selectedTaskIds } = get();

    if (!focusedId) return;

    // Toggle the focused item
    const selection = new Set(selectedTaskIds);
    selection[selection.has(focusedId) ? "delete" : "add"](focusedId);

    set({ selectedTaskIds: selection });
  },

  activate: () => {
    const { activeView, focusedId, setActiveView, active } = get();

    if (activeView === "projects") {
      const isNewProject = active.projects !== focusedId;

      const firstTaskId =
        get().projects.find((p) => p.project.id === focusedId)?.tasks[0]?.id ||
        null;

      set({
        // Set active project and INITIAL task focus
        active: { projects: focusedId, tasks: null },
        lastFocused: {
          ...get().lastFocused,
          // Only update task focus if switching to a NEW project
          tasks: isNewProject ? firstTaskId : get().lastFocused.tasks,
        },
      });
      setActiveView("tasks");
    } else {
      // Activate task without changing view
      set({ active: { ...active, tasks: focusedId } });
    }
  },
});

const getList = (get: () => NavigationSlice & DataState, view: AppView) => {
  const { projects, active } = get();

  return view === "projects"
    ? projects.map((p) => ({ id: p.project.id }))
    : projects.find((p) => p.project.id === active.projects)?.tasks!;
};

/**
 * Gets the next or previous item in an array
 * @param direction - The direction to search
 * @param array - The array to search
 * @param currentId - The id of the current item
 * @returns The next or previous item
 */
export const getNext = (
  direction: "next" | "previous",
  array: { id: string }[],
  currentId: string | null
): string | null => {
  if (array.length === 0) return null;

  // Handle initial focus
  if (!currentId) {
    return direction === "next"
      ? array[0]?.id
      : array[array.length - 1]?.id || null;
  }

  const index = array.findIndex((item) => item.id === currentId);

  if (index === -1) return null;

  const nextIndex = direction === "next" ? index + 1 : index - 1;

  // Return null if out of bounds (start/end of list)
  if (nextIndex < 0 || nextIndex >= array.length) return null;

  return array[nextIndex].id;
};
