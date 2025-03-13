import { describe, test, expect, jest } from "bun:test";
import { viewModes } from "../core/types";
import {
  parseKeyPattern,
  matchesInput,
  isBindingActiveInContext,
  findMatchingBinding,
  configToBindings,
  getBindingPriority,
  BindingPriority,
  type KeyBinding,
  type RawInput,
  type KeyContext,
} from "./KeyBindingSystem";

// Helper to create mock KeyBinding objects
function createKeyBinding(
  category: string,
  action: string,
  pattern: string,
  isSpecial = false
): KeyBinding {
  const { baseKey, modifiers } = parseKeyPattern(pattern);
  return {
    pattern: baseKey,
    modifiers,
    isSpecial,
    action: {
      category,
      action,
      description: `${category}.${action}`,
    },
  };
}

// Create mock raw input
function createRawInput(
  input: string,
  key: Partial<Record<string, boolean>> = {}
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
      ...key,
    },
  };
}

describe("KeyBindingSystem", () => {
  describe("parseKeyPattern", () => {
    test("parses simple key", () => {
      const result = parseKeyPattern("n");
      expect(result.baseKey).toBe("n");
      expect(result.isSpecial).toBe(false);
      expect(result.modifiers.ctrl).toBe(false);
      expect(result.modifiers.shift).toBe(false);
      expect(result.modifiers.meta).toBe(false);
    });

    test("parses key with modifiers", () => {
      const result = parseKeyPattern("ctrl+shift+n");
      expect(result.baseKey).toBe("n");
      expect(result.isSpecial).toBe(false);
      expect(result.modifiers.ctrl).toBe(true);
      expect(result.modifiers.shift).toBe(true);
      expect(result.modifiers.meta).toBe(false);
    });

    test("parses special keys", () => {
      const result = parseKeyPattern("space");
      expect(result.baseKey).toBe("space");
      expect(result.isSpecial).toBe(true);

      const result2 = parseKeyPattern("ctrl+escape");
      expect(result2.baseKey).toBe("escape");
      expect(result2.isSpecial).toBe(true);
      expect(result2.modifiers.ctrl).toBe(true);
    });
  });

  describe("matchesInput", () => {
    test("matches simple key", () => {
      const binding = createKeyBinding("test", "action", "n");
      const input = createRawInput("n");
      expect(matchesInput(binding, input)).toBe(true);
    });

    test("doesn't match different key", () => {
      const binding = createKeyBinding("test", "action", "n");
      const input = createRawInput("m");
      expect(matchesInput(binding, input)).toBe(false);
    });

    test("matches with modifiers", () => {
      const binding = createKeyBinding("test", "action", "ctrl+n");
      const input = createRawInput("n", { ctrl: true });
      expect(matchesInput(binding, input)).toBe(true);
    });

    test("doesn't match when modifier missing", () => {
      const binding = createKeyBinding("test", "action", "ctrl+n");
      const input = createRawInput("n");
      expect(matchesInput(binding, input)).toBe(false);
    });

    test("matches special keys", () => {
      const binding = createKeyBinding("test", "action", "space", true);
      const input = createRawInput("", { space: true });
      expect(matchesInput(binding, input)).toBe(true);
    });
  });

  describe("isBindingActiveInContext", () => {
    test("global bindings are always active in any context", () => {
      const binding = createKeyBinding("global", "quit", "q");

      // Test in various contexts
      expect(
        isBindingActiveInContext(binding, {
          mode: "global",
          activeView: "projects",
        })
      ).toBe(true);
      expect(
        isBindingActiveInContext(binding, {
          mode: "project",
          activeView: "project",
        })
      ).toBe(true);
    });

    test("non-view categories are active only in global mode", () => {
      const binding = createKeyBinding("ui", "toggle", "ctrl+t");

      // Active in global mode
      expect(
        isBindingActiveInContext(binding, {
          mode: "global",
          activeView: "projects",
        })
      ).toBe(true);

      // Inactive in other modes
      expect(
        isBindingActiveInContext(binding, {
          mode: "project",
          activeView: "project",
        })
      ).toBe(false);
    });

    test("view category bindings are only active when both mode and activeView match the category", () => {
      // Projects binding (a view category)
      const projectsBinding = createKeyBinding("projects", "new", "n");

      // Test with exact matches - should be active
      const exactContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };
      expect(isBindingActiveInContext(projectsBinding, exactContext)).toBe(
        true
      );

      // Test in mismatched context but with mode matching category - should be inactive
      const mismatchContext: KeyContext = {
        mode: "projects",
        activeView: "project",
      };
      expect(isBindingActiveInContext(projectsBinding, mismatchContext)).toBe(
        false
      );

      // Test with activeView matching but mode not matching - should be inactive
      const modeMismatchContext: KeyContext = {
        mode: "global",
        activeView: "projects",
      };
      expect(
        isBindingActiveInContext(projectsBinding, modeMismatchContext)
      ).toBe(false);

      // Test with neither matching - should be inactive
      const noMatchContext: KeyContext = {
        mode: "global",
        activeView: "project",
      };
      expect(isBindingActiveInContext(projectsBinding, noMatchContext)).toBe(
        false
      );
    });

    // NEW TEST - View bindings should only be active when mode matches activeView
    test("view category bindings should only be active when mode matches activeView", () => {
      // Projects binding (a view category)
      const projectsBinding = createKeyBinding("projects", "new", "n");

      // 1. When mode and activeView both match the category - should be active
      const matchingContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };
      expect(isBindingActiveInContext(projectsBinding, matchingContext)).toBe(
        true
      );

      // 2. When mode matches but activeView does not - should NOT be active
      const modeOnlyContext: KeyContext = {
        mode: "projects",
        activeView: "project", // Different from mode
      };
      // This currently returns true but should return false
      expect(isBindingActiveInContext(projectsBinding, modeOnlyContext)).toBe(
        false
      );

      // 3. When activeView matches but mode does not - should NOT be active
      const viewOnlyContext: KeyContext = {
        mode: "project", // Different from category
        activeView: "projects",
      };
      // This currently returns true but should return false
      expect(isBindingActiveInContext(projectsBinding, viewOnlyContext)).toBe(
        false
      );

      // 4. When neither match - should NOT be active
      const noMatchContext: KeyContext = {
        mode: "global",
        activeView: "project",
      };
      expect(isBindingActiveInContext(projectsBinding, noMatchContext)).toBe(
        false
      );
    });
  });

  describe("getBindingPriority", () => {
    test("returns null for inactive bindings", () => {
      // Create a binding that won't be active in projects context
      const uiBinding = createKeyBinding("ui", "toggle", "t");
      const context: KeyContext = { mode: "projects", activeView: "projects" };

      // Should be inactive, so priority is null
      expect(getBindingPriority(uiBinding, context)).toBeNull();
    });

    test("assigns ExactModeMatch priority to bindings matching current mode", () => {
      // Create binding that matches the mode
      const binding = createKeyBinding("projects", "new", "n");
      const context: KeyContext = { mode: "projects", activeView: "projects" };

      // Should have highest priority (ExactModeMatch)
      expect(getBindingPriority(binding, context)).toBe(
        BindingPriority.ExactModeMatch
      );
    });

    test("assigns GlobalAction priority to non-view category bindings in global mode", () => {
      // Create non-view category bindings (not in viewModes)
      const uiBinding = createKeyBinding("ui", "toggle", "t");
      const navBinding = createKeyBinding("navigation", "up", "k");

      // Global mode context where these are active
      const context: KeyContext = { mode: "global", activeView: "projects" };

      // Should have medium priority (GlobalAction)
      expect(getBindingPriority(uiBinding, context)).toBe(
        BindingPriority.GlobalAction
      );
      expect(getBindingPriority(navBinding, context)).toBe(
        BindingPriority.GlobalAction
      );
    });

    test("assigns GlobalAction priority to global category bindings", () => {
      // Global category bindings
      const binding = createKeyBinding("global", "quit", "q");

      // Test in view mode
      const viewContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };
      expect(getBindingPriority(binding, viewContext)).toBe(
        BindingPriority.GlobalAction
      );

      // Test in global mode
      const globalContext: KeyContext = {
        mode: "global",
        activeView: "projects",
      };
      expect(getBindingPriority(binding, globalContext)).toBe(
        BindingPriority.GlobalAction
      );
    });

    test("assigns ModifierKey priority to bindings with modifier keys", () => {
      // Create binding with modifier keys
      const modifierBinding = createKeyBinding("projects", "new", "ctrl+n");

      // Context where the binding is active (both mode and activeView match)
      const projectsContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };

      // Modifier keys should have highest priority
      expect(getBindingPriority(modifierBinding, projectsContext)).toBe(
        BindingPriority.ModifierKey
      );

      // For comparison, create a non-modifier binding in the same category
      const regularBinding = createKeyBinding("projects", "view", "v");

      // Regular binding should have ExactModeMatch priority
      expect(getBindingPriority(regularBinding, projectsContext)).toBe(
        BindingPriority.ExactModeMatch
      );
    });

    // Note: Testing the Fallback priority is not practical with our current implementation
    // because our isBindingActiveInContext logic makes it hard to create a scenario
    // where a binding is active but gets Fallback priority. This would require
    // creating custom implementations or complex mocking which isn't advised.
  });

  describe("findMatchingBinding", () => {
    test("returns null when no bindings match", () => {
      const bindings: KeyBinding[] = [
        createKeyBinding("projects", "new", "n"),
        createKeyBinding("global", "quit", "q"),
      ];

      const context: KeyContext = { mode: "projects", activeView: "projects" };
      const input = createRawInput("z"); // No binding for 'z'

      const result = findMatchingBinding(bindings, input, context);
      expect(result).toBeNull();
    });

    test("returns null when matching bindings exist but none are active", () => {
      const bindings: KeyBinding[] = [
        // ui category is inactive in projects mode
        createKeyBinding("ui", "toggle", "t"),
      ];

      const context: KeyContext = { mode: "projects", activeView: "projects" };
      const input = createRawInput("t"); // Matches key but binding is inactive

      const result = findMatchingBinding(bindings, input, context);
      expect(result).toBeNull();
    });

    test("prioritizes exact mode match over global bindings", () => {
      const bindings: KeyBinding[] = [
        createKeyBinding("global", "help", "h"), // Priority: GlobalAction
        createKeyBinding("projects", "highlight", "h"), // Priority: ExactModeMatch
        createKeyBinding("navigation", "home", "h"), // Priority: GlobalAction
      ];

      const context: KeyContext = { mode: "projects", activeView: "projects" };
      const input = createRawInput("h");

      const result = findMatchingBinding(bindings, input, context);
      expect(result?.action.category).toBe("projects"); // ExactModeMatch wins
    });

    test("prioritizes global action bindings over fallback", () => {
      // This is difficult to test directly with the current implementation
      // since it's hard to create a binding that would get Fallback priority
      // Instead, we can verify that global category bindings win in global mode

      const bindings: KeyBinding[] = [
        createKeyBinding("global", "help", "h"), // Active in global mode
        createKeyBinding("navigation", "home", "h"), // Active in global mode
      ];

      const context: KeyContext = { mode: "global", activeView: "projects" };
      const input = createRawInput("h");

      // Both would get GlobalAction priority, algorithm should pick the first one
      const result = findMatchingBinding(bindings, input, context);
      expect(result?.action.category).toBe("global");
    });

    test("handles complex scenarios with multiple matching bindings", () => {
      // Create a diverse set of bindings
      const bindings = [
        createKeyBinding("global", "quit", "q"),
        createKeyBinding("projects", "new", "n"),
        createKeyBinding("project", "delete", "n"), // Same key as projects.new
        createKeyBinding("global", "help", "?"),
      ];

      const nInput = createRawInput("n");

      // Test in projects context - with both mode and activeView = "projects"
      const projectsContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };

      // Should match the projects.new binding
      const result1 = findMatchingBinding(bindings, nInput, projectsContext);
      expect(result1?.action.category).toBe("projects");
      expect(result1?.action.action).toBe("new");

      // Test in project context - with both mode and activeView = "project"
      const projectContext: KeyContext = {
        mode: "project",
        activeView: "project",
      };

      // Should match the project.delete binding
      const result2 = findMatchingBinding(bindings, nInput, projectContext);
      expect(result2?.action.category).toBe("project");
      expect(result2?.action.action).toBe("delete");

      // Global input should match in any context
      const qInput = createRawInput("q");
      const result3 = findMatchingBinding(bindings, qInput, projectContext);
      expect(result3?.action.category).toBe("global");
      expect(result3?.action.action).toBe("quit");
    });
  });

  describe("configToBindings", () => {
    test("converts configuration to bindings", () => {
      const config = {
        global: {
          quit: "q",
          help: "?",
        },
        navigation: {
          up: "k",
          down: "j",
        },
      };

      const bindings = configToBindings(config);
      expect(bindings.length).toBe(4);

      const quitBinding = bindings.find((b) => b.action.action === "quit");
      expect(quitBinding).toBeDefined();
      expect(quitBinding?.action.category).toBe("global");
      expect(quitBinding?.pattern).toBe("q");

      const navBinding = bindings.find((b) => b.action.action === "up");
      expect(navBinding).toBeDefined();
      expect(navBinding?.action.category).toBe("navigation");
      expect(navBinding?.pattern).toBe("k");
    });

    test("correctly parses complex key patterns", () => {
      const config = {
        ui: {
          toggleDebug: "ctrl+d",
          toggleHelp: "ctrl+shift+h",
        },
      };

      const bindings = configToBindings(config);
      expect(bindings.length).toBe(2);

      const debugBinding = bindings.find(
        (b) => b.action.action === "toggleDebug"
      );
      expect(debugBinding?.modifiers.ctrl).toBe(true);
      expect(debugBinding?.pattern).toBe("d");

      const helpBinding = bindings.find(
        (b) => b.action.action === "toggleHelp"
      );
      expect(helpBinding?.modifiers.ctrl).toBe(true);
      expect(helpBinding?.modifiers.shift).toBe(true);
      expect(helpBinding?.pattern).toBe("h");
    });
  });
});
