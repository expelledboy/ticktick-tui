// Primary hooks
export { useKeyHandler } from "./useKeyHandler";

// UI Components
export { default as KeyBindingsHelp } from "./KeyBindingsHelp";
export { default as CompactKeyBindingsHelp } from "./CompactKeyBindingsHelp";

// Core system exports
export {
  BindingPriority,
  type KeyBinding,
  type KeyContext,
  type RawInput,
  type Category,
  type Action,
  type KeyPattern,
  findMatchingBinding,
  getBindingPriority,
  isBindingActiveInContext,
  configToBindings,
  parseKeyPattern,
  matchesInput,
} from "./KeyBindingSystem";

// Config exports
import { z } from "zod";
import { keybindingsSchema } from "./schema";
export type KeyBindings = z.infer<typeof keybindingsSchema>;

// Utilities
export { getBindingPriorities } from "./utils";

// Handler types
export type ActionHandler = (
  category: string,
  action: string,
  data?: any
) => void;

export type KeyHandler = (input: string, key: import("ink").Key) => void;
