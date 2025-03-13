import { useKeyHandler } from "./useKeyHandler";
import { useApp } from "ink";
import { useAppStore } from "../store";
import { debug } from "../core/logger";
const useUI = () => {
  const toggleViewProjects = useAppStore((s) => s.toggleViewProjects);
  const toggleDebugMode = useAppStore((s) => s.toggleDebugMode);
  const toggleViewLogs = useAppStore((s) => s.toggleViewLogs);
  const toggleViewHelp = useAppStore((s) => s.toggleViewHelp);

  return {
    toggleViewProjects,
    toggleDebugMode,
    toggleViewLogs,
    toggleViewHelp,
  };
};

export const useGlobalKeybindings = () => {
  const ui = useUI();
  const { exit } = useApp();
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const stopViewingApp = useAppStore((s) => s.stopViewingApp);
  const haveSelectedProject = useAppStore((s) => s.selectedProjectId !== null);

  const handleQuit = () => {
    // XXX: Hack because app.clear() is not working
    stopViewingApp();
    setTimeout(exit, 200);
  };

  useKeyHandler("global", (category, action) => {
    debug("DEV", { category, action });

    // prettier-ignore
    switch (action) {
      case "quit": handleQuit(); break;
      case "toggleSidebar": ui.toggleViewProjects(); break;
      case "toggleDebug": ui.toggleDebugMode(); break;
      case "toggleLogs": ui.toggleViewLogs(); break;
      case "toggleHelp": ui.toggleViewHelp(); break;
    }

    switch (activeView) {
      case "projects":
        if (action === "right" && haveSelectedProject) setActiveView("project");
        break;
      case "project":
        if (action === "left") setActiveView("projects");
        break;
    }
  });
};
