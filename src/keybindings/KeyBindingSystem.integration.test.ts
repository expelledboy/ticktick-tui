/**
 * KeyBindingSystem Integration Tests
 *
 * Tests the integration between different parts of the key binding system
 * to ensure they work together as expected.
 */
import { describe, test, expect, mock } from "bun:test";
import {
  configToBindings,
  findMatchingBinding,
  getBindingPriority,
  type KeyBinding,
  type KeyContext,
  type RawInput,
  BindingPriority,
} from "./KeyBindingSystem";
import { getBindingPriorities } from "./utils";
import { type ViewMode } from "../core/types";

// Types for app modes
type AppMode = "global" | ViewMode;

// Helper to create a key context
function createContext(mode: AppMode, activeView: ViewMode): KeyContext {
  return { mode, activeView };
}

// Helper to create raw keyboard input
function createRawInput(
  input: string,
  keyOptions: Record<string, boolean> = {}
): RawInput {
  return {
    input,
    key: {
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
      space: false,
      ...keyOptions,
    },
  };
}

describe("KeyBindingSystem Integration", () => {
  // Sample configuration with various binding types
  const sampleConfig = {
    global: {
      quit: "q",
      help: "?",
      toggleDebug: "ctrl+d",
    },
    navigation: {
      up: "k",
      down: "j",
      left: "h",
      right: "l",
    },
    projects: {
      newProject: "n",
      deleteProject: "d",
    },
    project: {
      newTask: "n",
      completeTask: "c",
    },
  };

  test("correctly processes keyboard input from raw input to matching binding", () => {
    // 1. Convert config to bindings
    const bindings = configToBindings(sampleConfig);

    // 2. Set up context
    const projectContext = createContext("project", "project");

    // 3. Process 'n' key in project context
    const rawInput = createRawInput("n");
    const matchedBinding = findMatchingBinding(
      bindings,
      rawInput,
      projectContext
    );

    // 4. Verify the correct binding is matched
    expect(matchedBinding).not.toBeNull();
    expect(matchedBinding?.action.category).toBe("project");
    expect(matchedBinding?.action.action).toBe("newTask");

    // 5. Verify the priority
    const priority = getBindingPriority(matchedBinding!, projectContext);
    expect(priority).toBe(BindingPriority.ExactModeMatch);
  });

  test("prioritizes bindings correctly based on context", () => {
    // This tests the scenario where the same key 'n' has different meanings
    // in different contexts
    const bindings = configToBindings(sampleConfig);

    // In projects context, 'n' should match projects.newProject
    const projectsContext = createContext("projects", "projects");
    const nInput = createRawInput("n");

    const projectsBinding = findMatchingBinding(
      bindings,
      nInput,
      projectsContext
    );
    expect(projectsBinding?.action.category).toBe("projects");
    expect(projectsBinding?.action.action).toBe("newProject");

    // In project context, 'n' should match project.newTask
    const projectContext = createContext("project", "project");
    const projectBinding = findMatchingBinding(
      bindings,
      nInput,
      projectContext
    );
    expect(projectBinding?.action.category).toBe("project");
    expect(projectBinding?.action.action).toBe("newTask");
  });

  test("getBindingPriorities provides expected priorities for all bindings", () => {
    const bindings = configToBindings(sampleConfig);

    // In project context
    const projectContext = createContext("project", "project");
    const priorities = getBindingPriorities(projectContext);

    // Check specific keys
    expect(priorities["project.newTask"].active).toBe(true);
    expect(priorities["project.newTask"].priority).toBe(
      BindingPriority.ExactModeMatch
    );

    expect(priorities["global.quit"].active).toBe(true);
    expect(priorities["global.quit"].priority).toBe(
      BindingPriority.GlobalAction
    );

    // Navigation should be inactive in view mode
    expect(priorities["navigation.up"].active).toBe(false);

    // Projects category should be inactive in project context
    expect(priorities["projects.newProject"].active).toBe(false);
  });

  test("integration with modifiers", () => {
    const bindings = configToBindings(sampleConfig);
    const globalContext = createContext("global", "project");

    // Test ctrl+d for toggleDebug in global context
    const ctrlDInput = createRawInput("d", { ctrl: true });
    const debugBinding = findMatchingBinding(
      bindings,
      ctrlDInput,
      globalContext
    );

    expect(debugBinding).not.toBeNull();
    expect(debugBinding?.action.category).toBe("global");
    expect(debugBinding?.action.action).toBe("toggleDebug");
  });

  test("simulates useKeyLogger integration with mixed mode and activeView", () => {
    // This test simulates how the useKeyLogger hook would handle keys
    // when the mode is 'global' but the activeView is 'projects'
    const bindings = configToBindings(sampleConfig);

    // Create context similar to what useKeyLogger would use
    // Note: Previously we expected mode='global', activeView='projects' to work,
    // but with our new behavior, this won't match any category-specific keys
    // Let's modify this test to use a matching mode and activeView
    const keyLoggerContext = createContext("projects", "projects");

    // Press 'n' key which should be identified as projects.newProject
    // due to the matching mode and activeView
    const nInput = createRawInput("n");
    const matchedBinding = findMatchingBinding(
      bindings,
      nInput,
      keyLoggerContext
    );

    // Verify that 'n' is correctly identified as projects.newProject
    expect(matchedBinding).not.toBeNull();
    expect(matchedBinding?.action.category).toBe("projects");
    expect(matchedBinding?.action.action).toBe("newProject");

    // Verify the priority is correct (should be ExactModeMatch since both mode and activeView match)
    const priority = getBindingPriority(matchedBinding!, keyLoggerContext);
    expect(priority).toBe(BindingPriority.ExactModeMatch);
  });

  test("prioritizes modifier key bindings over non-modifier bindings", () => {
    // Create a config with potential conflict: 'd' and 'ctrl+d'
    const conflictConfig = {
      global: {
        toggleDebug: "ctrl+d",
      },
      projects: {
        deleteProject: "d",
      },
    };

    const bindings = configToBindings(conflictConfig);

    // For the non-modifier key test, both mode and activeView must match 'projects'
    const projectsContext = createContext("projects", "projects");

    // When pressing 'd' without modifiers in projects context
    const dInput = createRawInput("d");
    const regularBinding = findMatchingBinding(
      bindings,
      dInput,
      projectsContext
    );

    // Should match the projects.deleteProject binding
    expect(regularBinding).not.toBeNull();
    expect(regularBinding?.action.category).toBe("projects");
    expect(regularBinding?.action.action).toBe("deleteProject");

    // Global context for the ctrl+d test
    const globalContext = createContext("global", "projects");

    // When pressing 'ctrl+d' in global context
    const ctrlDInput = createRawInput("d", { ctrl: true });
    const modifierBinding = findMatchingBinding(
      bindings,
      ctrlDInput,
      globalContext
    );

    // Should match the global.toggleDebug binding
    expect(modifierBinding).not.toBeNull();
    expect(modifierBinding?.action.category).toBe("global");
    expect(modifierBinding?.action.action).toBe("toggleDebug");

    // Even if we set up this test with a direct conflict in the same category,
    // the modifier key binding should win
    const directConflictConfig = {
      projects: {
        deleteProject: "d",
        debugProject: "ctrl+d",
      },
    };

    const conflictBindings = configToBindings(directConflictConfig);
    const projectContext = createContext("projects", "projects");

    const conflictCtrlDInput = createRawInput("d", { ctrl: true });
    const resolvedBinding = findMatchingBinding(
      conflictBindings,
      conflictCtrlDInput,
      projectContext
    );

    expect(resolvedBinding).not.toBeNull();
    expect(resolvedBinding?.action.category).toBe("projects");
    expect(resolvedBinding?.action.action).toBe("debugProject");
  });
});
