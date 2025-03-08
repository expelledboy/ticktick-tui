import { useApp, useFocusManager, useInput, type Key } from "ink";
import { useAppStore } from "./store";
import { config } from "../config";
import { useEffect } from "react";

const emptyKey: Key = {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  pageDown: false,
  pageUp: false,
  return: false,
  escape: false,
  ctrl: false,
  shift: false,
  tab: false,
  backspace: false,
  delete: false,
  meta: false,
};

const arrow = {
  up: { input: "", key: { ...emptyKey, upArrow: true } },
  down: { input: "", key: { ...emptyKey, downArrow: true } },
  left: { input: "", key: { ...emptyKey, leftArrow: true } },
  right: { input: "", key: { ...emptyKey, rightArrow: true } },
};

const parseKeybinding = (
  keybinding: string
): {
  input: string;
  key: Key;
} => {
  const binding = keybinding.toLowerCase().split("+");

  return {
    input: binding[binding.length - 1],
    key: {
      ...emptyKey,
      ctrl: binding.includes("ctrl"),
      shift: binding.includes("shift"),
      meta: binding.includes("meta"),
    },
  };
};

const binds = Object.fromEntries(
  Object.entries(config.keybindings).map(([key, value]) => [
    key,
    parseKeybinding(value),
  ])
);

const matchKeybinding = (
  input: string,
  key: Key,
  keybinding: ReturnType<typeof parseKeybinding>
) => {
  // Compare input string directly
  if (input !== keybinding.input) return false;

  // Compare each property of the key object with keybinding.key
  const keyEntries = Object.entries(key);
  for (const [prop, value] of keyEntries) {
    if (keybinding.key[prop as keyof Key] !== value) return false;
  }

  return true;
};

export const useKeyboardNavigation = () => {
  const { exit } = useApp();
  const { activeView, setActiveView, focus } = useAppStore();

  const bindings: {
    mode: "projects" | "tasks";
    keybinding: ReturnType<typeof parseKeybinding>;
    action: () => void;
  }[] = [];

  const bind = (
    mode: "projects" | "tasks",
    keybinding: ReturnType<typeof parseKeybinding>,
    action: () => void
  ) => {
    bindings.push({ mode, keybinding, action });
  };

  bind("projects", arrow.up, () => focus("projects", "previous"));
  bind("projects", arrow.down, () => focus("projects", "next"));
  bind("projects", arrow.right, () => setActiveView("tasks"));
  bind("projects", binds.navDown, () => focus("projects", "next"));
  bind("projects", binds.navUp, () => focus("projects", "previous"));
  bind("projects", binds.navRight, () => setActiveView("tasks"));

  bind("tasks", arrow.up, () => focus("tasks", "previous"));
  bind("tasks", arrow.down, () => focus("tasks", "next"));
  bind("tasks", arrow.left, () => setActiveView("projects"));
  bind("tasks", binds.navDown, () => focus("tasks", "next"));
  bind("tasks", binds.navUp, () => focus("tasks", "previous"));
  bind("tasks", binds.navLeft, () => setActiveView("projects"));

  bind("projects", binds.exitProgram, () => exit());

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

export const useStoreFocusManager = () => {
  const { disableFocus, focus } = useFocusManager();

  // Disable default focus behavior
  useEffect(disableFocus, []);

  const focusedTaskId = useAppStore((s) => s.viewState.tasks.focusedId);
  useEffect(() => {
    if (focusedTaskId) focus(focusedTaskId);
  }, [focusedTaskId]);

  const focusedProjectId = useAppStore((s) => s.viewState.projects.focusedId);
  useEffect(() => {
    if (focusedProjectId) focus(focusedProjectId);
  }, [focusedProjectId]);
};
