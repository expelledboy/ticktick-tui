import { useApp, useInput } from "ink";
import { useAppStore } from "../../store";
import { arrow, binds, key, matchKeybinding, parseKeybinding } from "./utils";
import { keylogger } from "./keylogger";

const { logKey, logKeybinding } = keylogger();

type Mode = "projects" | "tasks" | "columns" | "global";

export type KeyBind = {
  mode: Mode;
  keybinding: ReturnType<typeof parseKeybinding>;
  action: () => void;
};

/**
 * Hook for handling all keyboard navigation in the application
 * Manages view switching and navigation between items
 */
export const useKeyboardNavigation = () => {
  const { exit } = useApp();

  const {
    activeView,
    setActiveView,
    toggleDebugMode,
    toggleViewLogs,
    moveFocus,
    toggleSelection,
    activate,
  } = useAppStore();

  // Array to store all active keybindings
  const bindings: KeyBind[] = [];

  // Helper to register a new keybinding
  const bind = (
    mode: Mode,
    keybindings: ReturnType<typeof parseKeybinding>[],
    action: () => void
  ) => {
    for (const keybinding of keybindings) {
      bindings.push({ mode, keybinding, action });
    }
  };

  // Actions
  const gotoProjectView = () => setActiveView("projects");
  const focusNext = () => moveFocus("next");
  const focusPrevious = () => moveFocus("previous");
  const activeProject = () => {
    activate();
    setActiveView("tasks");
  };

  // Navigation
  bind("global", [arrow.up, binds.navUp], focusPrevious);
  bind("global", [arrow.down, binds.navDown], focusNext);
  bind("projects", [arrow.right, binds.navRight], activeProject);
  bind("tasks", [arrow.left, binds.navLeft], gotoProjectView);

  // Global bindings
  bind("global", [binds.exitProgram], exit);
  bind("global", [binds.toggleDebug], toggleDebugMode);
  bind("global", [binds.toggleLogs], toggleViewLogs);
  bind("global", [key.return], activate);

  // Selection
  bind("tasks", [key.space], toggleSelection);

  // Register input handler
  useInput((input, key) => {
    logKey(key, input);

    // Handle keybindings
    for (const bind of bindings) {
      if (bind.mode === activeView || bind.mode === "global") {
        if (matchKeybinding(input, key, bind.keybinding)) {
          logKeybinding(bind);
          bind.action();
        }
      }
    }
  });
};
