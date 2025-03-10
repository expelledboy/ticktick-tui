import { z } from "zod";
import { keybindingsSchema } from "./schema";
import type { Key } from "ink";
import { parseKeybinding } from "./keyMatchingLogic";

// Extract TypeScript types from Zod schema
export type KeyBind = ReturnType<typeof parseKeybinding>;
export type KeyBindings = z.infer<typeof keybindingsSchema>;
export type ActionCategory = keyof KeyBindings;

// Key handler function type
export type KeyHandler = (input: string, key: Key) => void;

// Action handler function type
export type ActionHandler = (
  category: ActionCategory,
  action: string,
  data?: any
) => void;
