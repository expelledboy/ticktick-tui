import { z } from "zod";

const keyBindMeta: Record<string, { action: string; description: string }> = {};

// Helper to construct a key category schema
const keyCategorySchema = <
  T extends Record<string, { default: string; description: string }>,
>(
  bindings: T
) => {
  Object.entries(bindings).forEach(([key, value]) => {
    keyBindMeta[key] = { ...value, action: key };
  });

  return z
    .object(
      Object.fromEntries(
        Object.entries(bindings).map(([key, value]) => [
          key,
          z.string().default(value.default).describe(value.description),
        ])
      )
    )
    .default({});
};

// Define keybindings schema with Zod
// prettier-ignore
export const keybindingsSchema = z.object({
    global: keyCategorySchema({
        quit: { default: "q", description: "Quit the application" },
        help: { default: "?", description: "Show help" },
        refresh: { default: "r", description: "Refresh data" },
    }),

    navigation: keyCategorySchema({
        up: { default: "k", description: "Navigate up" },
        down: { default: "j", description: "Navigate down" },
        left: { default: "h", description: "Navigate left" },
        right: { default: "l", description: "Navigate right" },
        select: { default: "space", description: "Select an item" },
        back: { default: "escape", description: "Go back" },
    }),

    projects: keyCategorySchema({
        newProject: { default: "n", description: "Create a new project" },
        deleteProject: { default: "d", description: "Delete a project" },
        editProject: { default: "e", description: "Edit a project" },
    }),

    project: keyCategorySchema({
        newTask: { default: "n", description: "Create a new task" },
        completeTask: { default: "c", description: "Mark a task as complete" },
        deleteTask: { default: "d", description: "Delete a task" },
        editTaskTitle: { default: "i", description: "Edit task title" },
        editTaskProperties: { default: "e", description: "Edit task properties" },
    }),

    ui: keyCategorySchema({
        toggleSidebar: { default: "ctrl+p", description: "Toggle the projects sidebar" },
        toggleDebug: { default: "ctrl+d", description: "Toggle debug panel" },
        toggleLogs: { default: "ctrl+l", description: "Toggle logs panel" },
    }),

    search: keyCategorySchema({
        search: { default: "/", description: "Start search" },
        toggleGlobalSearch: { default: "ctrl+g", description: "Toggle global search" },
    }),
})

// Get default keybindings from schema
export const defaultKeybindings = keybindingsSchema.default({}).parse({});

export function getKeyMeta(action: keyof typeof keybindingsSchema.shape): {
  action: string;
  description: string;
} {
  return keyBindMeta[action];
}
