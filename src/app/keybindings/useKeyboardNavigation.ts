import { useApp, useInput } from "ink";
import { useAppStore } from "../../store";
import { arrow, binds, matchKeybinding, parseKeybinding } from "./utils";

/**
 * Hook for handling all keyboard navigation in the application
 * Manages view switching and navigation between items
 */
export const useKeyboardNavigation = () => {
  const { exit } = useApp();
  const { activeView, setActiveView, focus, toggleDebugMode, toggleViewLogs } =
    useAppStore();

  // Array to store all active keybindings
  const bindings: {
    mode: "projects" | "tasks";
    keybinding: ReturnType<typeof parseKeybinding>;
    action: () => void;
  }[] = [];

  // Helper to register a new keybinding
  const bind = (
    mode: "projects" | "tasks",
    keybinding: ReturnType<typeof parseKeybinding>,
    action: () => void
  ) => {
    bindings.push({ mode, keybinding, action });
  };

  // Project view bindings
  bind("projects", arrow.up, () => focus("projects", "previous"));
  bind("projects", arrow.down, () => focus("projects", "next"));
  bind("projects", arrow.right, () => setActiveView("tasks"));
  bind("projects", binds.navDown, () => focus("projects", "next"));
  bind("projects", binds.navUp, () => focus("projects", "previous"));
  bind("projects", binds.navRight, () => setActiveView("tasks"));

  // Task view bindings
  bind("tasks", arrow.up, () => focus("tasks", "previous"));
  bind("tasks", arrow.down, () => focus("tasks", "next"));
  bind("tasks", arrow.left, () => setActiveView("projects"));
  bind("tasks", binds.navDown, () => focus("tasks", "next"));
  bind("tasks", binds.navUp, () => focus("tasks", "previous"));
  bind("tasks", binds.navLeft, () => setActiveView("projects"));

  // Global bindings - available in any mode
  bind("projects", binds.exitProgram, () => exit());
  bind("tasks", binds.exitProgram, () => exit());

  // Debug and logs toggle bindings - available in any mode
  bind("projects", binds.toggleDebug, toggleDebugMode);
  bind("tasks", binds.toggleDebug, toggleDebugMode);
  bind("projects", binds.toggleLogs, toggleViewLogs);
  bind("tasks", binds.toggleLogs, toggleViewLogs);

  // Register input handler
  useInput((input, key) => {
    for (const bind of bindings) {
      if (bind.mode === activeView) {
        if (matchKeybinding(input, key, bind.keybinding)) {
          bind.action();
        }
      }
    }
  });
};
