import { z } from "zod";
import * as schema from "./schema";
import path from "node:path";

/**
 * Type definitions for the TickTick API
 */

export type Project = z.infer<typeof schema.ProjectSchema>;
export type Task = z.infer<typeof schema.TaskSchema>;
export type ChecklistItem = z.infer<typeof schema.ChecklistItemSchema>;
export type Column = z.infer<typeof schema.ColumnSchema>;
export type ProjectData = z.infer<typeof schema.ProjectDataSchema>;

/**
 * OAuth credentials
 */

export type AuthCredentials = {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  tokens?: OAuth2Tokens;
};

export type OAuth2Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

/**
 * Sync status
 */

export type SyncStatus = {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
};

/**
 * Transforms paths to be absolute, replacing ~ with the HOME directory
 */
const transformPaths = (paths: Record<string, string>) => {
  const home = process.env.HOME;
  if (!home) throw new Error("HOME environment variable is not set");
  return Object.fromEntries(
    Object.entries(paths).map(([key, path]) => [key, path.replace("~", home)])
  );
};

/**
 * Application settings
 */

// prettier-ignore
export const AppSettingsSchema = z.object({
  // UI
  theme: z.object({
    primary: z.string().default("#4A90E2").describe("Primary theme color"),
    secondary: z.string().default("#6B7280").describe("Secondary theme color"),
    accent: z.string().default("#10B981").describe("Accent theme color"),
    error: z.string().default("#EF4444").describe("Error message color"),
    warning: z.string().default("#F59E0B").describe("Warning message color"),
  }).default({}),
  
  pagination: z.object({
    pageSize: z.number().int().positive().default(20).describe("Number of items per page"),
  }).default({}),
  
  dateFormat: z.string().default("yyyy-MM-dd").describe("Date display format pattern"),
  timeFormat: z.string().default("HH:mm").describe("Time display format pattern"),

  // Sync
  sync: z.object({
    interval: z.number().int().positive().default(300000).describe("Milliseconds between automatic sync attempts"),
    retryDelay: z.number().int().positive().default(60000).describe("Milliseconds to wait before retrying a failed sync"),
    maxRetries: z.number().int().nonnegative().default(3).describe("Maximum number of sync retry attempts"),
  }).default({}),

  // Keybindings
  keybindings: z.object({
    // Task navigation
    navUp: z.string().default("k").describe("Navigate up"),
    navDown: z.string().default("j").describe("Navigate down"),
    navLeft: z.string().default("h").describe("Navigate left"),
    navRight: z.string().default("l").describe("Navigate right"),
    // UI control
    toggleSidebar: z.string().default("ctrl+p").describe("Shortcut for toggling the projects sidebar"),
    exitProgram: z.string().default("q").describe("Exit the program"),
    // Task actions
    addTask: z.string().default("a").describe("Add a new task"),
    completeTask: z.string().default("c").describe("Mark current task as complete"),
    moveTaskDown: z.string().default("ctrl+j").describe("Move task down in the list"),
    moveTaskUp: z.string().default("ctrl+k").describe("Move task up in the list"),
    editTaskTitle: z.string().default("i").describe("Edit the task title"),
    editTaskProperties: z.string().default("e").describe("Edit task other properties"),
    // Search
    search: z.string().default("/").describe("Start search"),
    toggleGlobalSearch: z.string().default("ctrl+g").describe("Toggle global search"),
    // Debug
    switchToLogs: z.string().default("ctrl+l").describe("Switch to logs mode"),
    switchToDebug: z.string().default("ctrl+d").describe("Switch to debug mode"),
  }).default({}),

  // Services
  services: z.object({
    ticktickUri: z.string().url().default("https://api.ticktick.com/open/v1").describe("Base URI for TickTick API service"),
  }).default({}),

  // Storage
  storage: z.object({
    config: z.string().default("~/.config/ticktick-tui/config.json").describe("Path to the configuration file"),
    credentials: z.string().default("~/.config/ticktick-tui/credentials.json").describe("Path to the credentials file"),
    logs: z.string().default("~/.cache/ticktick-tui/logs.log").describe("Path to the logs file"),
    cache: z.string().default("~/.cache/ticktick-tui/cache.json").describe("Path to the cache file"),
  })
    .default({})
    .transform(transformPaths),
});

// Use type inference from the schema
export type AppSettings = z.infer<typeof AppSettingsSchema>;
