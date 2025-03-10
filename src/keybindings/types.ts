import { z } from "zod";
import { keybindingsSchema } from "./schema";

// Extract TypeScript types from Zod schema
export type KeyBindings = z.infer<typeof keybindingsSchema>;
export type ActionCategory = keyof KeyBindings;

// Key object type
export interface Key {
  name?: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  [key: string]: any;
}

// Default empty key
export const emptyKey: Key = {
  name: undefined,
  ctrl: false,
  shift: false,
  meta: false,
};

// Key handler function type
export type KeyHandler = (input: string, key: Key) => void;

// Action handler function type
export type ActionHandler = (
  category: ActionCategory,
  action: string,
  data?: any
) => void;
