/**
 * KeyBindingSystem - A pure functional approach to handling keyboard input
 *
 * This system is inspired by Haskell's type safety and pure functions to create
 * a more maintainable and predictable keyboard handling solution.
 *
 * The system uses a priority-based approach to handle conflicts between
 * multiple key bindings that could match the same input, ensuring a
 * predictable and customizable user experience.
 */
import { viewModes, type ViewMode } from "../core/types";

// ----------------
// Types
// ----------------

/**
 * Priority levels for resolving conflicts between multiple bindings
 * that match the same input key in the same context
 *
 * NOTE: Lower numbers mean higher priority
 */
export enum BindingPriority {
  /**
   * Highest priority: the binding's category exactly matches the current mode
   * Example: A 'project' binding when in 'project' mode
   */
  ExactModeMatch = 0,

  /**
   * Medium priority: global actions or non-view-specific actions in global mode
   * Example: A 'global' binding like quit, or a 'navigation' binding in global mode
   */
  GlobalAction = 1,

  /**
   * Lowest priority: other active bindings that don't fit above categories
   * Rarely used in practice due to how binding activation works
   */
  Fallback = 2,
}

/**
 * Represents a key binding with pattern, modifiers, and associated action
 */
export interface KeyBinding {
  /** The main key pattern (e.g., 'n', 'escape') */
  pattern: string;
  /** Whether this is a special key like 'space' or 'escape' */
  isSpecial: boolean;
  /** Key modifiers (ctrl, shift, meta) */
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    meta: boolean;
  };
  /** The action associated with this binding */
  action: {
    category: string;
    action: string;
    description: string;
  };
}

/**
 * Context in which key bindings are evaluated
 */
export interface KeyContext {
  /** Current application mode (global, projects, project, task) */
  mode: string;
  /** Current view being displayed (projects, project, task) */
  activeView: ViewMode;
}

/**
 * Raw keyboard input from the user
 */
export interface RawInput {
  /** Character input (e.g., 'n', '?') */
  input: string;
  /** Object containing key state information */
  key: {
    upArrow: boolean;
    downArrow: boolean;
    leftArrow: boolean;
    rightArrow: boolean;
    pageDown: boolean;
    pageUp: boolean;
    return: boolean;
    escape: boolean;
    ctrl: boolean;
    shift: boolean;
    tab: boolean;
    backspace: boolean;
    delete: boolean;
    meta: boolean;
    space: boolean;
    [key: string]: boolean;
  };
}

/**
 * A key pattern like "ctrl+shift+n" or "space"
 */
export type KeyPattern = string;

// Define custom types for clarity
export type Category = string;
export type Action = string;
export type Description = string;

// ----------------
// Pure Functions
// ----------------

/**
 * Parse a key pattern string into structured data
 * Handles formats like "ctrl+shift+n" or "space"
 *
 * @param pattern The key pattern string (e.g., "ctrl+shift+n")
 * @returns Parsed key pattern with modifiers and base key
 */
export function parseKeyPattern(pattern: KeyPattern) {
  // Set default values
  const result = {
    baseKey: "",
    isSpecial: false,
    modifiers: {
      ctrl: false,
      shift: false,
      meta: false,
    },
  };

  // Split by '+' to separate modifiers from the base key
  const parts = pattern.toLowerCase().split("+");

  // The last part is always the base key
  const baseKey = parts[parts.length - 1];

  // Check if it's a special key
  const specialKeys = [
    "space",
    "escape",
    "enter",
    "return",
    "tab",
    "uparrow",
    "downarrow",
    "leftarrow",
    "rightarrow",
    "pageup",
    "pagedown",
    "home",
    "end",
    "backspace",
    "delete",
  ];

  result.baseKey = baseKey;
  result.isSpecial = specialKeys.includes(baseKey);

  // Check for modifiers
  if (parts.length > 1) {
    // All parts except the last one are modifiers
    const modifiers = parts.slice(0, parts.length - 1);
    result.modifiers.ctrl = modifiers.includes("ctrl");
    result.modifiers.shift = modifiers.includes("shift");
    result.modifiers.meta = modifiers.includes("meta");
  }

  return result;
}

/**
 * Check if a key binding matches the given input
 *
 * @param binding The key binding to check
 * @param input Raw keyboard input from the user
 * @returns True if the binding matches the input
 */
