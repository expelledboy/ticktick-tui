import { z } from "zod";
import * as schema from "../ticktick/schema";

/**
 * Sort order for project view
 */
export const sortOrder = ["priority", "dueDate", "default"] as const;
export type SortOrder = (typeof sortOrder)[number];

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
 * View modes
 *
 * These are tightly coupled with the keybindings
 */
export const viewModes = ["projects", "project", "task"] as const;
export type ViewMode = (typeof viewModes)[number];

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

  // Services
  services: z.object({
    ticktickUri: z.string().url().default("https://api.ticktick.com/open/v1").describe("Base URI for TickTick API service"),
  }).default({}),

  // Views
  views: z.object({
    orderBy: z.enum(sortOrder).default("priority").describe("Default order by field for project view"),
  }).default({}),

  // Storage
  storage: z.object({
    config: z.string().default("~/.config/ticktick-tui/config.json").describe("Path to the configuration file"),
    keybindings: z.string().default("~/.config/ticktick-tui/keybindings.json").describe("Path to the keybindings file"),
    credentials: z.string().default("~/.config/ticktick-tui/credentials.json").describe("Path to the credentials file"),
    logs: z.string().default("~/.cache/ticktick-tui/logs.log").describe("Path to the logs file"),
    cache: z.string().default("~/.cache/ticktick-tui/cache.json").describe("Path to the cache file"),
    keylogger: z.string().default("~/.cache/ticktick-tui/keylogger.json").describe("Path to the keylogger file"),
  })
    .default({})
    .transform(transformPaths),
});

// Use type inference from the schema
export type AppSettings = z.infer<typeof AppSettingsSchema>;
