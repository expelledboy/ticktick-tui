import type { Key } from "ink";
import { getAllKeybindings } from "./config";
import {
  configToBindings,
  getBindingPriority,
  type KeyContext,
  BindingPriority,
} from "./KeyBindingSystem";

export const emptyKey: Key & { space: boolean } = {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  pageDown: false,
  pageUp: false,
  return: false,
  escape: false,
  ctrl: false,
  shift: false, // XXX: For some reason, shift is always true
  tab: false,
  backspace: false,
  delete: false,
  meta: false,
  space: false,
};

// Format key for display
export function formatKeyBinding(key: string): string {
  return key
    .replace(/ctrl\+/i, "Ctrl+")
    .replace(/shift\+/i, "Shift+")
    .replace(/meta\+/i, "Meta+")
    .replace(/escape/i, "Esc")
    .replace(/enter/i, "Enter")
    .replace(/space/i, "Space")
    .replace(/uparrow/i, "↑")
    .replace(/downarrow/i, "↓")
    .replace(/leftarrow/i, "←")
    .replace(/rightarrow/i, "→");
}

/**
 * Get priority information for all keybindings in the current context
 * This helps UI components display which bindings are active and with what priority
 *
 * @param context Current key context (mode and active view)
 * @returns Mapping of category/action to priority information
 */
export function getBindingPriorities(context: KeyContext): Record<
  string,
  {
    priority: BindingPriority | null;
    active: boolean;
  }
> {
  // Convert config to bindings
  const bindings = configToBindings(getAllKeybindings() as any);

  // Create result map
  const result: Record<
    string,
    { priority: BindingPriority | null; active: boolean }
  > = {};

  // Process each binding
  bindings.forEach((binding) => {
    const { category, action } = binding.action;
    const key = `${category}.${action}`;

    // Get priority for this binding in the current context
    const priority = getBindingPriority(binding, context);

    // Add to result
    result[key] = {
      priority,
      active: priority !== null,
    };
  });

  return result;
}