export function matchesInput(binding: KeyBinding, input: RawInput): boolean {
  // Special keys are matched by their property in the key object
  if (binding.isSpecial) {
    // Maps our binding patterns to the key properties
    const specialKeyMap: Record<string, keyof RawInput["key"]> = {
      space: "space",
      escape: "escape",
      enter: "return",
      return: "return",
      tab: "tab",
      uparrow: "upArrow",
      downarrow: "downArrow",
      leftarrow: "leftArrow",
      rightarrow: "rightArrow",
      backspace: "backspace",
      delete: "delete",
    };

    const keyProperty = specialKeyMap[binding.pattern];
    if (!keyProperty || !input.key[keyProperty]) {
      return false;
    }
  } else {
    // For normal character keys, check the input string
    if (binding.pattern !== input.input.toLowerCase()) {
      return false;
    }
  }

  // Check modifiers
  if (binding.modifiers.ctrl && !input.key.ctrl) return false;
  if (binding.modifiers.shift && !input.key.shift) return false;
  if (binding.modifiers.meta && !input.key.meta) return false;

  return true;
}

/**
 * Determine if a binding should be active in the current context
 * Pure function that evaluates binding relevance
 */
export function isBindingActiveInContext(
  binding: KeyBinding,
  context: KeyContext
): boolean {
  const { category } = binding.action;
  const { mode, activeView } = context;

  // Case 1: Global category bindings are always active
  if (category === "global") {
    return true;
  }

  // Case 2: View category bindings (projects, project, task)
  // are active in two cases:
  // 1. When mode matches the category exactly
  // 2. When activeView matches the category (for view-specific actions)
  if (viewModes.includes(category as ViewMode)) {
    return mode === category || activeView === category;
  }

  // Case 3: Non-view categories (navigation, ui, etc.)
  // are active only in global mode
  return mode === "global";
}

/**
 * Calculate the priority of a binding in the current context
 * Returns null if the binding is not active in this context
 */
export function getBindingPriority(
  binding: KeyBinding,
  context: KeyContext
): BindingPriority | null {
  // First check if the binding is active in this context
  if (!isBindingActiveInContext(binding, context)) {
    return null;
  }

  const { category } = binding.action;
  const { mode, activeView } = context;

  // Global category bindings always get GlobalAction priority
  if (category === "global") {
    return BindingPriority.GlobalAction;
  }

  // PRIORITY 1: Exact mode match or exact activeView match for view categories
  if (
    category === mode ||
    (viewModes.includes(category as ViewMode) && category === activeView)
  ) {
    return BindingPriority.ExactModeMatch;
  }

  // PRIORITY 2: Non-view categories in global mode
  if (!viewModes.includes(category as ViewMode)) {
    return BindingPriority.GlobalAction;
  }

  // PRIORITY 3: Fallback for any other active bindings
  return BindingPriority.Fallback;
}

/**
 * Find the highest priority binding that matches the input in the context
 * Pure function that returns the best match based on priority rules
 */
export function findMatchingBinding(
  bindings: KeyBinding[],
  input: RawInput,
  context: KeyContext
): KeyBinding | null {
  // Get all matching bindings with their priorities
  const matchesWithPriority: Array<{
    binding: KeyBinding;
    priority: BindingPriority;
  }> = [];

  for (const binding of bindings) {
    if (matchesInput(binding, input)) {
      const priority = getBindingPriority(binding, context);
      if (priority !== null) {
        matchesWithPriority.push({ binding, priority });
      }
    }
  }

  // No matches found
  if (matchesWithPriority.length === 0) {
    return null;
  }

  // Sort by priority (lower number = higher priority) and return the best match
  matchesWithPriority.sort((a, b) => a.priority - b.priority);
  return matchesWithPriority[0].binding;
}

// ----------------
// Configuration Parser
// ----------------

/**
 * Convert the user config into our internal KeyBinding structure
 * Pure function that transforms configuration
 */
export function configToBindings(
  config: Record<Category, Record<Action, KeyPattern>>
): KeyBinding[] {
  const bindings: KeyBinding[] = [];

  Object.entries(config).forEach(([category, actions]) => {
    Object.entries(actions).forEach(([action, pattern]) => {
      const { baseKey, modifiers, isSpecial } = parseKeyPattern(pattern);

      bindings.push({
        pattern: baseKey,
        modifiers,
        isSpecial,
        action: {
          category,
          action,
          description: `${category}.${action}`,
        },
      });
    });
  });

  return bindings;
}
