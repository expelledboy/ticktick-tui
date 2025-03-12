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

    test("view category bindings are active when either mode or view match the category", () => {
      // Projects binding (a view category)
      const projectsBinding = createKeyBinding("projects", "new", "n");

      // Test with exact matches
      const exactContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };
      expect(isBindingActiveInContext(projectsBinding, exactContext)).toBe(
        true
      );

      // Test in mismatched context but with activeView matching category
      const mismatchContext: KeyContext = {
        mode: "projects",
        activeView: "project",
      };
      // Now this should be true because either mode or activeView can match
      expect(isBindingActiveInContext(projectsBinding, mismatchContext)).toBe(
        true
      );

      // Test with mode matching but activeView not matching
      const modeMismatchContext: KeyContext = {
        mode: "global",
        activeView: "projects",
      };
      expect(
        isBindingActiveInContext(projectsBinding, modeMismatchContext)
      ).toBe(true);

      // Test with neither matching
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
      const bindings = [
        createKeyBinding("global", "cancel", "q"),
        createKeyBinding("projects", "newProject", "n"),
        createKeyBinding("project", "newTask", "n"),
      ];

      const input = createRawInput("n");

      // In an exact match context, the view-specific binding should win
      const exactMatchContext: KeyContext = {
        mode: "projects",
        activeView: "projects",
      };

      const result1 = findMatchingBinding(bindings, input, exactMatchContext);
      expect(result1?.action.category).toBe("projects");
      expect(result1?.action.action).toBe("newProject");

      // In a global context but with activeView=projects, the projects binding should win due to our new priority rule
      const globalContext: KeyContext = {
        mode: "global",
        activeView: "projects",
      };

      const result2 = findMatchingBinding(bindings, input, globalContext);
      expect(result2?.action.category).toBe("projects");
      expect(result2?.action.action).toBe("newProject");

      // In a completely different context, no binding should match
      const noMatchContext: KeyContext = {
        mode: "global",
        activeView: "task",
      };

      const result3 = findMatchingBinding(bindings, input, noMatchContext);
      expect(result3).toBeNull();
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
