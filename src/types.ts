import { z } from "zod";
import * as schema from "./schema";

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
 * Application settings
 */

// prettier-ignore
export const AppSettingsSchema = z.object({
  // UI
  theme: z.object({
    primary: z.string().describe("Primary theme color"),
    secondary: z.string().describe("Secondary theme color"),
    accent: z.string().describe("Accent theme color"),
    error: z.string().describe("Error message color"),
    warning: z.string().describe("Warning message color"),
  }),
  
  pagination: z.object({
    pageSize: z.number().int().positive().describe("Number of items per page"),
  }),
  
  dateFormat: z.string().describe("Date display format pattern"),
  timeFormat: z.string().describe("Time display format pattern"),

  // Sync
  sync: z.object({
    interval: z.number().int().positive().describe("Milliseconds between automatic sync attempts"),
    retryDelay: z.number().int().positive().describe("Milliseconds to wait before retrying a failed sync"),
    maxRetries: z.number().int().nonnegative().describe("Maximum number of sync retry attempts"),
  }),

  // Keybindings
  keybindings: z.object({
    toggleSidebar: z.string().default("ctrl+p").describe("Shortcut for toggling the projects sidebar"),
    scrollTaskDown: z.string().default("j").describe("Scroll down within task list"),
    scrollTaskUp: z.string().default("k").describe("Scroll up within task list"),
    scrollProjectDown: z.string().default("ctrl+n").describe("Scroll to next project"),
    scrollProjectUp: z.string().default("ctrl+p").describe("Scroll to previous project"),
    completeTask: z.string().default("c").describe("Mark current task as complete"),
    moveTaskDown: z.string().default("ctrl+j").describe("Move task down in the list"),
    moveTaskUp: z.string().default("ctrl+k").describe("Move task up in the list"),
    addTask: z.string().default("a").describe("Add a new task"),
    exitProgram: z.string().default("q").describe("Exit the program"),
    editTaskTitle: z.string().default("i").describe("Edit the task title"),
    editTaskProperties: z.string().default("e").describe("Edit task other properties"),
    search: z.string().default("/").describe("Start search"),
    toggleGlobalSearch: z.string().default("ctrl+g").describe("Toggle global search"),
    switchToLogs: z.string().default("ctrl+l").describe("Switch to logs mode"),
    switchToDebug: z.string().default("ctrl+d").describe("Switch to debug mode"),
  }),

  // Services
  services: z.object({
    ticktickUri: z.string().url().describe("Base URI for TickTick API service"),
  }),

  // Storage
  storage: z.object({
    config: z.string().default("~/.config/ticktick-sync/config.json").describe("Path to the configuration file"),
    credentials: z.string().default("~/.config/ticktick-sync/credentials.json").describe("Path to the credentials file"),
    logs: z.string().default("/var/log/ticktick-sync.log").describe("Path to the logs file"),
    cache: z.string().default("~/.cache/ticktick-sync/cache.json").describe("Path to the cache file"),
  }),
});

// Use type inference from the schema
export type AppSettings = z.infer<typeof AppSettingsSchema>;

/**
 * Application state
 */

export enum AppMode {
  CLI = "cli", // Command-line interface mode
  TUI = "tui", // Terminal UI mode
  DAEMON = "daemon", // Background sync daemon mode
}

export type AppState = {
  mode: AppMode;
  settings: AppSettings;
  syncStatus: SyncStatus;
  projects: Project[];
  tasks: Task[];
};
