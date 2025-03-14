import { z } from "zod";

// Define keybindings schema with Zod
// prettier-ignore
export const keybindingsSchema = z.object({
    global: z.object({
        quit: z.string().default("q").describe("Quit the application"),
        refresh: z.string().default("r").describe("Refresh data"),
        toggleSidebar: z.string().default("ctrl+p").describe("Toggle the projects sidebar"),
        toggleDebug: z.string().default("ctrl+d").describe("Toggle debug panel"),
        toggleLogs: z.string().default("ctrl+l").describe("Toggle logs panel"),
        toggleHelp: z.string().default("?").describe("Toggle help panel"),
        search: z.string().default("/").describe("Start search"),
        toggleGlobalSearch: z.string().default("ctrl+g").describe("Toggle global search"),
    }).default({}),

    navigation: z.object({
        up: z.string().default("k").describe("Navigate up"),
        down: z.string().default("j").describe("Navigate down"),
        left: z.string().default("h").describe("Navigate left"),
        right: z.string().default("l").describe("Navigate right"),
        select: z.string().default("space").describe("Select an item"),
        back: z.string().default("escape").describe("Go back"),
        return: z.string().default("return").describe("Return"),
    }).default({}),

    projects: z.object({
        newProject: z.string().default("n").describe("Create a new project"),
        deleteProject: z.string().default("d").describe("Delete a project"),
        editProject: z.string().default("e").describe("Edit a project"),
    }).default({}),

    project: z.object({
        newTask: z.string().default("n").describe("Create a new task"),
        completeTask: z.string().default("c").describe("Mark a task as complete"),
        deleteTask: z.string().default("d").describe("Delete a task"),
        editTaskTitle: z.string().default("i").describe("Edit task title"),
        editTaskProperties: z.string().default("e").describe("Edit task properties"),
        toggleOrderBy: z.string().default("o").describe("Toggle order by"),
    }).default({}),
})

// Get default keybindings from schema
export const defaultKeybindings = keybindingsSchema.default({}).parse({});

// Function to get metadata for a specific key
export function getKeyMeta(action: string): {
  action: string;
  description: string;
} {
  // For a simple format like 'quit', look in global category
  if (!action.includes(".")) {
    const simpleKey = action;

    // Try to find in each category
    for (const categoryKey in keybindingsSchema.shape) {
      const categorySchema =
        keybindingsSchema.shape[
          categoryKey as keyof typeof keybindingsSchema.shape
        ];

      // Access the inner object schema (unwrap the default wrapper)
      const innerSchema = (categorySchema as any)._def.innerType;

      if (innerSchema?.shape?.[simpleKey]) {
        const schemaProperty = innerSchema.shape[simpleKey];
        const description =
          schemaProperty._def.description || "No description available";
        return { action: simpleKey, description };
      }
    }

    // Not found in any category
    return { action, description: "Unknown action" };
  }

  // For format like 'global.quit'
  const [category, name] = action.split(".");

  if (!category || !name || !(category in keybindingsSchema.shape)) {
    return { action, description: "Unknown category or action" };
  }

  try {
    // Access the category schema safely
    const categorySchema =
      keybindingsSchema.shape[category as keyof typeof keybindingsSchema.shape];

    // Unwrap the default wrapper to get to the object schema
    const innerSchema = (categorySchema as any)._def.innerType;

    if (!innerSchema?.shape?.[name]) {
      return { action, description: "Action not found in category" };
    }

    // Extract description from the schema
    const schemaProperty = innerSchema.shape[name];
    const description =
      schemaProperty._def.description || "No description available";

    return { action: name, description };
  } catch (error) {
    console.error("Error accessing schema:", error);
    return { action, description: "Error accessing schema" };
  }
}
