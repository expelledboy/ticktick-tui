import { describe, test, expect, beforeEach } from "bun:test";
import { setupTestData, press } from "../../tests/utils";
import { createTestHelper } from "../../tests/testhelper";
import { useAppStore } from "../store";
import { App, byeMsg } from "./App";

// NOTE: Should only be testing the very high level functionality
//       Do more focused tests in the respective screen test files

describe("App", () => {
  let app: ReturnType<typeof createTestHelper>;

  beforeEach(async () => {
    // Reset mocks and app state before each test
    setupTestData();
    useAppStore.getState().reset();
    app = createTestHelper(<App />);
    await app.waitForQueryStatus(["projects"], "success");
  });

  test("renders the app", async () => {
    expect(app.lastFrame()).toContain("Projects");
  });

  test("toggle projects panel", async () => {
    app.press("ctrl_p");
    expect(app.lastFrame()).not.toContain("Projects");
  });

  // TODO: When we disable logs by default this will fail
  test("toggle logs panel", async () => {
    app.press("ctrl_l");

    await app.waitForCondition(200, () => !app.lastFrame().includes("Logs"));
  });

  test.skip("toggle debug panel", async () => {
    app.press("ctrl_d");

    await app.waitForCondition(500, () =>
      app.lastFrame().includes("Debug (Developer Tool)")
    );
  });

  test.skip("toggle help panel", async () => {
    app.press("?");

    await app.waitForCondition(500, () =>
      app.lastFrame().includes("Priority:")
    );
  });

  test("quit application", async () => {
    app.press("q");

    await app.waitForCondition(200, () => app.lastFrame().includes(byeMsg));
  });
});
