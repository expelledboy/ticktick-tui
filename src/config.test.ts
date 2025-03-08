import { unlinkSync } from "node:fs";
import { test, expect } from "bun:test";
import { AppSettingsSchema } from "./types";
import { loadConfig } from "./config";

test("all AppSettingsSchema should have default values", () => {
  const settings = AppSettingsSchema.parse({});
  expect(settings).toBeDefined();
});

test("config should be a global variable", () => {
  expect(config).toBeDefined();
});

test("config on disk should override default values", () => {
  const configPath = "/tmp/ticktick-tui.config.json";
  const fileSettings = { theme: { primary: "#000000" } };

  Bun.write(configPath, JSON.stringify(fileSettings, null, 2));

  process.env.TICKTICK_CONFIG_PATH = configPath;
  const config = loadConfig();
  expect(config.theme.primary).toBe(fileSettings.theme.primary);

  // Cleanup
  unlinkSync(configPath);
});

test("environment variables should override config file", () => {
  process.env.TICKTICK_THEME_PRIMARY = "#111111";
  const config = loadConfig();
  expect(config.theme.primary).toBe("#111111");
});

test("environment variables should override config file", () => {
  const config = loadConfig(["--sync.interval=100"]);
  expect(config.sync.interval).toBe(100);
});
